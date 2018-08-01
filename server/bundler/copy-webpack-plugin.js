const CopyWebpackPluginOriginal = require( 'copy-webpack-plugin' );

class CopyWebpackPlugin {
	constructor() {
		this.plugin = new CopyWebpackPluginOriginal( ...arguments );
	}

	apply() {
		this.plugin.apply( ...arguments );
	}
}

module.exports = CopyWebpackPlugin;