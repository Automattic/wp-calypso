/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionPanel from 'my-sites/site-settings/action-panel';
import ActionPanelTitle from 'my-sites/site-settings/action-panel/title';
import ActionPanelBody from 'my-sites/site-settings/action-panel/body';
import ActionPanelFooter from 'my-sites/site-settings/action-panel/footer';
import Notice from 'components/notice';
import Button from 'components/button';

const ThemeSetupCard = ( { translate } ) => (
	<ActionPanel>
		<ActionPanelBody>
			<ActionPanelTitle>{ translate( 'Theme Setup' ) }</ActionPanelTitle>
			<Notice status={ 'is-warning' } showDismiss={ false }>
				{ translate( 'This action cannot be undone.' ) }
			</Notice>
			<p>{ translate( 'Want your site to look like the demo? Use Theme Setup to automatically apply the demo site\'s settings to your site.' ) }</p>
			<p>{ translate( 'You can apply Theme Setup to your current site while keeping all your posts, pages, and widgets. Some placeholder text may appear on your site – some themes need certain elements to look like the demo, so Theme Setup adds those for you. Please customize it!', { components: { strong: <strong /> } } ) }</p>
		</ActionPanelBody>
		<ActionPanelFooter>
			<Button className="theme-setup__button" primary={ true }>
				{ translate( 'Set Up Your Theme' ) }
			</Button>
		</ActionPanelFooter>
	</ActionPanel>
);

export default localize( ThemeSetupCard );

