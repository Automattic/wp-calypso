import React from 'react';
import { translate } from 'i18n-calypso';
import {
	overEvery as and,
	negate as not,
} from 'lodash';

import {
	makeTour,
	Tour,
	Step,
	Next,
	Quit,
	Continue,
} from 'layout/guided-tours/config-elements';
import {
	isNewUser,
	themeFilterChosen,
	themeSearchResultsFound,
	isEnabled,
	inSection,
	selectedSiteIsCustomizable,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const DesignTour = makeTour(
	<Tour name="design" version="20160601" path="/design" when={ and( isNewUser, isEnabled( 'guided-tours/design', isDesktop ) ) }>
		<Step name="init" placement="right" next="filter" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				{ 'From this page you can change the design of your site. Want to see how to search for your ideal style?' }
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="filter">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</div>
		</Step>

		<Step name="filter"
			target="themes-tier-dropdown"
			placement="beside"
			arrow="right-top"
			next="search"
		>
			<p className="guided-tours__step-text">
				{ 'Do you want to see only free themes? Try changing to free here.' }
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue when={ themeFilterChosen( 'free' ) } step="search" hidden/>
			</p>
		</Step>

		<Step name="search"
			target=".themes__search-card .search-open__icon"
			arrow="top-left"
			placement="below"
			next="theme-options"
		>
			<p className="guided-tours__step-text">
				{ 'Search for a specific feature, style or theme here. Try something — for example “business”.' }
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue when={ themeSearchResultsFound } step="theme-options" hidden/>
			</p>
		</Step>

		<Step name="theme-options"
			target=".theme__more-button"
			arrow="top-left"
			placement="below"
			next="customize"
		>
			<p className="guided-tours__step-text">
				{ 'From here you can access all the theme options.' }
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="customize" target=".theme__more-button" click/>
			</p>
		</Step>

		<Step name="customize"
			target=".current-theme__customize"
			placement="beside"
			arrow="right-middle"
			when={ and( selectedSiteIsCustomizable, not( inSection( 'customize' ) ) ) }
		>
			<p className="guided-tours__step-text">
				{ 'To customize further the design you have chosen, click on customize.' }
			</p>
		</Step>
	</Tour>
);
