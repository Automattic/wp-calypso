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
 * @return {Promise} The promise that the file will be read
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
		return parsed;
	} catch ( error ) {
		// skipping, probably because the file couldn't be parsed for many reasons (there are lots of them!)
		return null;
	}
};

/**
 * Causes a side effect in `index`. Unconditionally appends `currentIndex` to `index[ name ]`, even if
 * `index[ name ]` is undefined
 * @param {string} name The index of `index`
 * @param {Number} currentIndex The current index to append to `index`
 * @param {Array} index The array to apply side effects to
 */
const applyIndex = ( name, currentIndex, index ) => {
	index[ name ] = [ currentIndex ].concat( index[ name ] || [] );
};

/**
 * Sort an object keys alphabetically
 * @param {Object} obj The object whose keys are to be sorted
 * @return {Object} The sorted object
 */
const sortObjectByPropertyName = (obj) => {
	return Object.keys( obj )
		.sort()
		.reduce( ( accumulator, current ) => {
			accumulator[ current ] = obj[ current ];
			return accumulator;
		}, {});
};

/**
 * Creates an index of the files
 * @param {Array} parsed
 * @return {{data: Array, index: {displayName: {}, slug: {}, includePath: {}}}}
 */
const createIndex = ( parsed ) => {
	const final = {
		data: [],
		index: {
			displayName: {},
			includePath: {},
			slug: {}
		}
	};

	let currentIndex = 0;
	parsed.forEach( ( component ) => {
		if ( ! component ) {
			return;
		}

		const displayName = component.displayName;
		const slug = camelCaseToSlug( displayName );
		const includePath = component.includePath;

		if ( displayName === undefined || displayName === '' ) {
			return;
		}

		final.data[ currentIndex ] = component;
		applyIndex( displayName, currentIndex, final.index.displayName );
		applyIndex( slug, currentIndex, final.index.slug );
		applyIndex( includePath, currentIndex, final.index.includePath );

		currentIndex++;
	} );

	// for human readability, not strictly necessary
	final.index.displayName = sortObjectByPropertyName( final.index.displayName );
	final.index.includePath = sortObjectByPropertyName( final.index.includePath );
	final.index.slug = sortObjectByPropertyName( final.index.slug );

	return final;
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

	let documents = fileList.map( processFile );
	documents = documents.map( parseDocument );
	documents = createIndex( documents );
	writeFile( documents );
} )();
