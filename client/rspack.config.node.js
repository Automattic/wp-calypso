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

module.exports = async function createRspackNodeConfig( rspackModule ) {
	const rspack = await loadRspack( rspackModule );
	const originalLoad = Module._load;

	// Reuse the existing webpack config while swapping the compiler APIs Rspack can replace.
	Module._load = function loadRspackCompatibleModule( request, parent, isMain ) {
		if ( request === 'webpack' ) {
			return rspack;
		}

		return originalLoad.call( this, request, parent, isMain );
	};

	let config;

	try {
		config = require( './webpack.config.node' );
	} finally {
		Module._load = originalLoad;
	}

	config.module.rules = config.module.rules.map( stripThreadLoader );

	return config;
};
