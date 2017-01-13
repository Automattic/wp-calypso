/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionPanelFigure from 'my-sites/site-settings/action-panel/figure';

const ActiveThemeScreenshot = ( { theme, translate } ) => {
	if ( ! theme ) {
		return null;
	}
	return (
		<ActionPanelFigure>
			<a href={ theme.demo_uri }>
				<img src={ theme.screenshot } />
				<p>
					{ translate( 'Current theme: %(name)', {
						args: {
							name: theme.name
						}
					} ) }
				</p>
			</a>
		</ActionPanelFigure>
	);
};

export default localize( ActiveThemeScreenshot );
