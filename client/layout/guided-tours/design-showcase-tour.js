import React from 'react';
import { translate } from 'i18n-calypso';
import {
	overEvery as and,
	negate as not,
} from 'lodash';
import { isDesktop } from 'lib/viewport';

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
	inSection,
	isNewUser,
	isEnabled,
	selectedSiteIsCustomizable,
} from 'state/ui/guided-tours/contexts';

const isAbTestInVariant = function() {};

export const DesignShowcaseTour = makeTour(
	<Tour
		name="designShowcase"
		version="20161123"
		path="/design"
		when={ and(
			isNewUser,
			isEnabled( 'guided-tours/design-showcase' ),
			isDesktop,
			selectedSiteIsCustomizable,
			not( inSection( 'customize' ) ),
			isAbTestInVariant( 'designShowcaseTour', 'enabled' ),
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
			target=".themes-magic-search-card .search__icon-navigation"
			arrow="top-left"
			placement="below"
			next="theme-options"
		>
			<p>
				{ 'Here you can search for themes and apply filters.' }
			</p>
			<ButtonRow>
				<Next step="theme-options">{ translate( "Next" ) }</Next>
				<Quit>{ translate( 'Close' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="theme-options"
			target=".card.theme:nth-child(4) .theme__more-button"
			arrow="top-left"
			placement="below"
			next="finish"
			scrollContainer="body"
			shouldScrollTo
		>
			<p>
				{ 'Here you can access all the extra theme options.' }
			</p>
			<Continue step="finish" target=".theme__more-button" click />
		</Step>

		<Step name="finish"
			target=".popover"
			placement="below"
			arrow="top-left"
		>
			<p>
				This menu has everything you can do with a theme.
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
