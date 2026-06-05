const { getPostCssPlugins } = require( './postcss-plugins' );

module.exports = () => ( {
	plugins: getPostCssPlugins( { customProperties: true } ),
} );
