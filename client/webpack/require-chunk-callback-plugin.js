/**
 * External dependencies.
 */
const webpack = require( 'webpack' ); //eslint-disable-line import/no-extraneous-dependencies

const { Template } = webpack;

/**
 * Plugin name.
 *
 * @type {string}
 */
const PLUGIN_NAME = 'RequireChunkCallback';

class RequireChunkCallbackPlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( PLUGIN_NAME, compilation => {
			const { mainTemplate } = compilation;

			mainTemplate.hooks.localVars.tap( PLUGIN_NAME, source => {
				return Template.asString( [
					source,
					'',
					`
						function RequireChunkCallback() {
							this.callbacks = [];
						}

						RequireChunkCallback.prototype.add = function( callback ) {
							this.callbacks.push( callback );

							return this;
						};

						RequireChunkCallback.prototype.remove = function( callback ) {
							this.callbacks = this.callbacks.filter( function( _callback ) {
								return callback !== _callback;
							} );

							return this;
						};

						RequireChunkCallback.prototype.trigger = function( chunk, promises, publicPath ) {
							for ( var i = 0; i < this.callbacks.length; i++ ) {
								this.callbacks[ i ]( chunk, promises, publicPath );
							}

							return this;
						};

						RequireChunkCallback.prototype.getInstalledChunks = function() {
							return Object.keys( installedChunks ).map( function( chunkId ) {
								return jsonpScriptSrc( chunkId )
									.replace( __webpack_require__.p, '' )
									.replace( /\\.js$/, '' );
							} );
						};

						RequireChunkCallback.prototype.getPublicPath = function() {
							return __webpack_require__.p;
						};

						var requireChunkCallback = new RequireChunkCallback();

						window.__requireChunkCallback__ = requireChunkCallback;
					`,
				] );
			} );

			mainTemplate.hooks.requireEnsure.tap( PLUGIN_NAME, source => {
				return Template.asString( [
					source,
					'',
					`requireChunkCallback.trigger( {
						chunkId: chunkId,
						publicPath: __webpack_require__.p,
						scriptSrc: jsonpScriptSrc( chunkId )
					}, promises )`,
				] );
			} );
		} );
	}
}

module.exports = RequireChunkCallbackPlugin;
