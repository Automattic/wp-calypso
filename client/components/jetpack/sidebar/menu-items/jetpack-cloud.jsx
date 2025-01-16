import { WPCOM_FEATURES_BACKUPS, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { Icon, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import SidebarItem from 'calypso/layout/sidebar/item';
import {
	settingsPath,
	purchasesPath,
	purchasesBasePath,
	pluginsPath,
} from 'calypso/lib/jetpack/paths';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackIcons from './jetpack-icons';
import JetpackSidebarMenuItems from '.';

export default ( { path } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isAgency = useSelector( isAgencyUser );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasBackups = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);
	const hasScan = useSelector( ( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) );

	const onNavigate = ( event ) => () => {
		dispatch( recordTracksEvent( event ) );

		setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	const shouldShowSettings =
		useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) ) &&
		( hasBackups || hasScan );

	const shouldShowPurchases =
		isSectionNameEnabled( 'site-purchases' ) &&
		useSelector( ( state ) => canCurrentUser( state, siteId, 'own_site' ) );

	return (
		<>
			<QuerySiteFeatures siteIds={ [ siteId ] } />
			<JetpackSidebarMenuItems
				path={ path }
				showIcons
				tracksEventNames={ {
					activityClicked: 'calypso_jetpack_sidebar_activity_clicked',
					backupClicked: 'calypso_jetpack_sidebar_backup_clicked',
					scanClicked: 'calypso_jetpack_sidebar_scan_clicked',
					searchClicked: 'calypso_jetpack_sidebar_search_clicked',
					socialClicked: 'calypso_jetpack_sidebar_social_clicked',
				} }
			/>
			{ isAgency && (
				<SidebarItem
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					customIcon={ <Icon className="sidebar__menu-icon" size={ 28 } icon={ plugins } /> }
					label={ translate( 'Plugins', {
						comment: 'Jetpack sidebar navigation item',
					} ) }
					link={ pluginsPath( siteSlug ) }
					onNavigate={ onNavigate( 'calypso_jetpack_sidebar_plugins_clicked' ) }
					selected={ itemLinkMatches( pluginsPath( siteSlug ), path ) }
				/>
			) }
			{ shouldShowSettings && (
				<SidebarItem
					customIcon={ <JetpackIcons icon="settings" /> }
					label={ translate( 'Settings', {
						comment: 'Jetpack sidebar navigation item',
					} ) }
					link={ settingsPath( siteSlug ) }
					onNavigate={ onNavigate( 'calypso_jetpack_sidebar_settings_clicked' ) }
					selected={ itemLinkMatches( settingsPath( siteSlug ), path ) }
				/>
			) }
			{ shouldShowPurchases && (
				<SidebarItem
					customIcon={ <JetpackIcons icon="money" /> }
					label={ translate( 'Purchases', {
						comment: 'Jetpack sidebar navigation item',
					} ) }
					link={ purchasesPath( siteSlug ) }
					onNavigate={ onNavigate( 'calypso_jetpack_sidebar_purchases_clicked' ) }
					selected={ itemLinkMatches( purchasesBasePath(), path ) }
				/>
			) }
		</>
	);
};
