/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import Notice from 'calypso/components/notice';
import { Button } from '@automattic/components';
import ActiveThemeScreenshot from './active-theme-screenshot';
import ThemeSetupDialog from 'calypso/my-sites/site-settings/theme-setup-dialog';

const ThemeSetupCard = ( { theme, translate, onClick } ) => (
	<ActionPanel>
		<ActionPanelBody>
			<ActionPanelTitle>{ translate( 'Theme Setup' ) }</ActionPanelTitle>
			<Notice status={ 'is-warning' } showDismiss={ false }>
				{ translate( 'This action cannot be undone.' ) }
			</Notice>
			<ActionPanelFigure>
				<ActiveThemeScreenshot theme={ theme } />
			</ActionPanelFigure>
			<p>
				{ translate(
					"Want your site to look like the demo? Use Theme Setup to automatically apply the demo site's settings to your site."
				) }
			</p>
			<p>
				{ translate(
					'You can apply Theme Setup to your current site while keeping all your posts, pages, and widgets. Some placeholder text may appear on your site – some themes need certain elements to look like the demo, so Theme Setup adds those for you. Please customize it!',
					{ components: { strong: <strong /> } }
				) }
			</p>
		</ActionPanelBody>
		<ActionPanelFooter>
			<Button className="theme-setup__button" primary={ true } onClick={ onClick }>
				{ translate( 'Set up your theme' ) }
			</Button>
		</ActionPanelFooter>
		<ThemeSetupDialog />
	</ActionPanel>
);

export default localize( ThemeSetupCard );
