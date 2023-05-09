module.exports = class ReadonlyCachePlugin {
	apply( compiler ) {
		compiler.cache.hooks.store.intercept( {
			register: ( tapInfo ) => {
				compiler
					.getInfrastructureLogger( 'webpack.cache.ReadonlyCachePlugin' )
					.info( `Cache is in read only mode. ${ tapInfo.name } won't be executed` );
				return {
					...tapInfo,
					fn: function () {
						//A no-op function prevent any hook to `compiler.cache.hooks.store` to do anything.
					},
				};
			},
		} );
	}
};
