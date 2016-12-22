#!/usr/bin/env node

/**
 * This file generates an index of proptypes by component displayname, slug and folder name
 */

const fs = require( 'fs' ),
	path = require( 'path' ),
	async = require( 'async' ),
	reactDocgen = require( 'react-docgen' ),
	root = path.dirname( path.join( __dirname, '..', '..' ) );

/**
 * Converts a camel cased string into a slug
 * @param {String} name The camel cased string to slugify
 * @return {String}
 */
const camelCaseToSlug = ( name ) => {
	if ( ! name ) {
		return name;
	}

	return name
		.replace( /\.?([A-Z])/g, ( x, y ) => '-' + y.toLowerCase() )
		.replace( /^-/, '' );
};

/**
 * Wraps fs.readFile in a Promise
 * @param {string} filePath The path to of the file to read
 * @return {string} The file contents
 */
const readFile = ( filePath ) => {
	return fs.readFileSync( filePath, { encoding: 'utf8' } );
};

/**
 * Calculates a filepath's include path and begins reading the file for parsing
 * Calls back with null, if an error occurs or an object if it succeeds
 * @param {string} filePath The path to read
 */
const processFile = ( filePath ) => {
	const filename = path.basename( filePath );
	const includePath = new RegExp(`^client\/(.*?)\/${ filename }$`);
	try {
		const usePath = path.isAbsolute( filePath ) ? filePath : path.join( process.cwd(), filePath );
		const document = readFile( usePath );
		return {
			document,
			includePath: includePath.exec( filePath )[1]
		};
	} catch ( error ) {
		console.log(`Skipping ${ filePath } due to fs error: ${ error }`);
	}
	return null;
};

/**
 * Given a processed file object, parses the file for proptypes and calls the callback
 * Calls back with null on any error, or a parsed object if it succeeds
 * @param {Object} docObj The processed document object
 */
const parseDocument = ( docObj ) => {
	try {
		const parsed = reactDocgen.parse( docObj.document );
		parsed.includePath = docObj.includePath;
		if ( parsed.displayName ) {
			parsed.slug = camelCaseToSlug( parsed.displayName );
		}
		return parsed;
	} catch ( error ) {
		// skipping, probably because the file couldn't be parsed for many reasons (there are lots of them!)
		return null;
	}
};

/**
 * Creates an index of the files
 * @param {Array} parsed
 * @return {{data: Array, index: {displayName: {}, slug: {}, includePath: {}}}}
 */
const createIndex = ( parsed ) => {
	return parsed.filter( ( component ) => {
		if ( ! component ) {
			return false;
		}

		const displayName = component.displayName;

		return ! ( displayName === undefined || displayName === '' );
	} );
};

/**
 * Write the file
 * @param {Object} contents The contents of the file
 */
const writeFile = ( contents ) => {
	fs.writeFileSync( path.join( root, 'server/devdocs/proptypes-index.json' ), JSON.stringify( contents ) );
};

const main = ( () => {
	const fileList = process
		.argv
		.splice( 2, process.argv.length )
		.map( ( fileWithPath ) => {
			return fileWithPath.replace( /^\.\//, '' );
		} );

	if ( fileList.length === 0 ) {
		process.stderr.write( 'You must pass a list of files to process' );
		process.exit( 1 );
	}

	const documents = createIndex(
		fileList
			.map( processFile )
			.map( parseDocument )
	);
	writeFile( documents );
} )();
