module.exports = {
	plugins: [
		require( 'postcss-prefix-selector' )( {
			prefix: '.help-center',
			transform: function ( prefix, selector, prefixedSelector, path ) {
				// The search component has very generic class that causes many bugs.
				if ( path.includes( 'search/style.scss' ) ) {
					return selector === '.search' ? prefixedSelector : selector;
				}

				// The search component has very generic class that causes many bugs.
				if ( path.includes( 'card/style.scss' ) ) {
					return selector === '.card' ? prefixedSelector : selector;
				}

				return selector;
			},
		} ),
	],
};
