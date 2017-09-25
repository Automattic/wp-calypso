/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */

const ActiveThemeScreenshot = ( { theme, translate } ) => {
	return (
		<div className="active-theme-screenshot">
			{ theme &&
				<a href={ theme.demo_uri }>
					<img className="active-theme-screenshot__image" src={ theme.screenshot } />
					<span className="active-theme-screenshot__name">
						{ translate( 'Current theme: %(name)s', {
							args: {
								name: theme.name
							}
						} ) }
					</span>
				</a>
			}
		</div>
	);
};

export default localize( ActiveThemeScreenshot );
