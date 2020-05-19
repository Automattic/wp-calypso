/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';

const ThemeExample = () => {
	const theme = {
		id: 'twentyfifteen',
		name: 'Twenty Fifteen',
		screenshot:
			'//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfifteen/screenshot.png',
	};

	return (
		<div>
			<Theme
				theme={ theme }
				buttonContents={ {
					action1: {
						label: 'Menu Item 1',
						action: function () {
							console.log( 'Menu Item 1 selected' );
						},
					},
					action2: {
						label: 'Menu Item 2',
						action: function () {
							console.log( 'Menu Item 2 selected' );
						},
					},
				} }
				actionLabel="Click Action"
				onScreenshotClick={ function () {
					console.log( 'onScreenshotClick triggered' );
				} }
			/>
		</div>
	);
};

ThemeExample.displayName = 'Theme';

export default ThemeExample;
