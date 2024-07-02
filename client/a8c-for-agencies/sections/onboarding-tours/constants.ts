/**
 * Constant holding all preference names for our onboarding tours.
 */
export const A4A_ONBOARDING_TOURS_PREFERENCE_NAME: Record< string, string > = {
	addSiteStep1: 'a4a-sites-add-new-site-tour-step-1',
	addSiteStep2: 'a4a-sites-add-new-site-tour-step-2',
	sitesWalkthrough: 'a4a-sites-tour',
	exploreMarketplace: 'a4a-marketplace-tour',
	boostAgencyVisibility: 'a4a-boost-agency-visibility-tour',
};

export const A4A_ONBOARDING_TOURS_EVENT_NAMES: Record< string, string > = {
	startTour: 'calypso_a4a_start_tour',
	endTour: 'calypso_a4a_end_tour',
};
