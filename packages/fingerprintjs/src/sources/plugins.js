'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
function getPlugins() {
	var rawPlugins = navigator.plugins;
	if ( ! rawPlugins ) {
		return undefined;
	}
	var plugins = [];
	// Safari 10 doesn't support iterating navigator.plugins with for...of
	for ( var i = 0; i < rawPlugins.length; ++i ) {
		var plugin = rawPlugins[ i ];
		if ( ! plugin ) {
			continue;
		}
		var mimeTypes = [];
		for ( var j = 0; j < plugin.length; ++j ) {
			var mimeType = plugin[ j ];
			mimeTypes.push( {
				type: mimeType.type,
				suffixes: mimeType.suffixes,
			} );
		}
		plugins.push( {
			name: plugin.name,
			description: plugin.description,
			mimeTypes: mimeTypes,
		} );
	}
	return plugins;
}
exports.default = getPlugins;
