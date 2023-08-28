import { ActionEventNames, AllowedActionTypes } from '../types';

// Event names for all actions for large screen(>960px) and small screen(<960px)
const actionEventNames: ActionEventNames = {
	issue_license: {
		large_screen: 'calypso_jetpack_agency_dashboard_issue_license_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_issue_license_small_screen',
	},
	view_activity: {
		large_screen: 'calypso_jetpack_agency_dashboard_view_activity_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_view_activity_small_screen',
	},
	view_site: {
		large_screen: 'calypso_jetpack_agency_dashboard_view_site_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_view_site_small_screen',
	},
	visit_wp_admin: {
		large_screen: 'calypso_jetpack_agency_dashboard_visit_wp_admin_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_visit_wp_admin_small_screen',
	},
	clone_site: {
		large_screen: 'calypso_jetpack_agency_dashboard_clone_site_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_clone_site_small_screen',
	},
	site_settings: {
		large_screen: 'calypso_jetpack_agency_dashboard_site_settings_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_site_settings_small_screen',
	},
};

// Returns event name based on the action type
const getActionEventName = ( actionType: AllowedActionTypes, isLargeScreen: boolean ) => {
	const deviceKey = isLargeScreen ? 'large_screen' : 'small_screen';
	return actionEventNames?.[ actionType ]?.[ deviceKey ];
};

export default getActionEventName;
