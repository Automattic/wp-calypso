import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { external, trash } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isA4AClientSite from 'calypso/state/sites/selectors/is-a4a-client-site';
import { JETPACK_ACTIVITY_ID, JETPACK_BACKUP_ID } from '../features/features';
import SitesDashboardContext from '../sites-dashboard-context';
import createDeleteSiteActionModal from './delete-site-action-modal';
import getActionEventName from './get-action-event-name';
import createRemoveSiteActionModal from './remove-site-action-modal';
import type { SiteData } from '../../../../jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import type { SiteNode, AllowedActionTypes } from '../types';

type Props = {
	site: SiteNode;
	isLargeScreen: boolean;
	isDevSite?: boolean;
	siteError?: boolean;
	onSelect?: ( action: AllowedActionTypes ) => void;
};

export default function useSiteActions( {
	site,
	isLargeScreen,
	isDevSite,
	siteError,
	onSelect,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteValue = site?.value;

	const { setSelectedSiteFeature, setDataViewsState } = useContext( SitesDashboardContext );

	const isWPCOMAtomicSite = useSelector( ( state ) => isAtomicSite( state, siteValue?.blog_id ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteValue?.blog_id ) );
	const isA4AClient = useSelector( ( state ) => isA4AClientSite( state, siteValue?.blog_id ) );
	const isWPCOMSimpleSite = ! isJetpack && ! isA4AClient;
	const isWPCOMSite = isWPCOMSimpleSite || isWPCOMAtomicSite;

	const hasRemoveManagedSitesCapability = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_remove_managed_sites' )
	);

	// Whether to enable the Remove site action. The action will remove the site from the A4A dashboard but the site and its license will still exist.
	const canRemove = ! isDevSite && hasRemoveManagedSitesCapability;

	// Whether to enable the Delete site action. The action will remove the site from the A4A dashboard and delete the site and its license.
	// We are temporarily forcing canDelete to false to hide the option while the feature is not working as expected.
	const canDelete = isDevSite && hasRemoveManagedSitesCapability && false;

	return useMemo( () => {
		if ( ! siteValue ) {
			return [];
		}

		const { url, url_with_scheme, has_backup, blog_id } = siteValue;

		const siteSlug = urlToSlug( url );

		const urlWithScheme = isWPCOMSimpleSite
			? url_with_scheme.replace( 'wpcomstaging.com', 'wordpress.com' ) // Replace staging domain with wordpress.com if it's a simple site
			: url_with_scheme;

		const handleClickMenuItem = ( actionType: AllowedActionTypes ) => {
			const eventName = getActionEventName( actionType, isLargeScreen );
			dispatch( recordTracksEvent( eventName ) );
			onSelect?.( actionType );
		};

		const isUrlOnly = site?.value?.sticker?.includes( 'jetpack-manage-url-only-site' );

		return [
			{
				name: translate( 'Prepare for launch' ),
				href: `https://wordpress.com/sites/settings/site/${ blog_id }`,
				onClick: () => handleClickMenuItem( 'prepare_for_launch' ),
				isExternalLink: true,
				isEnabled: isDevSite,
			},
			{
				name: translate( 'Set up site' ),
				href: `https://wordpress.com/overview/${ blog_id }`,
				onClick: () => handleClickMenuItem( 'set_up_site' ),
				isExternalLink: true,
				isEnabled: isWPCOMSite && ! isUrlOnly,
			},
			{
				name: translate( 'Change domain' ),
				href: `https://wordpress.com/domains/manage/${ blog_id }`,
				onClick: () => handleClickMenuItem( 'change_domain' ),
				isExternalLink: true,
				isEnabled: isWPCOMSite && ! isUrlOnly,
			},
			{
				name: translate( 'Hosting configuration' ),
				href: `https://wordpress.com/hosting-config/${ blog_id }`,
				onClick: () => handleClickMenuItem( 'hosting_configuration' ),
				isExternalLink: true,
				isEnabled: isWPCOMSite && ! isUrlOnly,
			},
			{
				name: translate( 'Issue new license' ),
				onClick: () => {
					page( A4A_MARKETPLACE_LINK );
					handleClickMenuItem( 'issue_license' );
				},
				isExternalLink: false,
				isEnabled: ! siteError && ! isWPCOMSite && ! isUrlOnly,
			},
			{
				name: translate( 'View activity' ),
				href: isWPCOMSite ? `https://wordpress.com/activity-log/${ blog_id }` : null,
				onClick: () => {
					if ( ! isWPCOMSite ) {
						setDataViewsState( ( prevState: DataViewsState ) => ( {
							...prevState,
							selectedItem: site?.value,
							type: DATAVIEWS_LIST,
						} ) );
						setSelectedSiteFeature( JETPACK_ACTIVITY_ID );
					}
					handleClickMenuItem( 'view_activity' );
				},
				isExternalLink: isWPCOMSite,
				isEnabled: ! siteError && ! isUrlOnly,
			},
			{
				name: translate( 'Copy this site' ),
				href: isWPCOMSite ? `https://wordpress.com/backup/${ siteSlug }/clone` : null,
				onClick: () => {
					if ( ! isWPCOMSite ) {
						setDataViewsState( ( prevState: DataViewsState ) => ( {
							...prevState,
							selectedItem: site?.value,
							type: DATAVIEWS_LIST,
						} ) );
						setSelectedSiteFeature( JETPACK_BACKUP_ID );
					}
					handleClickMenuItem( 'clone_site' );
				},
				isExternalLink: isWPCOMSite,
				isEnabled: has_backup && ! isUrlOnly,
			},
			{
				name: translate( 'Site settings' ),
				href: `https://wordpress.com/settings/general/${ blog_id }`,
				onClick: () => handleClickMenuItem( 'site_settings' ),
				isExternalLink: true,
				isEnabled: isWPCOMSite && ! isUrlOnly,
			},
			{
				name: translate( 'View site' ),
				href: urlWithScheme,
				onClick: () => handleClickMenuItem( 'view_site' ),
				isExternalLink: true,
				isEnabled: true,
			},
			{
				name: translate( 'Visit WP Admin' ),
				href: `${ urlWithScheme }/wp-admin`,
				onClick: () => handleClickMenuItem( 'visit_wp_admin' ),
				isExternalLink: true,
				isEnabled: true && ! isUrlOnly,
			},
			{
				name: translate( 'Remove site' ),
				onClick: () => handleClickMenuItem( 'remove_site' ),
				icon: 'trash',
				className: 'is-error',
				isEnabled: canRemove,
			},
			{
				name: translate( 'Delete site' ),
				onClick: () => handleClickMenuItem( 'delete_site' ),
				icon: 'trash',
				className: 'is-error',
				isEnabled: canDelete,
			},
		];
	}, [
		canDelete,
		canRemove,
		dispatch,
		isDevSite,
		isLargeScreen,
		isWPCOMSimpleSite,
		isWPCOMSite,
		onSelect,
		setDataViewsState,
		setSelectedSiteFeature,
		site?.value,
		siteError,
		siteValue,
		translate,
	] );
}

