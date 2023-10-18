import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_BACKUPS, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { chevronLeft, cloud, cog, currencyDollar, plugins, search, shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
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

const ManageSelectedSiteSidebar = ( { path }: { path: string } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isAgency = useSelector( isAgencyUser );
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

	const onClickMenuItem = ( url: string ) => {
		page.redirect( url );
	};

	const menuItems = useMemo(
		() =>
			[
				{
					icon: <JetpackIcons icon="activity-log" size={ 24 } />,
					path: '/',
					link: `/activity-log/${ siteSlug }`,
					title: translate( 'Activity Log' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_activity_clicked',
					enabled: isAdmin,
					isSelected: itemLinkMatches( path, `/activity-log/${ siteSlug }` ),
				},
				{
					icon: cloud,
					path: '/',
					link: backupPath( siteSlug ),
					title: translate( 'VaultPress Backup' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_backup_clicked',
					enabled: isAdmin && ! isWPForTeamsSite,
					isSelected: itemLinkMatches( path, backupPath( siteSlug ) ),
				},
				{
					icon: shield,
					path: '/',
					link: scanPath( siteSlug ),
					title: translate( 'Scan' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_scan_clicked',
					enabled: isAdmin && ! isWPCOM && ! isWPForTeamsSite,
					isSelected: itemLinkMatches( path, scanPath( siteSlug ) ),
				},
				{
					icon: search,
					path: '/',
					link: `/jetpack-search/${ siteSlug }`,
					title: translate( 'Search' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_search_clicked',
					enabled: isAdmin,
					isSelected: itemLinkMatches( path, `/jetpack-search/${ siteSlug }` ),
				},
				{
					icon: <JetpackIcons icon="activity-log" size={ 24 } />,
					path: '/',
					link: `/jetpack-social/${ siteSlug }`,
					title: translate( 'Social' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_social_clicked',
					enabled: isAdmin && isSectionNameEnabled( 'jetpack-social' ) && ! isWPForTeamsSite,
					isSelected: itemLinkMatches( path, `/jetpack-social/${ siteSlug }` ),
				},
				{
					icon: plugins,
					path: '/',
					link: pluginsPath( siteSlug ),
					title: translate( 'Plugins' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_plugins_clicked',
					enabled: isPluginManagementEnabled && isAgency,
					isSelected: itemLinkMatches( path, pluginsPath( siteSlug ) ),
				},
				{
					icon: cog,
					path: '/',
					link: settingsPath( siteSlug ),
					title: translate( 'Settings' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_settings_clicked',
					enabled: shouldShowSettings,
					isSelected: itemLinkMatches( path, settingsPath( siteSlug ) ),
				},
				{
					icon: currencyDollar,
					path: '/',
					link: purchasesPath( siteSlug ),
					title: translate( 'Purchases' ),
					onClickMenuItem: onClickMenuItem,
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
								label: translate( 'Site Management' ),
								icon: chevronLeft,
								onClick: () => onClickMenuItem( '/dashboard' ),
						  }
						: undefined
				}
			/>
		</>
	);
};

export default ManageSelectedSiteSidebar;
