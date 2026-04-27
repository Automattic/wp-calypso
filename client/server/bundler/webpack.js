const webpack = require( 'webpack' );
const webpackMiddleware = require( 'webpack-dev-middleware' );
const hotMiddleware = require( 'webpack-hot-middleware' );
const webpackConfig = require( 'calypso/webpack.config' );

function createCompiler() {
	return webpack( webpackConfig );
}

function applyProfilePlugin( compiler ) {
	new compiler.webpack.ProgressPlugin( { profile: true } ).apply( compiler );
}

module.exports = {
	createCompiler,
	applyProfilePlugin,
	assetMiddleware: webpackMiddleware,
	hotMiddleware,
};
