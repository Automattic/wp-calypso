/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Theme = require( '../' );

/**
 * Component
 */
var ThemeExample = React.createClass( {
	displayName: 'Theme',

	render: function() {
		const theme = {
			id: 'twentyfifteen',
			name: 'Twenty Fifteen',
			screenshot: '//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfifteen/screenshot.png',
		};

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/theme">Theme</a>
				</h2>
				<Theme
				theme={ theme }
				buttonContents={ {
					action1: {
						label: 'Menu Item 1',
						action: function() { console.log( 'Menu Item 1 selected' ); }
					},
					action2: {
						label: 'Menu Item 2',
						action: function() { console.log( 'Menu Item 2 selected' ); }
					}
				} }
				actionLabel="Click Action"
				onScreenshotClick={ function() { console.log( 'onScreenshotClick triggered' ); } } />
			</div>
		);
	}
} );

module.exports = ThemeExample;
