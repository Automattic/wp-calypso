const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

class BlockToHtmlFilter {
	apply( compiler ) {
		compiler.hooks.compilation.tap( 'BlockToHTML', ( compilation ) => {
			HtmlWebpackPlugin.getHooks( compilation ).beforeEmit.tapAsync(
				'BlockToHTML',
				( data, cb ) => {
					const block = data.html.match( /%BLOCK_START%(.*)%BLOCK_END%/ );
					data.html = block[ 1 ];
					cb( null, data );
				}
			);
		} );
	}
}

module.exports = BlockToHtmlFilter;
