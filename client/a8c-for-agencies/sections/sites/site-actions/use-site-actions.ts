import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isA4AClientSite from 'calypso/state/sites/selectors/is-a4a-client-site';
import { JETPACK_ACTIVITY_ID, JETPACK_BACKUP_ID } from '../features/features';
import SitesDashboardContext from '../sites-dashboard-context';
import getActionEventName from './get-action-event-name';
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
				href: `https://wordpress.com/settings/general/${ blog_id }?referer=a4a-dashboard`,
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
				isEnabled: true,
			},
		];
	}, [
		dispatch,
		isLargeScreen,
		isWPCOMSimpleSite,
		isWPCOMSite,
		onSelect,
		setSelectedSiteFeature,
		site?.value?.sticker,
		siteError,
		siteValue,
		translate,
	] );
}
