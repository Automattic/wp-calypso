function TimingPlugin() {}

module.exports = TimingPlugin;

TimingPlugin.prototype.apply = function( compiler ) {
	if ( ! compiler.compilers ) {
		compiler.plugin( 'compilation', function( compilation ) {
			if ( compilation.compiler.isChild() ) return;

			const oldApplyPlugins = compilation.applyPlugins;
			compilation.applyPlugins = function overrideApplyPlugins( name ) {
				if ( name === 'optimize-chunks' ) {
					var plugins = this._plugins['optimize-chunks'];
					for(var i = 0; i < plugins.length; i++)
						console.log( plugins[i] );
				}
				console.time( name );
				oldApplyPlugins.apply( this, arguments );
				console.timeEnd( name );
			}

			const oldApplyPluginsAsync = compilation.applyPluginsAsync;
			compilation.applyPluginsAsync = function( name ) {
				console.time( name );
				const args = Array.prototype.slice.call( arguments, 0 );
				const oldCallback = args.pop();
				args.push( function() {
					oldCallback.apply( this, arguments );
					console.timeEnd( name );
				} );
				oldApplyPluginsAsync.apply( this, args )
			};
		} );
	}
};
