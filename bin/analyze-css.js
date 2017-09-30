#!/usr/bin/env node

/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const fs = require( 'fs-extra' );
const path = require( 'path' );

const PROJECT_DIRECTORY = path.resolve( __dirname, '..' );
const TEMP_DIRECTORY = path.resolve( PROJECT_DIRECTORY, 'temp' );
const DEBUG_BUNDLE = path.join( TEMP_DIRECTORY, 'styles.debug.css' );

console.log( `> Cleaning up ${ TEMP_DIRECTORY } directory` );

fs.removeSync( TEMP_DIRECTORY );

console.log( '> Generating CSS bundle with source comments' );

execSync( `node_modules/node-sass/bin/node-sass --include-path client --source-comments assets/stylesheets/style.scss ${ DEBUG_BUNDLE }` );

console.log( '> Opening CSS bundle' );

const bundle = fs.readFileSync( DEBUG_BUNDLE, 'utf8' );

console.log( '> Consolidating CSS' );

const fragments = bundle.split( /\/\* line \d+, /g ).slice( 1 );

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

const normalizePath = ( file ) => {
	let newFile = file.replace( '.scss', '.css' );

	if ( file.startsWith( '/' ) ) {
		newFile = newFile.replace( PROJECT_DIRECTORY, '' );
	}

	return path.join( TEMP_DIRECTORY, newFile );
};

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
