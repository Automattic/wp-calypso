/***** WARNING: ES5 code only here. Not transpiled! *****/

/**
 * External dependecies
 */
var error = require( 'chalk' ).bold.red;
var info = require( 'chalk' ).bold.yellow;
var startsWith = require( 'lodash/startsWith' );
var includes = require( 'lodash/includes' );

var PLUGIN_TITLE = 'PragmaChecker';
var SSR_READY = '/** @ssr-ready **/';
var IGNORED_MODULES = [
	'config', // Different modules on client & server
	'lib/wp', // Different modules on client & server
	'lib/formatting', // Different modules on client & server
	'lib/analytics', // nooped on the server until we develop an isomorphic version
	'lib/route', // nooped on the server until we can extract the isomorphic bits
	'lib/upgrades/actions', // nooped on the server as it still uses the singleton Flux architecture
	'i18n-calypso', // ignore this until we make it work properly on the server
	'my-sites/themes/thanks-modal', // stubbed on the server until we develop an isomorphic version
	'my-sites/themes/themes-site-selector-modal', // stubbed on the server until we develop an isomorphic version
	'state/ui/editor/selectors', // stubbed on the server until all the dependencies are @ssr-ready
	'state/posts/selectors', // stubbed on the server until all the dependencies are @ssr-ready
];

function PragmaCheckPlugin( options ) {
	this.options = options || {};
}

function scanDependencies( module, compilation ) {
	if ( ! module.dependencies ) {
		return;
	}

	module.dependencies.forEach( function( dep ) {
		if ( ! dep.module ) {
			return;
		}

		// If the module is compiled through babel, we can be pretty sure it's our own module, not from npm.
		if ( includes( dep.module.request, 'babel-loader' ) &&
				dep.module._source &&
				! includes( IGNORED_MODULES, dep.request ) &&
				! includes( IGNORED_MODULES, dep.module.rawRequest ) &&
				! includes( dep.module._source._value, SSR_READY ) ) {
			compilation.errors.push( PLUGIN_TITLE + ': ' + module.rawRequest + ', dependency ' + dep.module.rawRequest + ' is not ' + SSR_READY );
		}

		if ( dep.module.dependencies ) {
			scanDependencies( dep.module.dependencies );
		}
	} );
}

PragmaCheckPlugin.prototype.apply = function( compiler ) {
	compiler.plugin( 'compilation', function( compilation ) {
		compilation.plugin( 'optimize-modules', function( modules ) {
			modules.forEach( function( module ) {
				if ( module._source && includes( module._source._value, SSR_READY ) ) {
					scanDependencies( module, compilation );
				}
			} );
		} );

		compiler.plugin( 'done', function( stats ) {
			var pragmaError = false;

			if ( stats.compilation.errors && stats.compilation.errors.length ) {
				stats.compilation.errors.forEach( function( text ) {
					if ( startsWith( text, PLUGIN_TITLE ) ) {
						pragmaError = true;
						console.log( error( text ) );
					}
				} );

				if ( pragmaError ) {
					console.log( info( PLUGIN_TITLE + ': Server Side Rendering constraints not met. Please see https://github.com/Automattic/wp-calypso/tree/master/docs/server-side-rendering.md for details.' ) );
					// We don't want to enable webpack's bail for all errors, so exit the process instead of throwing.
					process.exit( 1 ); // eslint-disable-line no-process-exit
				}
			}
		} );
	} );
};

module.exports = PragmaCheckPlugin;
