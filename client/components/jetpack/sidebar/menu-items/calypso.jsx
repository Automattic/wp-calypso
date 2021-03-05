/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackSidebarMenuItems from '.';

export default ( { path, expandSection } ) => {
	return (
		<JetpackSidebarMenuItems
			path={ path }
			showIcons={ false }
			tracksEventNames={ {
				activityClicked: 'calypso_mysites_jetpack_sidebar_activity_clicked',
				backupClicked: 'calypso_mysites_jetpack_sidebar_backup_clicked',
				scanClicked: 'calypso_mysites_jetpack_sidebar_scan_clicked',
			} }
			expandSection={ expandSection }
		/>
	);
};
