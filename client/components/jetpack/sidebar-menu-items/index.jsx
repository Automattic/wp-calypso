/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { itemLinkMatches } from 'my-sites/sidebar/utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { expandMySitesSidebarSection } from 'state/my-sites/sidebar/actions';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { SIDEBAR_SECTION_JETPACK } from 'my-sites/sidebar/constants';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import getSiteScanProgress from 'state/selectors/get-site-scan-progress';
import getSiteScanThreats from 'state/selectors/get-site-scan-threats';
import QueryScanState from 'components/data/query-jetpack-scan';
import SidebarItem from 'layout/sidebar/item';
import ScanBadge from 'components/jetpack/scan-badge';

const trackClickAndNavigate = ( dispatch, prefix, event, params ) => () => {
	dispatch( recordTracksEvent( `${ prefix }_${ event }`, params ) );

	setNextLayoutFocus( 'content' );
	window.scrollTo( 0, 0 );
};

export const CalypsoJetpackSidebarMenuItems = ( { path } ) => (
	<JetpackSidebarMenuItems
		path={ path }
		showIcons={ false }
		tracksPrefix="calypso_mysites_jetpack_sidebar"
	/>
);

export const JetpackCloudSidebarMenuItems = ( { path } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const TRACKS_PREFIX = 'calypso_jetpack_sidebar';

	const onNavigate = trackClickAndNavigate( dispatch, TRACKS_PREFIX, 'settings_clicked' );

	return (
		<>
			<JetpackSidebarMenuItems path={ path } showIcons={ true } tracksPrefix={ TRACKS_PREFIX } />
			<SidebarItem
				materialIcon="settings"
				materialIconStyle="filled"
				label={ translate( 'Settings', {
					comment: 'Jetpack sidebar navigation item',
				} ) }
				link={ `/settings/${ siteSlug }` }
				onNavigate={ onNavigate }
				selected={ itemLinkMatches( [ '/settings' ], path ) }
			/>
		</>
	);
};

const JetpackSidebarMenuItems = ( { path, showIcons, tracksPrefix } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';

	const scanProgress = useSelector( ( state ) => getSiteScanProgress( state, siteId ) );
	const scanThreats = useSelector( ( state ) => getSiteScanThreats( state, siteId ) );

	const onNavigate = ( event, params ) =>
		trackClickAndNavigate( dispatch, tracksPrefix, event, params );

	const currentPathMatches = ( url ) => itemLinkMatches( [ url ], path );
	const expandSection = () => expandMySitesSidebarSection( SIDEBAR_SECTION_JETPACK );

	return (
		<>
			<QueryScanState siteId={ siteId } />
			<SidebarItem
				icon={ showIcons ? 'clipboard' : undefined }
				label={ translate( 'Activity Log', {
					comment: 'Jetpack sidebar menu item',
				} ) }
				link={ `/activity-log/${ siteSlug }` }
				onNavigate={ onNavigate( 'activity_clicked' ) }
				selected={ currentPathMatches( '/activity-log' ) }
				expandSection={ expandSection }
			/>
			<SidebarItem
				materialIcon={ showIcons ? 'backup' : undefined }
				materialIconStyle="filled"
				label="Backup"
				link={ `/backup/${ siteSlug }` }
				onNavigate={ onNavigate( 'item_clicked', { menu_item: 'backup' } ) }
				selected={ currentPathMatches( '/backup' ) }
				expandSection={ expandSection }
			/>
			<SidebarItem
				materialIcon={ showIcons ? 'security' : undefined }
				materialIconStyle="filled"
				label="Scan"
				link={ `/scan/${ siteSlug }` }
				onNavigate={ onNavigate( 'item_clicked', { menu_item: 'scan' } ) }
				selected={ currentPathMatches( '/scan' ) }
				expandSection={ expandSection }
			>
				<ScanBadge progress={ scanProgress } numberOfThreatsFound={ scanThreats?.length ?? 0 } />
			</SidebarItem>
		</>
	);
};
