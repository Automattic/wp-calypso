import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_BACKUPS, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import {
	chevronLeft,
	cloud,
	settings,
	currencyDollar,
	plugins,
	search,
	shield,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import QueryScanState from 'calypso/components/data/query-jetpack-scan';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import {
	settingsPath,
	purchasesPath,
	pluginsPath,
	backupPath,
	scanPath,
} from 'calypso/lib/jetpack/paths';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	JETPACK_CLOUD_ACTIVITY_LOG_LINK,
	JETPACK_CLOUD_SEARCH_LINK,
	JETPACK_CLOUD_SOCIAL_LINK,
} from './lib/constants';
import { redirectPage } from './lib/sidebar';

const useMenuItems = ( {
	siteId,
	path,
	isAgency,
}: {
	siteId: number | null;
	path: string;
	isAgency: boolean;
} ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasBackups = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);
	const hasScan = useSelector( ( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) );

	const isAdmin = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );

	const isWPCOM = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );

	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );

	const shouldShowSettings =
		useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) ) &&
		( hasBackups || hasScan );

	const shouldShowPurchases =
		useSelector( ( state ) => canCurrentUser( state, siteId, 'own_site' ) ) &&
		isSectionNameEnabled( 'site-purchases' );

	const isPluginManagementEnabled = config.isEnabled( 'jetpack/plugin-management' );

	return useMemo(
		() =>
			[
				{
					icon: <JetpackIcons icon="activity-log" size={ 24 } />,
					path: '/',
					link: `${ JETPACK_CLOUD_ACTIVITY_LOG_LINK }/${ siteSlug }`,
					title: translate( 'Activity Log' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_activity_clicked',
					enabled: isAdmin,
					isSelected: itemLinkMatches( path, `${ JETPACK_CLOUD_ACTIVITY_LOG_LINK }/${ siteSlug }` ),
				},
				{
					icon: plugins,
					path: '/',
					link: pluginsPath( siteSlug ),
					title: translate( 'Plugins' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_plugins_clicked',
					enabled: isPluginManagementEnabled && isAgency,
					isSelected: itemLinkMatches( path, pluginsPath( siteSlug ) ),
				},
				{
					icon: cloud,
					path: '/',
					link: backupPath( siteSlug ),
					title: translate( 'Backup' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_backup_clicked',
					enabled: isAdmin && ! isWPForTeamsSite,
					isSelected: itemLinkMatches( path, backupPath( siteSlug ) ),
				},
				{
					icon: shield,
					path: '/',
					link: scanPath( siteSlug ),
					title: translate( 'Scan' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_scan_clicked',
					enabled: isAdmin && ! isWPCOM && ! isWPForTeamsSite,
					isSelected: itemLinkMatches( path, scanPath( siteSlug ) ),
				},
				{
					icon: search,
					path: '/',
					link: `${ JETPACK_CLOUD_SEARCH_LINK }/${ siteSlug }`,
					title: translate( 'Search' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_search_clicked',
					enabled: isAdmin,
					isSelected: itemLinkMatches( path, `${ JETPACK_CLOUD_SEARCH_LINK }/${ siteSlug }` ),
				},
				{
					icon: <JetpackIcons icon="social" size={ 24 } />,
					path: '/',
					link: `${ JETPACK_CLOUD_SOCIAL_LINK }/${ siteSlug }`,
					title: translate( 'Social' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_social_clicked',
					enabled: isAdmin && isSectionNameEnabled( 'jetpack-social' ) && ! isWPForTeamsSite,
					isSelected: itemLinkMatches( path, `${ JETPACK_CLOUD_SOCIAL_LINK }/${ siteSlug }` ),
				},
				{
					icon: settings,
					path: '/',
					link: settingsPath( siteSlug ),
					title: translate( 'Settings' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_settings_clicked',
					enabled: shouldShowSettings,
					isSelected: itemLinkMatches( path, settingsPath( siteSlug ) ),
				},
				{
					icon: currencyDollar,
					path: '/',
					link: purchasesPath( siteSlug ),
					title: translate( 'Purchases' ),
					onClickMenuItem: redirectPage,
					trackEventName: 'calypso_jetpack_sidebar_purchases_clicked',
					enabled: shouldShowPurchases,
					isSelected: itemLinkMatches( path, purchasesPath( siteSlug ) ),
				},
			].filter( ( { enabled } ) => enabled ),
		[
			isAdmin,
			isAgency,
			isPluginManagementEnabled,
			isWPCOM,
			isWPForTeamsSite,
			path,
			shouldShowPurchases,
			shouldShowSettings,
			siteSlug,
			translate,
		]
	);
};

const ManageSelectedSiteSidebar = ( { path }: { path: string } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isAgency = useSelector( isAgencyUser );
	const menuItems = useMenuItems( { siteId, isAgency, path } );

	return (
		<>
			<QuerySiteFeatures siteIds={ [ siteId ] } />
			{ siteId && <QueryScanState siteId={ siteId } /> }
			<NewSidebar
				path="/"
				menuItems={ menuItems }
				backButtonProps={
					isAgency
						? {
								label: translate( 'Site Settings' ),
								icon: chevronLeft,
								onClick: () => redirectPage( '/dashboard' ),
						  }
						: undefined
				}
			/>
		</>
	);
};

export default ManageSelectedSiteSidebar;
