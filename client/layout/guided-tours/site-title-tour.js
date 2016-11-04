import React from 'react';
import { translate } from 'i18n-calypso';

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
} from 'state/ui/guided-tours/contexts';
import Gridicon from 'components/gridicon';

// TODO (markehrabe): user has unchanged title
// TODO (markehrabe): what path to use?
export const SiteTitleTour = makeTour(
	<Tour name="siteTitle" version="20161010" path="/stats/day/marekhrabe.wordpress.com" when={ selectedSiteHasDefaultSiteTitle }>
		<Step name="init" placement="right" next="click-settings" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				{
					translate( "We noticed you haven't changed the title of your site yet. It's quick and easy to do " +
											"and we'd love to show you how to do that." )
				}
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="click-settings">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</div>
		</Step>

		<Step name="click-settings"
			target="settings"
			arrow="left-middle"
			placement="beside"
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			<div className="guided-tours__actionstep-instructions">
				<Continue target="settings" step="site-title-input" click>
					{
						translate( 'Click the {{strong}}{{GridIcon/}} Settings{{/strong}} to continue.', {
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
					translate( 'Go ahead and change the title to whatever you want!' )
				}
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="click-save">{ translate( 'Looks Good' ) }</Next>
				<Quit />
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
					translate( "Don't forget to save your new settings." )
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
					translate( "{{strong}}That's it!{{/strong}} Now that you know a few of the basics, feel free to wander around.", {
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
