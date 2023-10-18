import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_BACKUPS, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { Icon, chevronLeft, plugins } from '@wordpress/icons';
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
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const ManageSelectedSiteSidebar = () => {
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

	const onClickMenuItem = ( path: string ) => {
		page.redirect( path );
	};

	const menuItems = useMemo(
		() =>
			[
				{
					icon: <JetpackIcons icon="activity-log" />,
					path: '/',
					link: `/activity-log/${ siteSlug }`,
					title: translate( 'Activity Log' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_activity_clicked',
					enabled: isAdmin,
				},
				{
					icon: <JetpackIcons icon="backup" />,
					path: '/',
					link: backupPath( siteSlug ),
					title: translate( 'VaultPress Backup' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_backup_clicked',
					enabled: isAdmin && ! isWPForTeamsSite,
				},
				{
					icon: <JetpackIcons icon="scan" />,
					path: '/',
					link: scanPath( siteSlug ),
					title: translate( 'Scan' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_scan_clicked',
					enabled: isAdmin && ! isWPCOM && ! isWPForTeamsSite,
				},
				{
					icon: <JetpackIcons icon="search" />,
					path: '/',
					link: `/jetpack-search/${ siteSlug }`,
					title: translate( 'Search' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_search_clicked',
					enabled: isAdmin,
				},
				{
					icon: <JetpackIcons icon="social" />,
					path: '/',
					link: `/jetpack-social/${ siteSlug }`,
					title: translate( 'Social' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_social_clicked',
					enabled: isAdmin && isSectionNameEnabled( 'jetpack-social' ) && ! isWPForTeamsSite,
				},
				{
					icon: <Icon className="sidebar__menu-icon" size={ 28 } icon={ plugins } />,
					path: '/',
					link: pluginsPath( siteSlug ),
					title: translate( 'Plugins' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_plugins_clicked',
					enabled: isPluginManagementEnabled && isAgency,
				},
				{
					icon: <JetpackIcons icon="settings" />,
					path: '/',
					link: settingsPath( siteSlug ),
					title: translate( 'Settings' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_settings_clicked',
					enabled: shouldShowSettings,
				},
				{
					icon: <JetpackIcons icon="money" />,
					path: '/',
					link: purchasesPath( siteSlug ),
					title: translate( 'Purchases' ),
					onClickMenuItem: onClickMenuItem,
					trackEventName: 'calypso_jetpack_sidebar_purchases_clicked',
					enabled: shouldShowPurchases,
				},
			].filter( ( { enabled } ) => enabled ),
		[
			isAdmin,
			isAgency,
			isPluginManagementEnabled,
			isWPCOM,
			isWPForTeamsSite,
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
