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
	makeTour,
	Tour,
	Step,
	Next,
	Quit,
	Continue,
	Link,
	ButtonRow,
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
		version="20161010"
		path="/stats"
		when={ and(
						isEnabled( 'guided-tours/site-title' ),
						isDesktop,
						hasSelectedSiteDefaultSiteTitle,
						canUserEditSettingsOfSelectedSite,
						isUserOlderThan( TWO_DAYS_IN_MILLISECONDS ),
						isAbTestInVariant( 'siteTitleTour', 'enabled' )
					)
		}>
		<Step name="init" placement="right" next="click-settings">
			<p>
				{
					translate( "Hey there! We noticed you haven't changed the title of your site yet. Want to change it? " )
				}
			</p>
			<ButtonRow>
				<Next step="click-settings">{ translate( 'Yes, please!' ) }</Next>
				<Quit>{ translate( 'No thanks' ) }</Quit>
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
				{
					translate( 'Click {{strong}}{{GridIcon/}} Settings{{/strong}} to continue.', {
						components: {
							GridIcon: <Gridicon icon="cog" size={ 24 } />,
							strong: <strong />,
						}
					} )
				}
			</Continue>
		</Step>

		<Step name="site-title-input"
			target="site-title-input"
			arrow="top-left"
			placement="below"
		>
			<p>
				{
					translate( 'You can change the site title here. The site title appears in places like the top ' +
						'of your web browser and in search results.' )
				}
			</p>
			<ButtonRow>
				<Next step="site-tagline-input">{ translate( 'Looks Good!' ) }</Next>
				<Quit>{ translate( 'Cancel' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="site-tagline-input"
			target="site-tagline-input"
			arrow="top-left"
			placement="below"
		>
			<p>
				{
					translate( 'This is the tagline of your site. It should explain what your site is about in few words. ' +
						'It usually appears right bellow your site title.' )
				}
			</p>
			<ButtonRow>
				<Next step="click-save">{ translate( 'Great!' ) }</Next>
				<Quit>{ translate( 'Cancel' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="click-save"
			target="settings-site-profile-save"
			arrow="top-right"
			placement="below"
		>
			<Continue target="settings-site-profile-save" step="finish" click>
				{
					translate( "Don't forget to save your changes." )
				}
			</Continue>
		</Step>

		<Step name="finish"	placement="center">
			<p>
				{
					translate( "{{strong}}That's it!{{/strong}} Your visitors can now easily identify your website by its title.", {
						components: {
							strong: <strong />,
						}
					} )
				}
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
