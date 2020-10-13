/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import { backupPath, scanPath } from 'calypso/lib/jetpack/paths';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { useTranslate } from 'i18n-calypso';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import getSiteScanProgress from 'calypso/state/selectors/get-site-scan-progress';
import getSiteScanThreats from 'calypso/state/selectors/get-site-scan-threats';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import QueryScanState from 'calypso/components/data/query-jetpack-scan';
import ScanBadge from 'calypso/components/jetpack/scan-badge';
import SidebarItem from 'calypso/layout/sidebar/item';
import { isEnabled } from 'calypso/config';

export default ( { path, showIcons, tracksEventNames, expandSection } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';

	const isWPCOM = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const scanProgress = useSelector( ( state ) => getSiteScanProgress( state, siteId ) );
	const scanThreats = useSelector( ( state ) => getSiteScanThreats( state, siteId ) );

	const isDesktop = isEnabled( 'desktop' );

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
			{
				// Backup does not work in wp-desktop. Disable in the desktop app until
				// it can be revisited: https://github.com/Automattic/wp-desktop/issues/943
				! isDesktop && (
					<SidebarItem
						materialIcon={ showIcons ? 'backup' : undefined }
						materialIconStyle="filled"
						label="Backup"
						link={ backupPath( siteSlug ) }
						onNavigate={ onNavigate( tracksEventNames.backupClicked ) }
						selected={ currentPathMatches( backupPath( siteSlug ) ) }
						expandSection={ expandSection }
					/>
				)
			}
			{ ! isWPCOM && (
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
		</>
	);
};
