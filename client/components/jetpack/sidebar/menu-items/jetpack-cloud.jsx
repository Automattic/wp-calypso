/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import SidebarItem from 'calypso/layout/sidebar/item';
import JetpackSidebarMenuItems from '.';

export default ( { path } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const onNavigate = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_settings_clicked' ) );

		setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	const shouldShowSettings = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);

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
			{ shouldShowSettings && (
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
			) }
		</>
	);
};
