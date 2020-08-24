/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ThemesList from 'components/themes-list';

const demoThemes = [
	{
		id: 'twentyfourteen',
		name: 'Twenty Fourteen',
		screenshot:
			'//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfourteen/screenshot.png',
		actionLabel: 'Click Action Theme 1',
	},
	{
		id: 'twentyfifteen',
		name: 'Twenty Fifteen',
		screenshot:
			'//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfifteen/screenshot.png',
		actionLabel: 'Click Action Theme 2',
	},
	{
		id: 'twentysixteen',
		name: 'Twenty Sixteen',
		screenshot:
			'//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
		actionLabel: 'Click Action Theme 3',
	},
];

export default class extends React.Component {
	static displayName = 'ThemesListExample';

	getActionLabel = ( theme ) => {
		return theme.actionLabel;
	};

	getButtonOptions = ( themeId ) => {
		return {
			action1: {
				label: 'Menu Item 1',
				action: function () {
					console.log( `Menu Item 1 for theme ${ themeId } selected` );
				},
			},
			action2: {
				label: 'Menu Item 2',
				action: function () {
					console.log( `Menu Item 2 for theme ${ themeId } selected` );
				},
			},
		};
	};

	themeScreenshotClick = ( themeId, index ) => {
		console.log( `Theme ${ themeId } at ${ index } clicked` );
	};

	render() {
		return (
			<ThemesList
				themes={ demoThemes }
				getButtonOptions={ this.getButtonOptions }
				getActionLabel={ this.getActionLabel }
				onScreenshotClick={ this.themeScreenshotClick }
			/>
		);
	}
}
