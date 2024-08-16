module.exports = {
	plugins: [
		require( 'postcss-prefixwrap' )( '.help-center', {
			ignoredSelectors: [ '.help-center', /^\.popover(.+)?$/ ],
		} ),
	],
};
