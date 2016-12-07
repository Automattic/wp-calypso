/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	Continue,
	Link,
	makeTour,
	Next,
	Quit,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import {
	hasSelectedSiteDefaultSiteTitle,
	isUserOlderThan,
	isEnabled,
	canUserEditSettingsOfSelectedSite,
	isAbTestInVariant,
} from 'state/ui/guided-tours/contexts';
import Gridicon from 'components/gridicon';
import { isDesktop } from 'lib/viewport';

const TWO_DAYS_IN_MILLISECONDS = 2 * 1000 * 3600 * 24;

export const SiteTitleTour = makeTour(
	<Tour
		name="siteTitle"
		version="20161207"
		path="/stats"
		when={ and(
			isEnabled( 'guided-tours/site-title' ),
			isDesktop,
			hasSelectedSiteDefaultSiteTitle,
			canUserEditSettingsOfSelectedSite,
			isUserOlderThan( TWO_DAYS_IN_MILLISECONDS ),
			isAbTestInVariant( 'siteTitleTour', 'enabled' )
		) }
	>
		<Step name="init" placement="right" next="click-settings">
			<p>
				Hey there! We noticed you haven't changed the title of your site yet.
				Want to change it?
			</p>
			<ButtonRow>
				<Next step="click-settings">Yes, please!</Next>
				<Quit>No thanks</Quit>
			</ButtonRow>
		</Step>

		<Step name="click-settings"
			target="settings"
			arrow="left-top"
			placement="beside"
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			<Continue target="settings" step="site-title-input" click>
				Click <strong><Gridicon icon="cog" size={ 24 } /> Settings</strong> to continue.
			</Continue>
		</Step>

		<Step name="site-title-input"
			target="site-title-input"
			arrow="top-left"
			placement="below"
		>
			<p>
				You can change the site title here. The site title appears in places
				like the top of your web browser and in search results.
			</p>
			<ButtonRow>
				<Next step="site-tagline-input">Looks Good!</Next>
				<Quit>Cancel</Quit>
			</ButtonRow>
		</Step>

		<Step name="site-tagline-input"
			target="site-tagline-input"
			arrow="top-left"
			placement="below"
		>
			<p>
				This is the tagline of your site. It should explain what your site
				is about in few words. It usually appears right bellow your site title.
			</p>
			<ButtonRow>
				<Next step="click-save">Great!</Next>
				<Quit>Cancel</Quit>
			</ButtonRow>
		</Step>

		<Step name="click-save"
			target="settings-site-profile-save"
			arrow="top-right"
			placement="below"
		>
			<Continue target="settings-site-profile-save" step="finish" click>
				Don't forget to save your changes.
			</Continue>
		</Step>

		<Step name="finish" placement="center">
			<p>
				<strong>That's it!</strong> Your visitors can now easily identify your website by its title.
			</p>
			<ButtonRow>
				<Quit primary>{ translate( "We're all done!" ) }</Quit>
			</ButtonRow>
			<Link href="https://learn.wordpress.com">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
