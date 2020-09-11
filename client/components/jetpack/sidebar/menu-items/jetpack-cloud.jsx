/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import { recordTracksEvent } from 'state/analytics/actions';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { settingsPath } from 'lib/jetpack/paths';
import { itemLinkMatches } from 'my-sites/sidebar/utils';
import SidebarItem from 'layout/sidebar/item';
import JetpackSidebarMenuItems from '.';

export default ( { path } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const onNavigate = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_settings_clicked' ) );

		setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	return (
		<>
			<JetpackSidebarMenuItems
				path={ path }
				showIcons={ true }
				tracksEventNames={ {
					activityClicked: 'calypso_jetpack_sidebar_activity_clicked',
					backupClicked: 'calypso_jetpack_sidebar_backup_clicked',
					scanClicked: 'calypso_jetpack_sidebar_scan_clicked',
				} }
			/>
			<SidebarItem
				materialIcon="settings"
				materialIconStyle="filled"
				label={ translate( 'Settings', {
					comment: 'Jetpack sidebar navigation item',
				} ) }
				link={ settingsPath( siteSlug ) }
				onNavigate={ onNavigate }
				selected={ itemLinkMatches( [ settingsPath( siteSlug ) ], path ) }
			/>
		</>
	);
};
