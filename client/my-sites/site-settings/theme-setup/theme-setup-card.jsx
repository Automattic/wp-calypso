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
import ActionPanelFigure from 'my-sites/site-settings/action-panel/figure';
import Notice from 'components/notice';
import Button from 'components/button';
import ActiveThemeScreenshot from './active-theme-screenshot';
import ThemeSetupDialog from 'my-sites/site-settings/theme-setup-dialog';

const ThemeSetupCard = ( { theme, translate, onClickKeepContent, onClickDeleteContent } ) => (
	<ActionPanel>
		<ActionPanelBody>
			<ActionPanelTitle>{ translate( 'Theme Setup' ) }</ActionPanelTitle>
			<Notice status={ 'is-warning' } showDismiss={ false }>
				{ translate( 'This action cannot be undone.' ) }
			</Notice>
			<ActionPanelFigure>
				<ActiveThemeScreenshot theme={ theme } />
			</ActionPanelFigure>
			<p>{ translate( 'Want your site to look like the demo? Use Theme Setup to automatically apply the demo site\'s settings to your site.' ) }</p>
			<p>{ translate( 'You can apply Theme Setup to your current site and keep all your posts, pages, and widgets, or use it for a fresh start and delete everything currently on your site. In both cases, placeholder text will appear on your site – some themes need certain elements to look like the demo, so Theme Setup adds those for you. Please customize it!', { components: { strong: <strong /> } } ) }</p>
		</ActionPanelBody>
		<ActionPanelFooter>
			<Button className="theme-setup__button" primary={ true } onClick={ onClickKeepContent }>
				{ translate( 'Set Up And Keep Content' ) }
			</Button>
			<Button className="theme-setup__button" scary={ true } onClick={ onClickDeleteContent }>
				{ translate( 'Set Up And Delete Content' ) }
			</Button>
		</ActionPanelFooter>
		<ThemeSetupDialog />
	</ActionPanel>
);

export default localize( ThemeSetupCard );

