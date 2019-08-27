/**
 * External dependencies
 */
import express from 'express';
import fs from 'fs';
import fspath from 'path';
import marked from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-scss';

/**
 * Internal dependencies
 */
import config from 'config';
import componentsUsageStats from 'devdocs/components-usage-stats.json';

const root = fs.realpathSync( fspath.join( __dirname, '..', '..' ) );
const selectors = require( './selectors' );

// Alias `javascript` language to `es6`
Prism.languages.es6 = Prism.languages.javascript;

// Configure marked to use Prism for code-block highlighting.
marked.setOptions( {
	highlight: function( code, language ) {
		const syntax = Prism.languages[ language ];
		return syntax ? Prism.highlight( code, syntax ) : code;
	},
} );

/**
 * Given an object of { module: dependenciesArray }
 * it filters out modules that contain the world "docs/"
 * and that are not components (i.e. they don't start with "components/").
 * It also removes the "components/" prefix from the modules name.
 *
 * @param {object} modulesWithDependences An object of modules - dipendencies pairs
 * @returns {object} A reduced set of modules.
 */
function reduceComponentsUsageStats( modulesWithDependences ) {
	return Object.keys( modulesWithDependences )
		.filter(
			moduleName =>
				moduleName.indexOf( 'components/' ) === 0 && moduleName.indexOf( '/docs' ) === -1
		)
		.reduce( ( target, moduleName ) => {
			const name = moduleName.replace( 'components/', '' );
			target[ name ] = modulesWithDependences[ moduleName ];
			return target;
		}, {} );
}

module.exports = function() {
	const app = express();

	// this middleware enforces access control
	app.use( '/devdocs/service', ( request, response, next ) => {
		if ( ! config.isEnabled( 'devdocs' ) ) {
			response.status( 404 );
			next( 'Not found' );
		} else {
			next();
		}
	} );

	// return the content of a document in the given format (assumes that the document is in
	// markdown format)
	app.get( '/devdocs/service/content', ( request, response ) => {
		let path = request.query.path;
		const format = request.query.format || 'html';

		if ( ! path ) {
			response
				.status( 400 )
				.send( 'Need to provide a file path (e.g. path=client/devdocs/README.md)' );
			return;
		}

		if ( ! /\.md$/.test( path ) ) {
			path = fspath.join( path, 'README.md' );
		}

		try {
			path = fs.realpathSync( fspath.join( root, path ) );
		} catch ( err ) {
			path = null;
		}

		if ( ! path || path.substring( 0, root.length + 1 ) !== root + fspath.sep ) {
			response.status( 404 ).send( 'File does not exist' );
			return;
		}

		const fileContents = fs.readFileSync( path, { encoding: 'utf8' } );

		response.send( 'html' === format ? marked( fileContents ) : fileContents );
	} );

	// return json for the components usage stats
	app.get( '/devdocs/service/components-usage-stats', ( request, response ) => {
		const usageStats = reduceComponentsUsageStats( componentsUsageStats );
		response.json( usageStats );
	} );

	// In environments where enabled, prime the selectors search cache whenever
	// a request is made for DevDocs
	app.use( '/devdocs', function( request, response, next ) {
		selectors.prime();
		next();
	} );

	app.use( '/devdocs/service/selectors', selectors.router );

	return app;
};
