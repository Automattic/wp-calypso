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
import { activityLogPath, backupPath, scanPath } from 'lib/jetpack/paths';
import { recordTracksEvent } from 'state/analytics/actions';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import getSiteScanProgress from 'state/selectors/get-site-scan-progress';
import getSiteScanThreats from 'state/selectors/get-site-scan-threats';
import QueryScanState from 'components/data/query-jetpack-scan';
import SidebarItem from 'layout/sidebar/item';
import ScanBadge from 'components/jetpack/scan-badge';

export default ( { path, showIcons, tracksEventNames, expandSection } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';

	const scanProgress = useSelector( ( state ) => getSiteScanProgress( state, siteId ) );
	const scanThreats = useSelector( ( state ) => getSiteScanThreats( state, siteId ) );

	const onNavigate = ( event ) => () => {
		dispatch( recordTracksEvent( event ) );

		setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};
	const currentPathMatches = ( url ) => itemLinkMatches( [ url ], path );

	return (
		<>
			<QueryScanState siteId={ siteId } />
			<SidebarItem
				icon={ showIcons ? 'clipboard' : undefined }
				label={ translate( 'Activity Log', {
					comment: 'Jetpack sidebar menu item',
				} ) }
				link={ activityLogPath( siteSlug ) }
				onNavigate={ onNavigate( tracksEventNames.activityClicked ) }
				selected={ currentPathMatches( activityLogPath( siteSlug ) ) }
				expandSection={ expandSection }
			/>
			<SidebarItem
				materialIcon={ showIcons ? 'backup' : undefined }
				materialIconStyle="filled"
				label="Backup"
				link={ backupPath( siteSlug ) }
				onNavigate={ onNavigate( tracksEventNames.backupClicked ) }
				selected={ currentPathMatches( backupPath( siteSlug ) ) }
				expandSection={ expandSection }
			/>
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
		</>
	);
};
