const hotMiddleware = require( 'webpack-hot-middleware' );

// Keep Rspack's ESM packages out of the CommonJS server bundle.
// eslint-disable-next-line no-new-func
const importModule = new Function( 'specifier', 'return import( specifier );' );

let rspackModulesPromise = null;

function loadRspackModules() {
	if ( ! rspackModulesPromise ) {
		rspackModulesPromise = Promise.all( [
			importModule( '@rspack/core' ),
			importModule( '@rspack/dev-middleware' ),
		] ).then( ( [ rspackModule, devMiddlewareModule ] ) => ( {
			rspack: rspackModule.default,
			devMiddleware: devMiddlewareModule.devMiddleware,
		} ) );
	}

	return rspackModulesPromise;
}

async function createCompiler() {
	const { rspack } = await loadRspackModules();
	const createRspackConfig = require( 'calypso/rspack.config' );
	const rspackConfig = await createRspackConfig( rspack );

	return rspack( rspackConfig );
}

async function applyProfilePlugin( compiler ) {
	const { rspack } = await loadRspackModules();
	new rspack.ProgressPlugin( { profile: true } ).apply( compiler );
}

async function assetMiddleware( compiler ) {
	const { devMiddleware } = await loadRspackModules();
	return devMiddleware( compiler );
}

module.exports = {
	createCompiler,
	applyProfilePlugin,
	assetMiddleware,
	hotMiddleware: ( compiler ) => hotMiddleware( compiler ),
};
