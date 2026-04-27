/**
 * WARNING: No ES6 modules here. Not transpiled! *
 */

/* eslint-disable import/no-nodejs-modules */
const Module = require( 'module' );

async function loadRspack( rspackModule ) {
	if ( typeof rspackModule === 'function' && rspackModule.DefinePlugin ) {
		return rspackModule;
	}

	const importedRspack = await import( '@rspack/core' );
	return importedRspack.default;
}

async function loadReactRefreshRspackPlugin() {
	const importedPlugin = await import( '@rspack/plugin-react-refresh' );
	return importedPlugin.ReactRefreshRspackPlugin;
}

function isThreadLoader( loader ) {
	const value = typeof loader === 'string' ? loader : loader?.loader;
	return typeof value === 'string' && value.includes( 'thread-loader' );
}

function stripThreadLoader( rule ) {
	if ( Array.isArray( rule.use ) ) {
		rule.use = rule.use.filter( ( loader ) => ! isThreadLoader( loader ) );
	} else if ( isThreadLoader( rule.use ) ) {
		delete rule.use;
	}
	return rule;
}

const reactRefreshBabelPlugin = require.resolve( 'react-refresh/babel' );

function isReactRefreshBabelPlugin( plugin ) {
	return plugin === reactRefreshBabelPlugin || plugin?.[ 0 ] === reactRefreshBabelPlugin;
}

function disableReactRefreshBabelPlugin( loader ) {
	if ( ! loader?.options?.plugins ) {
		return loader;
	}

	return {
		...loader,
		options: {
			...loader.options,
			plugins: loader.options.plugins.filter( ( plugin ) => ! isReactRefreshBabelPlugin( plugin ) ),
		},
	};
}

function disableReactRefresh( rule ) {
	if ( Array.isArray( rule.use ) ) {
		rule.use = rule.use.map( disableReactRefreshBabelPlugin );
	} else {
		rule.use = disableReactRefreshBabelPlugin( rule.use );
	}

	return rule;
}

function pluginName( plugin ) {
	return plugin?.constructor?.name;
}

function isRspackIncompatiblePlugin( plugin ) {
	return [
		'InlineConstantExportsPlugin',
		'MiniCSSWithRTLPlugin',
		'ReactRefreshPlugin',
		'RequireChunkCallbackPlugin',
	].includes( pluginName( plugin ) );
}

module.exports = async function createRspackConfig( rspackModule ) {
	const rspack = await loadRspack( rspackModule );
	const originalLoad = Module._load;
	const watchPollInterval = Number( process.env.RSPACK_WATCH_POLL_INTERVAL || 1000 );

	// Reuse the existing webpack config while swapping the few package-level APIs Rspack can replace.
	Module._load = function loadRspackCompatibleModule( request, parent, isMain ) {
		if ( request === 'webpack' ) {
			return rspack;
		}

		if ( request === 'mini-css-extract-plugin' ) {
			return rspack.CssExtractRspackPlugin;
		}

		return originalLoad.call( this, request, parent, isMain );
	};

	let config;

	try {
		config = require( './webpack.config' );
	} finally {
		Module._load = originalLoad;
	}

	const shouldUseReactRefresh = process.env.NODE_ENV !== 'production';
	config.module.rules = config.module.rules.map( stripThreadLoader );
	if ( ! shouldUseReactRefresh ) {
		config.module.rules = config.module.rules.map( disableReactRefresh );
	}
	config.plugins = config.plugins.filter( ( plugin ) => ! isRspackIncompatiblePlugin( plugin ) );
	if ( ! shouldUseReactRefresh ) {
		config.plugins = config.plugins.filter(
			( plugin ) => pluginName( plugin ) !== 'HotModuleReplacementPlugin'
		);
	}
	if (
		shouldUseReactRefresh &&
		config.plugins.some( ( plugin ) => pluginName( plugin ) === 'HotModuleReplacementPlugin' )
	) {
		const ReactRefreshRspackPlugin = await loadReactRefreshRspackPlugin();
		config.plugins.push(
			new ReactRefreshRspackPlugin( {
				overlay: false,
				exclude: [ /node_modules/, /devdocs/ ],
			} )
		);
	}
	config.watchOptions = {
		...config.watchOptions,
		ignored: [ '**/.git/**', '**/.cache/**', '**/node_modules/**' ],
		...( watchPollInterval > 0 ? { poll: watchPollInterval } : {} ),
	};

	if ( process.env.RSPACK_NATIVE_WATCHER === 'true' ) {
		config.experiments = {
			...config.experiments,
			nativeWatcher: true,
		};
	}

	return config;
};
