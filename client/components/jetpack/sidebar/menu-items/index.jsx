/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import { backupPath, scanPath } from 'lib/jetpack/paths';
import { itemLinkMatches } from 'my-sites/sidebar/utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { useTranslate } from 'i18n-calypso';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import getSiteScanProgress from 'state/selectors/get-site-scan-progress';
import getSiteScanThreats from 'state/selectors/get-site-scan-threats';
import getIsSiteWPCOM from 'state/selectors/is-site-wpcom';
import QueryScanState from 'components/data/query-jetpack-scan';
import ScanBadge from 'components/jetpack/scan-badge';
import SidebarItem from 'layout/sidebar/item';
import { isEnabled } from 'config';

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
