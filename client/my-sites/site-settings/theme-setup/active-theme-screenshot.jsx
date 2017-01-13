/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

const ActiveThemeScreenshot = ( { theme, translate } ) => {
	if ( ! theme ) {
		return (
			<div className="theme-setup__active-theme-screenshot is-placeholder">
			</div>
		);
	}
	return (
		<div className="theme-setup__active-theme-screenshot">
			<a href={ theme.demo_uri }>
				<img src={ theme.screenshot } />
				<p>
					{ translate( 'Current theme: %(name)s', {
						args: {
							name: theme.name
						}
					} ) }
				</p>
			</a>
		</div>
	);
};

export default localize( ActiveThemeScreenshot );
