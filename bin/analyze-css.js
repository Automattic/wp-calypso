#!/usr/bin/env node

/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const fs = require( 'fs-extra' );
const glob = require( 'glob' );
const path = require( 'path' );

/**
 * Constants
 */
const PROJECT_DIRECTORY = path.resolve( __dirname, '..' );
const TEMP_DIRECTORY = path.resolve( PROJECT_DIRECTORY, 'temp' );
const DEBUG_BUNDLE = path.join( TEMP_DIRECTORY, 'assets', 'stylesheets', 'style.css' );
const NODE_SASS = path.join( PROJECT_DIRECTORY, 'node_modules', 'node-sass', 'bin', 'node-sass' );

/**
 * Functions
 */
const extractRuleFromFragment = ( fragment ) => {
	const lines = fragment.split( '\n' );

	return lines.map( line => {
		// Gets rid of comments such as:
		//   /* [...] */
		//   -------------------------------------------------------------- */
		//   */
		return line.replace( /^[-\s]*\*\/|.*\/?\*.*\*\//, '' );
	} ).reduce( ( result, line ) => {
		const source = line.match( /(.*) \*\// );

		if ( source ) {
			if ( result.file ) {
				console.error( `Unable to parse line '${ line }'` );

				return result;
			} else {
				const [ , file ] = source;

				return Object.assign( result, { file } );
			}
		} else {
			const content = result.content + `\n${ line }`;

			return Object.assign( result, { content: content.trim() } );
		}
	}, { content: '' } );
};

const generateCSS = ( files, withComments = false ) => {
	files.forEach( file => {
		const input = path.join( PROJECT_DIRECTORY, 'assets', 'stylesheets', file );
		let output = path.join( TEMP_DIRECTORY, 'assets', 'stylesheets' );

		if ( !file.includes( '.' ) ) {
			output = path.join( output, file );
		}

		const options = [
			'--include-path client',
			`--output ${ output }`,
			'--quiet'
		];

		if ( withComments ) {
			options.push( '--source-comments' );
		}

		execSync( `${ NODE_SASS } ${ options.join( ' ' ) } ${ input }` );
	} );
};

const normalizePath = ( file ) => {
	let newFile = file.replace( '.scss', '.css' );

	if ( path.isAbsolute( file ) ) {
		newFile = newFile.replace( PROJECT_DIRECTORY, '' );
	}

	return path.join( TEMP_DIRECTORY, newFile );
};

console.log( `> Cleaning up ${ TEMP_DIRECTORY } directory` );

fs.removeSync( TEMP_DIRECTORY );

console.log( '> Generating CSS from SASS' );

generateCSS( [
	'directly.scss',
	'editor.scss',
	'sections'
] );

generateCSS( [ 'style.scss' ], true );

console.log( '> Autoprefixing CSS' );

glob.sync( '**/*.css', { cwd: TEMP_DIRECTORY } ).forEach( file => {
	execSync( `npm run --silent autoprefixer -- ${ file }` );
} );

console.log( '> Opening CSS bundle' );

const bundle = fs.readFileSync( DEBUG_BUNDLE, 'utf8' );

console.log( '> Parsing CSS bundle' );

const fragments = bundle.split( /\/\* line \d+, /g ).slice( 1 );

const rules = fragments.reduce( ( result, fragment ) => {
	const rule = extractRuleFromFragment( fragment );

	const file = normalizePath( rule.file );

	let content = rule.content;

	if ( result.has( file ) ) {
		content = result.get( file ) + '\n\n' + content;
	}

	return result.set( file, content );
}, new Map() );

console.log( '> Generating CSS files' );

rules.forEach( ( content, file ) => {
	fs.ensureFileSync( file );
	fs.writeFileSync( file, content );
} );
