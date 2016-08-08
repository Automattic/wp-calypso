/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ThemesList from 'components/themes-list';

const demoThemes = [ {
	id: 'twentyfourteen',
	name: 'Twenty Fourteen',
	screenshot: '//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfourteen/screenshot.png',
	actionLabel: 'Click Action Theme 1',
},
{	id: 'twentyfifteen',
	name: 'Twenty Fifteen',
	screenshot: '//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfifteen/screenshot.png',
	actionLabel: 'Click Action Theme 2',
},
{	id: 'twentysixteen',
	name: 'Twenty Sixteen',
	screenshot: '//i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	actionLabel: 'Click Action Theme 3',
} ];

export default React.createClass( {
	displayName: 'ThemesListExample',

	getActionLabel( theme ) {
		return theme.actionLabel;
	},

	getButtonOptions( theme ) {
		return {
			action1: {
				label: 'Menu Item 1',
				action: function() {
					console.log( `Menu Item 1 for theme ${ theme.name } selected` );
				}
			},
			action2: {
				label: 'Menu Item 2',
				action: function() {
					console.log( `Menu Item 2 for theme ${ theme.name } selected` );
				}
			}
		}
	},

	themeScreenshotClick( theme, index ) {
		console.log( `Theme ${ theme.id } at ${ index } clicked` );
	},

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/themes-list-example">Themes List</a>
				</h2>
				<ThemesList
					themes={ demoThemes }
					getButtonOptions={ this.getButtonOptions }
					getActionLabel={ this.getActionLabel }
					onScreenshotClick={ this.themeScreenshotClick }
				/>
			</div>
		);
	}
} );