type SiteActions = {
	isLoading: boolean;
	isLargeScreen: boolean;
	onRefetchSite?: () => Promise< unknown >;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
	setSelectedSiteFeature: ( siteFeature: string | undefined ) => void;
};

export function useSiteActionsDataViews( {
	isLoading,
	isLargeScreen,
	onRefetchSite,
	setDataViewsState,
	setSelectedSiteFeature,
}: SiteActions ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasRemoveManagedSitesCapability = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_remove_managed_sites' )
	);

	return useMemo( () => {
		const isUrlOnly = ( item: SiteData ) =>
			item.site?.value?.sticker?.includes( 'jetpack-manage-url-only-site' );
		const isAtomicSite = ( item: SiteData ) => item.site.value.is_atomic;
		const isSimpleSite = ( item: SiteData ) => item.site.value.is_simple;
		const isWPComSite = ( item: SiteData ) => isAtomicSite( item ) || isSimpleSite( item );
		const isDevSite = ( item: SiteData ) => item.site.value.a4a_is_dev_site;
		const getBlogId = ( item: SiteData ) => item.site.value.blog_id;
		const hasBackup = ( item: SiteData ) => item.site.value.has_backup;
		const getSiteSlug = ( item: SiteData ) => urlToSlug( item.site.value.url );
		const getUrlWithScheme = ( item: SiteData ) => {
			return isWPComSite( item )
				? item.site.value.url_with_scheme.replace( 'wpcomstaging.com', 'wordpress.com' ) // Replace staging domain with wordpress.com if it's a simple site
				: item.site.value.url_with_scheme;
		};

		// In the previous field-based Actions implementation (see useSiteActions above),
		// some of the logic to enable action lived in the Actions field and some other in the isEnabled flag.
		// This meant that some conditions in isEnabled were redundant (e.g.: "! item.site.error")
		// or conflicting (checking for "! item.site.value.is_simple" in the field but checking
		// for "item.site.value.is_simple" in the isEnabled flag).
		//
		// canHaveActions represents the logic common to all actions that previously lived in the field,
		// and isEligible has been updated to remove redundant and conflicting checks,
		// that's why it's not exactly the same as isEnable above.
		const isNotProduction = config( 'env_id' ) !== 'a8c-for-agencies-production';
		const canHaveActions = ( item: SiteData ) =>
			! isLoading &&
			( ! item.site.value.sticker?.includes( 'migration-in-process' ) || isNotProduction ) &&
			! item.site.error &&
			! item.site.value.is_simple;

		const recordTracksEventRemoveSite = () =>
			dispatch( recordTracksEvent( getActionEventName( 'remove_site', isLargeScreen ) ) );
		const recordTracksEventDeleteSite = () =>
			dispatch( recordTracksEvent( getActionEventName( 'delete_site', isLargeScreen ) ) );

		return [
			{
				label: translate( 'Prepare for launch' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && isDevSite( item );
				},
				callback( items: SiteData[] ) {
					window.open( `https://wordpress.com/sites/settings/site/${ getBlogId( items[ 0 ] ) }` );
					dispatch(
						recordTracksEvent( getActionEventName( 'prepare_for_launch', isLargeScreen ) )
					);
				},
			},
			{
				id: 'set_up_site',
				label: translate( 'Set up site' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && isAtomicSite( item ) && ! isUrlOnly( item );
				},
				callback( items: SiteData[] ) {
					window.open( `https://wordpress.com/overview/${ getBlogId( items[ 0 ] ) }` );
					dispatch( recordTracksEvent( getActionEventName( 'set_up_site', isLargeScreen ) ) );
				},
			},
			{
				id: 'change_domain',
				label: translate( 'Change domain' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && isAtomicSite( item ) && ! isUrlOnly( item );
				},
				callback( items: SiteData[] ) {
					window.open( `https://wordpress.com/domains/manage/${ getBlogId( items[ 0 ] ) }` );
					dispatch( recordTracksEvent( getActionEventName( 'change_domain', isLargeScreen ) ) );
				},
			},
			{
				id: 'hosting_configuration',
				label: translate( 'Hosting configuration' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && isAtomicSite( item ) && ! isUrlOnly( item );
				},
				callback( items: SiteData[] ) {
					window.open( `https://wordpress.com/hosting-config/${ getBlogId( items[ 0 ] ) }` );
					dispatch(
						recordTracksEvent( getActionEventName( 'hosting_configuration', isLargeScreen ) )
					);
				},
			},
			{
				id: 'issue_license',
				label: translate( 'Issue new license' ),
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && ! isAtomicSite( item ) && ! isUrlOnly( item );
				},
				callback: () => {
					page( A4A_MARKETPLACE_LINK );
					dispatch( recordTracksEvent( getActionEventName( 'issue_license', isLargeScreen ) ) );
				},
			},
			{
				id: 'view_activity_not_wpcom',
				label: translate( 'View activity' ),
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && ! isAtomicSite( item ) && ! isUrlOnly( item );
				},
				callback( items: SiteData[] ) {
					const item = items[ 0 ];
					setDataViewsState( ( prevState: DataViewsState ) => ( {
						...prevState,
						selectedItem: item.site?.value,
						type: DATAVIEWS_LIST,
					} ) );
					setSelectedSiteFeature( JETPACK_ACTIVITY_ID );
					dispatch( recordTracksEvent( getActionEventName( 'view_activity', isLargeScreen ) ) );
				},
			},
			{
				id: 'view_activity_wpcom',
				label: translate( 'View activity' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && isAtomicSite( item ) && ! isUrlOnly( item );
				},
				callback( items: SiteData[] ) {
					window.open( `https://wordpress.com/activity-log/${ getBlogId( items[ 0 ] ) }` );
					dispatch( recordTracksEvent( getActionEventName( 'view_activity', isLargeScreen ) ) );
				},
			},
			{
				id: 'clone_site_wpcom',
				label: translate( 'Copy this site' ),
				icon: external,
				isEligible( item: SiteData ) {
					return (
						canHaveActions( item ) &&
						isAtomicSite( item ) &&
						hasBackup( item ) &&
						! isUrlOnly( item )
					);
				},
				callback( items: SiteData[] ) {
					window.open( `https://wordpress.com/backup/${ getSiteSlug( items[ 0 ] ) }/clone` );
					dispatch( recordTracksEvent( getActionEventName( 'clone_site', isLargeScreen ) ) );
				},
			},
			{
				id: 'clone_site_not_wpcom',
				label: translate( 'Copy this site' ),
				isEligible( item: SiteData ) {
					return (
						canHaveActions( item ) &&
						! isAtomicSite( item ) &&
						hasBackup( item ) &&
						! isUrlOnly( item )
					);
				},
				callback( items: SiteData[] ) {
					setDataViewsState( ( prevState: DataViewsState ) => ( {
						...prevState,
						selectedItem: items[ 0 ].site.value,
						type: DATAVIEWS_LIST,
					} ) );
					setSelectedSiteFeature( JETPACK_BACKUP_ID );
					dispatch( recordTracksEvent( getActionEventName( 'clone_site', isLargeScreen ) ) );
				},
			},
			{
				id: 'site_settings',
				label: translate( 'Site settings' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && isAtomicSite( item ) && ! isUrlOnly( item );
				},
				callback( items: SiteData[] ) {
					window.open( `https://wordpress.com/sites/settings/site/${ getSiteSlug( items[ 0 ] ) }` );
					dispatch( recordTracksEvent( getActionEventName( 'site_settings', isLargeScreen ) ) );
				},
			},
			{
				id: 'view_site',
				label: translate( 'View site' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item );
				},
				callback( items: SiteData[] ) {
					window.open( getUrlWithScheme( items[ 0 ] ) );
					dispatch( recordTracksEvent( getActionEventName( 'view_site', isLargeScreen ) ) );
				},
			},
			{
				id: 'visit_wp_admin',
				label: translate( 'Visit WP Admin' ),
				icon: external,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && ! isUrlOnly( item );
				},
				callback( items: SiteData[] ) {
					window.open( `${ getUrlWithScheme( items[ 0 ] ) }/wp-admin` );
					dispatch( recordTracksEvent( getActionEventName( 'visit_wp_admin', isLargeScreen ) ) );
				},
			},
			{
				id: 'remove_site',
				label: translate( 'Remove site' ),
				icon: trash,
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && ! isDevSite( item ) && hasRemoveManagedSitesCapability;
				},
				RenderModal: createRemoveSiteActionModal( {
					onRefetchSite,
					recordTracksEventRemoveSite,
				} ),
				isDestructive: true,
			},
			{
				id: 'delete_site',
				label: translate( 'Delete site' ),
				isEligible( item: SiteData ) {
					return canHaveActions( item ) && false; // Feature is always disabled, see canDelete above.
				},
				RenderModal: createDeleteSiteActionModal( {
					recordTracksEventDeleteSite,
				} ),
			},
		];
	}, [
		translate,
		onRefetchSite,
		isLoading,
		dispatch,
		isLargeScreen,
		setDataViewsState,
		setSelectedSiteFeature,
		hasRemoveManagedSitesCapability,
	] );
}
