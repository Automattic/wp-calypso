import 'calypso/state/admin-menu/init';

export function getAdminMenu( state, siteId ) {
	const stateSlice = state?.adminMenu?.menus;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	const menusToFilter = state.adminMenu.menus[ siteId ];

	if ( ! menusToFilter ) {
		return null;
	}

	// TODO: Determine whether or not launchpad is still enabled
	const launchpadEnabled = true;

	if ( launchpadEnabled ) {
		// Replace my home url with a redirection to launchpad feature
		return menusToFilter.map( ( menu ) => {
			if ( menu?.url?.match( /^\/home/ ) ) {
				// TODO: Determine which onboarding flow user is handling
				// We currently hardcode the flow as "newsletter"
				menu.url = menu.url.replace( /^\/home\//, '/setup/launchpad?flow=newsletter&siteSlug=' );
			}

			return menu;
		} );
	}

	return menusToFilter;
}

export function getIsRequestingAdminMenu( state ) {
	const stateSlice = state?.adminMenu?.requesting;

	if ( ! stateSlice ) {
		return null;
	}

	return state.adminMenu.requesting;
}
