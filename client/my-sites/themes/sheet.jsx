/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getThemeById } from 'state/themes/themes/selectors';

export const ThemeSheet = React.createClass( {
	displayName: 'ThemeSheet',

	propTypes: {
		themeSlug: React.PropTypes.string,
	},

	render() {
		return (
			<Main className="themes__sheet">
				<div className="themes__sheet-bar">
					<span className="themes__sheet-bar-title">Pineapple Fifteen</span>
					<span className="themes__sheet-bar-tag">by Alpha and Omega</span>
				</div>
				<div className="themes__sheet-screenshot">
					<img className="themes__sheet-img" src="https://i2.wp.com/theme.wordpress.com/wp-content/themes/pub/orvis/screenshot.png?w=680" />
				</div>
			</Main>
		);
	}
} )

export default connect(
	( state, props ) => Object.assign( {},
		props,
		{
			theme: getThemeById( state, props.themeSlug ),
		}
	)
)( ThemeSheet );
