/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import {
	overEvery as and,
	negate as not,
} from 'lodash';

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
	isAbTestInVariant,
	inSection,
	isNewUser,
	isEnabled,
	selectedSiteIsCustomizable,
	hasUserInteractedWithComponent,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

const anyThemeMoreButtonClicked = hasUserInteractedWithComponent( 'ThemeMoreButton' );

export const DesignShowcaseWelcomeTour = makeTour(
	<Tour
		name="designShowcaseWelcome"
		version="20161206"
		path="/design"
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
				{ 'From this page you can change the design of your site. Want to see how to search for your ideal style?' }
			</p>
			<ButtonRow>
				<Next step="search">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="search"
			target=".themes-magic-search-card .search__icon-navigation, .themes__search-card .search__icon-navigation"
			arrow="top-left"
			placement="below"
			next="theme-options"
		>
			<p>
				{ 'Here you can search for themes and apply filters.' }
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
				{ 'Here you can access all the extra theme options.' }
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
				This menu contains everything you can do with a theme.
				Try it out!
			</p>
			<ButtonRow>
				<Quit primary>
					{ translate( "We're all done!" ) }
				</Quit>
			</ButtonRow>
		</Step>

	</Tour>
);
