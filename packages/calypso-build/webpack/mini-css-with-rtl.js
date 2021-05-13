const webpack = require( 'webpack' );
const PLUGIN_NAME = 'MiniCSSWithRTL';

class MiniCSSWithRTLModule extends webpack.RuntimeModule {
	constructor( { globalVar = null } = {} ) {
		super( 'get mini-css chunk filename with rtl' );
		this.globalVar = globalVar;
	}

	generate() {
		const { compilation } = this;
		const { runtimeTemplate } = compilation;
		const namespace = webpack.RuntimeGlobals.require;
		const template = webpack.Template;
		const globalBar = this.globalVar
			? `window[${ JSON.stringify( this.globalVar ) }]`
			: 'document.dir';

		return `${ namespace }.miniCssF = (
			${ runtimeTemplate.returningFunction(
				runtimeTemplate.basicFunction(
					'chunkId',
					template.indent( [
						'var isCssRtlEnabled = ' + globalBar + " === 'rtl';",
						'var originalUrl = originalFn(chunkId);',
						'return isCssRtlEnabled ? originalUrl.replace(".css",".rtl.css") : originalUrl;',
					] )
				),
				'originalFn'
			) }
		)(${ namespace }.miniCssF)`;
	}
}

module.exports = class MiniCSSWithRTLPlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( PLUGIN_NAME, ( compilation ) => {
			compilation.hooks.runtimeRequirementInTree
				.for( webpack.RuntimeGlobals.ensureChunkHandlers )
				.tap( PLUGIN_NAME, ( chunk ) => {
					compilation.addRuntimeModule( chunk, new MiniCSSWithRTLModule() );
				} );
		} );
	}
};
