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
	isNewUser,
	isEnabled,
	selectedSiteIsPreviewable,
	selectedSiteIsCustomizable,
	previewIsNotShowing,
	previewIsShowing,
	inSection,
} from 'state/ui/guided-tours/contexts';
import { getScrollableSidebar } from 'layout/guided-tours/positioning';
import Gridicon from 'components/gridicon';
import scrollTo from 'lib/scroll-to';

const scrollSidebarToTop = () =>
	scrollTo( { y: 0, container: getScrollableSidebar() } );

export const SiteTitleTour = makeTour(
	<Tour name="siteTitle" version="20161010" path="/" when={ and( /* TODO (markehrabe): user has unchanged title */isEnabled( 'guided-tours/site-title' ) ) }>
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
			arrow="bottom-left"
			placement="above"
			scrollContainer=".sidebar__region"
			next="site-title-input"
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
			when={ inSection( 'settings' ) }
			next="site-title"
		>
			<p className="guided-tours__step-text">
				{
					translate( 'Go ahead and change the title to whatever you want!' )
				}
			</p>
			{/* TODO (marekhrabe): change to either onChange of the input or just click */}
			<div className="guided-tours__choice-button-row">
				<Next step="finish" when={inSection('settings')} hidden />
				<Quit />
			</div>
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
				<Quit onClick={ scrollSidebarToTop } primary>
					{ translate( "We're all done!" ) }
				</Quit>
			</div>
			<Link href="https://learn.wordpress.com">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
