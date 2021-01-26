/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { backupPath, scanPath } from 'calypso/lib/jetpack/paths';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import getSiteScanProgress from 'calypso/state/selectors/get-site-scan-progress';
import getSiteScanThreats from 'calypso/state/selectors/get-site-scan-threats';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import QueryScanState from 'calypso/components/data/query-jetpack-scan';
import ScanBadge from 'calypso/components/jetpack/scan-badge';
import SidebarItem from 'calypso/layout/sidebar/item';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export default ( { path, showIcons, tracksEventNames, expandSection } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';

	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );

	const isWPCOM = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const scanProgress = useSelector( ( state ) => getSiteScanProgress( state, siteId ) );
	const scanThreats = useSelector( ( state ) => getSiteScanThreats( state, siteId ) );

	const onNavigate = ( event ) => () => {
		dispatch( recordTracksEvent( event ) );

		setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};
	const currentPathMatches = ( url ) => itemLinkMatches( [ url ], path );

	const isAdmin = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );

	return (
		<>
			<QueryScanState siteId={ siteId } />
			{ isAdmin && (
				<SidebarItem
					tipTarget="activity"
					icon={ showIcons ? 'clipboard' : undefined }
					label={ translate( 'Activity Log', {
						comment: 'Jetpack sidebar menu item',
					} ) }
					link={ `/activity-log/${ siteSlug }` }
					onNavigate={ onNavigate( tracksEventNames.activityClicked ) }
					selected={ currentPathMatches( `/activity-log/${ siteSlug }` ) }
					expandSection={ expandSection }
				/>
			) }
			{ isAdmin && ! isWPForTeamsSite && (
				<SidebarItem
					materialIcon={ showIcons ? 'backup' : undefined }
					materialIconStyle="filled"
					label="Backup"
					link={ backupPath( siteSlug ) }
					onNavigate={ onNavigate( tracksEventNames.backupClicked ) }
					selected={ currentPathMatches( backupPath( siteSlug ) ) }
					expandSection={ expandSection }
				/>
			) }
			{ isAdmin && ! isWPCOM && ! isWPForTeamsSite && (
				<SidebarItem
					materialIcon={ showIcons ? 'security' : undefined }
					materialIconStyle="filled"
					label="Scan"
					link={ scanPath( siteSlug ) }
					onNavigate={ onNavigate( tracksEventNames.scanClicked ) }
					selected={ currentPathMatches( scanPath( siteSlug ) ) }
					expandSection={ expandSection }
				>
					<ScanBadge progress={ scanProgress } numberOfThreatsFound={ scanThreats?.length ?? 0 } />
				</SidebarItem>
			) }
			{ ! isJetpackCloud() && (
				<SidebarItem
					tipTarget="jetpack-search"
					icon={ showIcons ? 'search' : undefined }
					label={ translate( 'Search', {
						comment: 'Jetpack sidebar menu item',
					} ) }
					link={ `/jetpack-search/${ siteSlug }` }
					onNavigate={ onNavigate( tracksEventNames.activityClicked ) }
					selected={ currentPathMatches( `/jetpack-search/${ siteSlug }` ) }
					expandSection={ expandSection }
				/>
			) }
		</>
	);
};
