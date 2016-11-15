import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

import {
	makeTour,
	Tour,
	Step,
	Next,
	Quit,
	Continue,
	Link,
} from 'layout/guided-tours/config-elements';
import {
	selectedSiteHasDefaultSiteTitle,
	userIsOlderThan,
	isEnabled,
} from 'state/ui/guided-tours/contexts';
import Gridicon from 'components/gridicon';

const TWO_DAYS_IN_MILLISECONDS = 2 * 1000 * 3600 * 24;

export const SiteTitleTour = makeTour(
	<Tour
		name="siteTitle"
		version="20161010"
		path=""
		when={ and(
						isEnabled( 'guided-tours/site-title' ),
						selectedSiteHasDefaultSiteTitle,
						userIsOlderThan( TWO_DAYS_IN_MILLISECONDS )
					)
		}>
		<Step name="init" placement="right" next="click-settings" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				{
					translate( "Hey there! We noticed you haven't changed the title of your site yet. Want to change it? " )
				}
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="click-settings">{ translate( 'Yes, please!' ) }</Next>
				<Quit>{ translate( 'No thanks' ) }</Quit>
			</div>
		</Step>

		<Step name="click-settings"
			target="settings"
			arrow="left-top"
			placement="beside"
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			<div className="guided-tours__actionstep-instructions">
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
			</div>
		</Step>

		<Step name="site-title-input"
			target="site-title-input"
			arrow="top-left"
			placement="below"
		>
			<p className="guided-tours__step-text">
				{
					translate( 'You can change the site title here. The site title and tagline ' +
						'tells people about your site and appears in places like the top of your web browser and in search results.' )
				}
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="click-save">{ translate( 'Looks Good' ) }</Next>
				<Quit>Cancel</Quit>
			</div>
		</Step>

		<Step name="click-save"
			target="settings-site-profile-save"
			arrow="top-right"
			placement="below"
			next="site-title"
		>
			<p className="guided-tours__step-text">
				{
					translate( "Don't forget to save your new settings!" )
				}
			</p>
			<Continue target="settings-site-profile-save" step="finish" click />
		</Step>

		<Step name="finish"
			placement="center"
			className="guided-tours__step-finish"
		>
			<p className="guided-tours__step-text">
				{
					translate( "{{strong}}That's it!{{/strong}} Your visitors can now easily identify your website by its title.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<div className="guided-tours__single-button-row">
				<Quit primary>
					{ translate( "We're all done!" ) }
				</Quit>
			</div>
			<Link href="https://learn.wordpress.com">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
