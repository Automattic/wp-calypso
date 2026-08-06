import fs from 'fs';
import path from 'path';
import { describe, expect, test } from '@jest/globals';
import { TEST_ACCOUNT_NAMES } from '../secrets';

const teamCityRoot = path.resolve( __dirname, '../../../../.teamcity' );
const paramPattern = /param\(\s*"env\.AUTHENTICATE_ACCOUNTS"/g;
const constPattern = /const val (\w+)\s*=\s*"([^"]*)"/g;

/**
 * Recursively lists the TeamCity Kotlin DSL files.
 */
function getKotlinFiles( directory: string ): string[] {
	return fs.readdirSync( directory, { withFileTypes: true } ).flatMap( ( entry ) => {
		const fullPath = path.join( directory, entry.name );

		if ( entry.isDirectory() ) {
			return entry.name === 'target' ? [] : getKotlinFiles( fullPath );
		}

		return fullPath.endsWith( '.kt' ) ? [ fullPath ] : [];
	} );
}

/**
 * Returns the text of the `param()` call the given offset sits inside, so a value spanning
 * several lines, or picked by a conditional, is read whole.
 */
function getEnclosingArguments( source: string, start: number ): string {
	let depth = 1;

	for ( let index = start; index < source.length; index++ ) {
		if ( source[ index ] === '(' ) {
			depth++;
		} else if ( source[ index ] === ')' && --depth === 0 ) {
			return source.slice( start, index );
		}
	}

	return source.slice( start );
}

/**
 * Returns every account list AUTHENTICATE_ACCOUNTS can be set to in TeamCity, keyed by the
 * file and line it is set on. A conditional contributes one entry per branch, and a value
 * given as a Kotlin constant is resolved to the string.
 */
function getConfiguredAccountLists(): Map< string, string > {
	const sources = getKotlinFiles( teamCityRoot ).map(
		( file ) => [ file, fs.readFileSync( file, 'utf8' ) ] as const
	);

	const constants = new Map< string, string >();
	for ( const [ , source ] of sources ) {
		for ( const [ , name, value ] of source.matchAll( constPattern ) ) {
			constants.set( name, value );
		}
	}

	const lists = new Map< string, string >();
	for ( const [ file, source ] of sources ) {
		for ( const match of source.matchAll( paramPattern ) ) {
			const args = getEnclosingArguments( source, match.index + match[ 0 ].length );
			const values = [
				...[ ...args.matchAll( /"([^"]*)"/g ) ].map( ( literal ) => literal[ 1 ] ),
				...[ ...args.matchAll( /\b(\w+)\b/g ) ]
					.filter( ( identifier ) => constants.has( identifier[ 1 ] ) )
					.map( ( identifier ) => constants.get( identifier[ 1 ] ) as string ),
			];
			const line = source.slice( 0, match.index ).split( '\n' ).length;
			const location = `${ path.relative( teamCityRoot, file ) }:${ line }`;

			if ( ! values.length ) {
				// Reading nothing would pass this file silently, so name the parameter the
				// patterns above could not read rather than leaving a bisect to the reader.
				throw new Error( `Could not read the AUTHENTICATE_ACCOUNTS value at ${ location }` );
			}
			values.forEach( ( value, index ) =>
				lists.set( values.length > 1 ? `${ location } [${ index }]` : location, value )
			);
		}
	}

	return lists;
}

describe( 'AUTHENTICATE_ACCOUNTS build parameters', function () {
	const lists = getConfiguredAccountLists();

	test( 'are set on at least one build type', function () {
		expect( lists.size ).toBeGreaterThan( 0 );
	} );

	test.each( [ ...lists ] )( '%s names only known accounts, once each', function ( _, value ) {
		// An unknown name makes the whole list unusable at run time, and a repeat reads as
		// two accounts while priming logs in once, so the count in the build log won't match.
		const names = value ? value.split( ',' ) : [];

		expect( names.filter( ( name ) => ! TEST_ACCOUNT_NAMES.includes( name as never ) ) ).toEqual(
			[]
		);
		expect( names ).toEqual( [ ...new Set( names ) ] );
	} );
} );
