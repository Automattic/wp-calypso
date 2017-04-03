/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import {
	overEvery as and,
	negate as not,
} from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Next,
	Quit,
	Continue,
} from 'layout/guided-tours/config-elements';
import {
	hasAnalyticsEventFired,
	isAbTestInVariant,
	inSection,
	isNewUser,
	isEnabled,
	selectedSiteIsCustomizable,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

const anyThemeMoreButtonClicked = hasAnalyticsEventFired( 'calypso_themeshowcase_theme_click' );

export const DesignShowcaseWelcomeTour = makeTour(
	<Tour
		name="designShowcaseWelcome"
		version="20161206"
		path="/themes"
		when={ and(
			isNewUser,
			isEnabled( 'guided-tours/design-showcase-welcome' ),
			isDesktop,
			selectedSiteIsCustomizable,
			not( inSection( 'customize' ) ),
			isAbTestInVariant( 'designShowcaseWelcomeTour', 'enabled' ),
		) }
	>
		<Step name="init" placement="right" next="search">
			<p>
				{
					translate( 'On this page, you can explore our many themes. ' +
						"Want to learn how to find the design that fits the site you're building?" )
				}
			</p>
			<ButtonRow>
				<Next step="search">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No, thanks.' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="search"
			target=".themes-magic-search-card .search__icon-navigation, .themes__search-card .search__icon-navigation"
			arrow="top-left"
			placement="below"
			next="theme-options"
		>
			<p>
				{ translate( 'Search for your ideal theme by feature, look, or topic — you can use words like "business", "photography", or "food".' ) }
			</p>
			<ButtonRow>
				<Next step="theme-options" />
				<Quit />
			</ButtonRow>
		</Step>

		<Step name="theme-options"
			target=".card.theme:nth-child(4) .theme__more-button"
			placement="beside"
			next="finish"
			scrollContainer="body"
			shouldScrollTo
		>
			<p>
				{
					translate( 'Scroll down to discover more themes. Found anything you like? ' +
						'Try clicking the three dots — {{icon/}} — for more theme options.', {
							components: { icon: <Gridicon icon="ellipsis" /> }
						}
					)
				}
			</p>
			<Continue
				icon="ellipsis"
				step="finish"
				target=".card.theme:nth-child(4) .theme__more-button"
				when={ anyThemeMoreButtonClicked }
			/>
		</Step>

		<Step name="finish"
			target=".popover"
			placement="beside"
		>
			<p>
				{ translate( 'This menu lets you preview and set up any theme, or learn more about it.' ) }
			</p>
			<ButtonRow>
				<Quit primary>
					{ translate( "We're all done!" ) }
				</Quit>
			</ButtonRow>
		</Step>

	</Tour>
);
