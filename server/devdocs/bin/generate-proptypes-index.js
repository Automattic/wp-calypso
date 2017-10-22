#!/usr/bin/env node

/**
 * This file generates an index of proptypes by component displayname, slug and folder name
 */

const startTime = process.hrtime();

/**
 * External Dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const reactDocgen = require( 'react-docgen' );
const { getPropertyName, getMemberValuePath, resolveToValue } = require( 'react-docgen/dist/utils' );
const _ = require( 'lodash' );
const globby = require( 'globby' );
const async = require( 'async' );

const root = path.dirname( path.join( __dirname, '..', '..' ) );
const handlers = [ ...reactDocgen.defaultHandlers, commentHandler ];

/**
 * Replaces **'s in comment blocks and trims comments
 * @param {string} str The doc string to clean
 */
function parseDocblock( str ) {
	const lines = str.split( '\n' );
	for ( let i = 0, l = lines.length; i < l; i++ ) {
		lines[ i ] = lines[ i ].replace( /^\s*\*\s?/, '' );
	}
	return lines.join( '\n' ).trim();
}

/**
 * Given a path, this function returns the closest preceding comment, if it exists
 * @param {NodePath} path The node path from react-docgen
 */
function getComments( path ) {
	let comments = [];

	if ( path.node.leadingComments ) {
		// if there are comments before this property node, use the ones leading, not following a previous node
		comments = path.node.leadingComments.filter(
			comment => comment.leading === true
		);
	} else if (path.node.comments) {
		// if there are comments after this property node, use the ones following this node
		comments = path.node.comments.filter(
			comment => comment.leading === false
		);
	}

	if ( comments.length > 0 ) {
		return parseDocblock( comments[ comments.length - 1 ].value );
	}

	return null;
}

/**
 * Handler for react-docgen to use in order to discover
 * @param {Documentation} documentation The object to mutate that will eventually be passed back to us from parse()
 * @param {NodePath} path The node we are handling
 */
function commentHandler(documentation, path) {
	// retrieve the proptypes for this node, if they exist
	let propTypesPath = getMemberValuePath(path, 'propTypes');
	if (!propTypesPath) {
		return;
	}

	// resolve a path to a value, if possible, will be ObjectExpression type if it can
	propTypesPath = resolveToValue( propTypesPath );
	if ( !propTypesPath || propTypesPath.value.type !== 'ObjectExpression' ) {
		return;
	}

	// Iterate over all the properties in the proptypes object
	propTypesPath.get( 'properties' ).each( ( propertyPath ) => {
		// ensure that this node is a property
		if ( propertyPath.value.type !== 'Property' ) {
			return;
		}

		// get the prop name and description, ensuring that it either doesn't exist or is empty before continuing
		const propName = getPropertyName(propertyPath);
		const propDescriptor = documentation.getPropDescriptor(propName);

		if ( propDescriptor.description && propDescriptor.description !== '' ) {
			return;
		}

		// if we don't have anything, see if there are inline comments for this property
		propDescriptor.description = getComments( propertyPath ) || '';
	} );
}

/**
 * Calculates a filepath's include path and begins reading the file for parsing
 * Calls back with null, if an error occurs or an object if it succeeds
 * @param {string} filePath The path to read
 */
const processFile = ( filePath, callback ) => {
	const filename = path.basename( filePath );
	const includePathRegEx = new RegExp(`^client/(.*?)/${ filename }$`);
	const includePathSuffix = ( filename === 'index.jsx' ? '' : '/' + path.basename( filename, '.jsx' ) );
	const includePath = includePathRegEx.exec( filePath )[1] + includePathSuffix;
	const usePath = path.join( process.cwd(), filePath );

	fs.readFile( usePath, { encoding: 'utf8' }, ( err, document ) => {
		if ( err ) {
			console.log(`Skipping ${ filePath } due to fs error: ${ err }`);
			return callback( null, null );
		}
		if ( ! document.includes( "from 'react';" ) ) {
			return callback( null, null ); // Not a React component, skip
		}

		try {
			const parsed = reactDocgen.parse( document, undefined, handlers );
			parsed.includePath = includePath;
			if ( parsed.displayName ) {
				parsed.slug = _.kebabCase( parsed.displayName );
			} else {
				// we have to figure it out -- use the directory name to get the slug
				parsed.slug = path.basename( includePath );
				parsed.displayName = _.capitalize( _.camelCase( parsed.slug ) );
			}
			return callback( null, parsed );
		} catch ( error ) {
			// skipping, probably because the file couldn't be parsed for many reasons (there are lots of them!)
			return callback( null, null );
		}
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
	console.log( 'Building: proptypes-index.json' );
	const fileList = globby.sync( process.argv.slice( 2 ) );

	if ( fileList.length === 0 ) {
		process.stderr.write( 'You must pass a list of files to process' );
		process.exit( 1 );
	}

	async.map( fileList, processFile, ( err, results ) => {
		writeFile( results.filter( Boolean ) );

		const elapsed = process.hrtime( startTime )[ 1 ] / 1000000;
		console.log( `Time: ${ process.hrtime( startTime )[0] }s ${ elapsed.toFixed( 3 ) }ms` );
	} );
} )();
