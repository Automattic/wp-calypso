/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { uniq, isObject, omit, startsWith, get } from 'lodash';
import { format } from 'util';

/**
 * WordPress dependencies
 */
import { getBlockTypes, parse, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { registerCoreBlocks } from '../';
import { parse as grammarParse } from '../../blocks/api/post.pegjs';

const fixturesDir = path.join( __dirname, 'fixtures' );

// We expect 4 different types of files for each fixture:
//  - fixture.html            : original content
//  - fixture.parsed.json     : parser output
//  - fixture.json            : blocks structure
//  - fixture.serialized.html : re-serialized content
// Get the "base" name for each fixture first.
const fileBasenames = uniq(
	fs.readdirSync( fixturesDir )
		.filter( ( f ) => /(\.html|\.json)$/.test( f ) )
		.map( ( f ) => f.replace( /\..+$/, '' ) )
);

function readFixtureFile( filename ) {
	try {
		return fs.readFileSync(
			path.join( fixturesDir, filename ),
			'utf8'
		);
	} catch ( err ) {
		return null;
	}
}

function writeFixtureFile( filename, content ) {
	fs.writeFileSync(
		path.join( fixturesDir, filename ),
		content
	);
}

function normalizeReactTree( element ) {
	if ( Array.isArray( element ) ) {
		return element.map( ( child ) => normalizeReactTree( child ) );
	}

	// Check if we got an object first, then if it actually has a `type` like a
	// React component.  Sometimes we get other stuff here, which probably
	// indicates a bug.
	if ( isObject( element ) && element.type && element.props ) {
		const toReturn = {
			type: element.type,
		};
		const attributes = omit( element.props, 'children' );
		if ( Object.keys( attributes ).length ) {
			toReturn.attributes = attributes;
		}
		if ( element.props.children ) {
			toReturn.children = normalizeReactTree( element.props.children );
		}
		return toReturn;
	}

	return element;
}

function normalizeParsedBlocks( blocks ) {
	return blocks.map( ( block, index ) => {
		// Clone and remove React-instance-specific stuff; also, attribute
		// values that equal `undefined` will be removed
		block = JSON.parse( JSON.stringify( block ) );

		// Change unique UIDs to a predictable value
		block.uid = '_uid_' + index;

		// Walk each attribute and get a more concise representation of any
		// React elements
		for ( const k in block.attributes ) {
			block.attributes[ k ] = normalizeReactTree( block.attributes[ k ] );
		}

		// Recurse to normalize inner blocks
		block.innerBlocks = normalizeParsedBlocks( block.innerBlocks );

		return block;
	} );
}

describe( 'full post content fixture', () => {
	beforeAll( () => {
		window._wpBlocks = require( './server-registered.json' );

		// Load all hooks that modify blocks
		require( 'editor/hooks' );
		registerCoreBlocks();
	} );

	fileBasenames.forEach( ( f ) => {
		it( f, () => {
			const content = readFixtureFile( f + '.html' );
			if ( content === null ) {
				throw new Error(
					'Missing fixture file: ' + f + '.html'
				);
			}

			const parserOutputActual = grammarParse( content );
			let parserOutputExpectedString = readFixtureFile( f + '.parsed.json' );

			if ( ! parserOutputExpectedString ) {
				if ( process.env.GENERATE_MISSING_FIXTURES ) {
					parserOutputExpectedString = JSON.stringify(
						parserOutputActual,
						null,
						4
					) + '\n';
					writeFixtureFile( f + '.parsed.json', parserOutputExpectedString );
				} else {
					throw new Error(
						'Missing fixture file: ' + f + '.parsed.json'
					);
				}
			}

			const parserOutputExpected = JSON.parse( parserOutputExpectedString );
			try {
				expect(
					parserOutputActual
				).toEqual( parserOutputExpected );
			} catch ( err ) {
				throw new Error( format(
					'File \'%s.parsed.json\' does not match expected value:\n\n%s',
					f,
					err.message
				) );
			}

			const blocksActual = parse( content );

			// Block validation logs during deprecation migration. Since this
			// is expected for deprecated blocks, match on filename and allow.
			const isDeprecated = /__deprecated([-_]|$)/.test( f );
			if ( isDeprecated ) {
				// eslint-disable-next-line no-console
				console.warn.mockReset();
				expect( console ).toHaveErrored();
			}

			const blocksActualNormalized = normalizeParsedBlocks( blocksActual );
			let blocksExpectedString = readFixtureFile( f + '.json' );

			if ( ! blocksExpectedString ) {
				if ( process.env.GENERATE_MISSING_FIXTURES ) {
					blocksExpectedString = JSON.stringify(
						blocksActualNormalized,
						null,
						4
					) + '\n';
					writeFixtureFile( f + '.json', blocksExpectedString );
				} else {
					throw new Error(
						'Missing fixture file: ' + f + '.json'
					);
				}
			}

			const blocksExpected = JSON.parse( blocksExpectedString );
			try {
				expect(
					blocksActualNormalized
				).toEqual( blocksExpected );
			} catch ( err ) {
				throw new Error( format(
					'File \'%s.json\' does not match expected value:\n\n%s',
					f,
					err.message
				) );
			}

			// `serialize` doesn't have a trailing newline, but the fixture
			// files should.
			const serializedActual = serialize( blocksActual ) + '\n';
			let serializedExpected = readFixtureFile( f + '.serialized.html' );

			if ( ! serializedExpected ) {
				if ( process.env.GENERATE_MISSING_FIXTURES ) {
					serializedExpected = serializedActual;
					writeFixtureFile( f + '.serialized.html', serializedExpected );
				} else {
					throw new Error(
						'Missing fixture file: ' + f + '.serialized.html'
					);
				}
			}

			try {
				expect( serializedActual ).toEqual( serializedExpected );
			} catch ( err ) {
				throw new Error( format(
					'File \'%s.serialized.html\' does not match expected value:\n\n%s',
					f,
					err.message
				) );
			}
		} );
	} );

	it( 'should be present for each block', () => {
		const errors = [];

		getBlockTypes().map( ( block ) => block.name ).forEach( ( name ) => {
			const nameToFilename = name.replace( /\//g, '__' );
			const foundFixtures = fileBasenames
				.filter( ( basename ) => (
					basename === nameToFilename ||
					startsWith( basename, nameToFilename + '__' )
				) )
				.map( ( basename ) => {
					// The file that contains the input HTML for this test.
					const inputFilename = basename + '.html';
					// The parser output for this test.  For missing files,
					// JSON.parse( null ) === null.
					const parserOutput = JSON.parse(
						readFixtureFile( basename + '.json' )
					);
					// The name of the first block that this fixture file
					// contains (if any).
					const firstBlock = get( parserOutput, [ '0', 'name' ], null );
					return {
						filename: inputFilename,
						parserOutput,
						firstBlock,
					};
				} )
				.filter( ( fixture ) => fixture.parserOutput !== null );

			if ( ! foundFixtures.length ) {
				errors.push( format(
					'Expected a fixture file called \'%s.html\' or \'%s__*.html\'.',
					nameToFilename,
					nameToFilename
				) );
			}

			foundFixtures.forEach( ( fixture ) => {
				if ( name !== fixture.firstBlock ) {
					errors.push( format(
						'Expected fixture file \'%s\' to test the \'%s\' block.',
						fixture.filename,
						name
					) );
				}
			} );
		} );

		if ( errors.length ) {
			throw new Error(
				'Problem(s) with fixture files:\n\n' + errors.join( '\n' )
			);
		}
	} );
} );
