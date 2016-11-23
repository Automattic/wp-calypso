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
	// Link,
} from 'layout/guided-tours/config-elements';
import {
	inSection,
	// isNewUser,
	isEnabled,
	themeFilterChosen,
	themeSearchResultsFound,
	// selectedSiteIsPreviewable,
	selectedSiteIsCustomizable,
	// previewIsNotShowing,
	// previewIsShowing,
} from 'state/ui/guided-tours/contexts';
// import { getScrollableSidebar } from 'layout/guided-tours/positioning';
// import Gridicon from 'components/gridicon';
// import scrollTo from 'lib/scroll-to';

// const scrollSidebarToTop = () =>
// 	scrollTo( { y: 0, container: getScrollableSidebar() } );

const isNewUser = () => true;

export const DesignShowcaseTour = makeTour(
	<Tour
		name="designShowcase"
		version="20161123"
		path="/design"
		when={ and( isNewUser, isEnabled( 'guided-tours/design-showcase', isDesktop ) ) }
		>
		<Step name="init" placement="right" next="filter">
			<p>
				{ 'From this page you can change the design of your site. Want to see how to search for your ideal style?' }
			</p>
			<ButtonRow>
				<Next step="filter">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="filter"
			target="themes-tier-dropdown"
			placement="beside"
			arrow="right-top"
			next="search"
		>
			<p>
				{ 'Do you want to see only free themes? Try changing to free here.' }
			</p>
			<Continue when={ themeFilterChosen( 'free' ) } step="search" hidden />
		</Step>

		<Step name="search"
			target=".themes__search-card .search-open__icon"
			arrow="top-left"
			placement="below"
			next="theme-options"
		>
			<p>
				{ 'Search for a specific feature, style or theme here. Try something — for example “business”.' }
			</p>
			<Continue when={ themeSearchResultsFound } step="theme-options" hidden />
		</Step>

		<Step name="theme-options"
			target=".theme__more-button"
			arrow="top-left"
			placement="below"
			next="customize"
		>
			<p>
				{ 'From here you can access all the theme options.' }
			</p>
			<Continue step="customize" target=".theme__more-button" click />
		</Step>

		<Step name="customize"
			target=".current-theme__customize"
			placement="beside"
			arrow="right-middle"
			when={ and( selectedSiteIsCustomizable, not( inSection( 'customize' ) ) ) }
		>
			<p>
				{ 'To customize further the design you have chosen, click on customize.' }
			</p>
		</Step>
	</Tour>
);
