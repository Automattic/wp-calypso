import { ActionEventNames, AllowedActionTypes } from '../types';

// Event names for all actions for large screen(>960px) and small screen(<960px)
const actionEventNames: ActionEventNames = {
	issue_license: {
		large_screen: 'calypso_a4a_sites_dataview_issue_license_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_issue_license_small_screen',
	},
	view_activity: {
		large_screen: 'calypso_a4a_sites_dataview_view_activity_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_view_activity_small_screen',
	},
	view_site: {
		large_screen: 'calypso_a4a_sites_dataview_view_site_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_view_site_small_screen',
	},
	visit_wp_admin: {
		large_screen: 'calypso_a4a_sites_dataview_visit_wp_admin_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_visit_wp_admin_small_screen',
	},
	clone_site: {
		large_screen: 'calypso_a4a_sites_dataview_clone_site_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_clone_site_small_screen',
	},
	site_settings: {
		large_screen: 'calypso_a4a_sites_dataview_site_settings_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_site_settings_small_screen',
	},
	set_up_site: {
		large_screen: 'calypso_a4a_sites_dataview_set_up_site_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_set_up_site_small_screen',
	},
	change_domain: {
		large_screen: 'calypso_a4a_sites_dataview_change_domain_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_change_domain_small_screen',
	},
	hosting_configuration: {
		large_screen: 'calypso_a4a_sites_dataview_hosting_configuration_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_hosting_configuration_small_screen',
	},
	remove_site: {
		large_screen: 'calypso_a4a_sites_dataview_remove_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_remove_small_screen',
	},
	prepare_for_launch: {
		large_screen: 'calypso_a4a_sites_dataview_prepare_for_launch_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_prepare_for_launch_small_screen',
	},
	delete_site: {
		large_screen: 'calypso_a4a_sites_dataview_delete_large_screen',
		small_screen: 'calypso_a4a_sites_dataview_delete_small_screen',
	},
};

// Returns event name based on the action type
const getActionEventName = ( actionType: AllowedActionTypes, isLargeScreen: boolean ) => {
	const deviceKey = isLargeScreen ? 'large_screen' : 'small_screen';
	return actionEventNames?.[ actionType ]?.[ deviceKey ];
};

export default getActionEventName;
