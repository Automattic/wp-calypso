module.exports = {
	plugins: [
		require( 'postcss-prefix-selector' )( {
			prefix: '.help-center',
			transform: function ( prefix, selector, prefixedSelector, path ) {
				// Agenttic UI (used by Odie/Agents Manager) ships very generic chart selectors
				// like `.chart-container` which collide with WooCommerce Reports in wp-admin.
				if ( selector.includes( '.chart-container' ) ) {
					return selector.includes( prefix ) ? selector : prefixedSelector;
				}

				// The search component has very generic class that causes many bugs.
				if ( path.includes( 'search/style.scss' ) ) {
					return selector === '.search' ? prefixedSelector : selector;
				}

				// The card component has very generic class that causes many bugs.
				if ( path.includes( 'card/style.scss' ) ) {
					return selector === '.card' ? prefixedSelector : selector;
				}

				// The count component has very generic class that causes many bugs.
				if ( path.includes( 'count/style.scss' ) ) {
					return selector === '.count' ? prefixedSelector : selector;
				}

				// Replace :root with .help-center to avoid stylizing the document and scope all the help center variables to the help center.
				if ( selector === ':root' ) {
					return '.help-center';
				}

				return selector;
			},
		} ),
	],
};
