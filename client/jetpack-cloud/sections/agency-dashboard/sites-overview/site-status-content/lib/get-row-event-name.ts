// Status event names for large (>960px) and small (<960px) screens.

import { AllowedStatusTypes, AllowedTypes, StatusEventNames } from '../../types';

const backup: StatusEventNames = {
	inactive: {
		small_screen: 'calypso_jetpack_agency_dashboard_add_backup_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_add_backup_click_large_screen',
	},
	progress: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_progress_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_progress_click_large_screen',
	},
	critical: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_failed_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_failed_click_large_screen',
	},
	warning: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_warning_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_warning_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_success_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_success_click_large_screen',
	},
};

// Scan feature status event names for large screen(>960px) and small screen(<960px)
const scan: StatusEventNames = {
	inactive: {
		small_screen: 'calypso_jetpack_agency_dashboard_add_scan_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_add_scan_click_large_screen',
	},
	progress: {
		small_screen: 'calypso_jetpack_agency_dashboard_scan_progress_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_scan_progress_click_large_screen',
	},
	failed: {
		small_screen: 'calypso_jetpack_agency_dashboard_scan_threats_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_scan_threats_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_scan_success_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_scan_success_click_large_screen',
	},
};

// Monitor feature status event names for large screen(>960px) and small screen(<960px)
const monitor: StatusEventNames = {
	disabled: {
		small_screen: 'calypso_jetpack_agency_dashboard_monitor_inactive_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_monitor_inactive_click_large_screen',
	},
	failed: {
		small_screen: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_monitor_success_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_monitor_success_click_large_screen',
	},
};

// Plugin updates status event names for large screen(>960px) and small screen(<960px)
const plugin: StatusEventNames = {
	warning: {
		small_screen: 'calypso_jetpack_agency_dashboard_update_plugins_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_update_plugins_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_plugin_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_plugin_click_large_screen',
	},
};

// Returns event name needed for all the feature state clicks on the agency dashboard
const getRowEventName = (
	type: AllowedTypes,
	status: AllowedStatusTypes,
	isLargeScreen: boolean
) => {
	const deviceKey = isLargeScreen ? 'large_screen' : 'small_screen';

	switch ( type ) {
		case 'backup': {
			return backup[ status ]?.[ deviceKey ];
		}
		case 'scan': {
			return scan[ status ]?.[ deviceKey ];
		}
		case 'monitor': {
			return monitor[ status ]?.[ deviceKey ];
		}
		case 'plugin': {
			return plugin[ status ]?.[ deviceKey ];
		}
	}
};

export default getRowEventName;
