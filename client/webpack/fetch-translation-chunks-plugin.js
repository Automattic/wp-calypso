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
const PLUGIN_NAME = 'FetchTranslationChunks';

class FetchTranslationChunksPlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( PLUGIN_NAME, compilation => {
			const { mainTemplate } = compilation;

			mainTemplate.hooks.localVars.tap( PLUGIN_NAME, source => {
				return Template.asString( [ source, '', 'var installedTranslationChunks = {}' ] );
			} );

			mainTemplate.hooks.requireEnsure.tap( PLUGIN_NAME, source => {
				return Template.asString( [
					source,
					'',
					'if ( window.__i18n__ ) {',
					Template.indent( [
						'promises.push(',
						Template.indent( [
							'new Promise( ( resolve, reject ) => {',
							Template.indent( [
								"var translationChunk = window.__i18n__.getLocaleSlug() + '-' + chunkId;",
								'',
								'if ( installedTranslationChunks[ translationChunk ] ) {',
								Template.indent( [ 'resolve();', 'return;' ] ),
								'}',
								'',
								"fetch( __webpack_require__.p + 'languages/' + translationChunk + '.json' )", // @todo replace with actual languages path
								Template.indent( [
									'.then( response => response.json() )',
									'.then( data => {',
									Template.indent( [
										'window.__i18n__.setLocale( data );',
										'installedTranslationChunks[ translationChunk ] = true;',
										'resolve();',
									] ),
									'} )',
									'.catch( resolve );',
								] ),
							] ),
							'} )',
						] ),
						');',
					] ),
					'}',
				] );
			} );
		} );
	}
}

module.exports = FetchTranslationChunksPlugin;
