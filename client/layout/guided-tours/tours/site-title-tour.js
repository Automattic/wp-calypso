/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';
import Gridicon from 'gridicons';

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
				{
					translate( "Hey there! We noticed you haven't changed the title of your site yet. Want to change it?" )
				}
			</p>
			<p>
				{ translate( 'The site title appears in places like the top of your web browser and in search results.' ) }
			</p>
			<ButtonRow>
				<Next step="click-settings">{ translate( 'Yes, please!' ) }</Next>
				<Quit>{ translate( 'No, thanks.' ) }</Quit>
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
					translate( 'Click {{strong}}{{icon/}} Settings{{/strong}} to continue.', {
						components: {
							icon: <Gridicon icon="cog" />,
							strong: <strong />
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
				{ translate( 'You can change the site title here. A good title can help others find your site.' ) }
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
					translate( "While you're at it, why not add a tagline? It should explain what your site is about in a few words. " +
						'It usually appears right below your site title.' )
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
				{ translate( "Don't forget to save your changes." ) }
			</Continue>
		</Step>

		<Step name="finish" placement="center">
			<p>
				{ translate( "{{strong}}That's it!{{/strong}} Your visitors can now easily identify your website by its title.", {
					components: {
						strong: <strong />
					}
				} ) }
			</p>
			<ButtonRow>
				<Quit primary>{ translate( "We're all done!" ) }</Quit>
			</ButtonRow>
			<Link href="https://en.support.wordpress.com/start">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
