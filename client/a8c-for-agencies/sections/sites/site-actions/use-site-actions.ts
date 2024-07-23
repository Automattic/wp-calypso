import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isA4AClientSite from 'calypso/state/sites/selectors/is-a4a-client-site';
import getActionEventName from './get-action-event-name';
import type { SiteNode, AllowedActionTypes } from '../types';

type Props = {
	site: SiteNode;
	isLargeScreen: boolean;
	siteError?: boolean;
	onSelect?: ( action: AllowedActionTypes ) => void;
};

export default function useSiteActions( { site, isLargeScreen, siteError, onSelect }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteValue = site?.value;

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
				href: A4A_MARKETPLACE_LINK,
				onClick: () => handleClickMenuItem( 'issue_license' ),
				isExternalLink: false,
				isEnabled: ! siteError && ! isWPCOMSite && ! isUrlOnly,
			},
			{
				name: translate( 'View activity' ),
				href: isWPCOMSite
					? `https://wordpress.com/activity-log/${ blog_id }`
					: `/sites/overview/${ siteSlug }/jetpack-activity`,
				onClick: () => handleClickMenuItem( 'view_activity' ),
				isExternalLink: isWPCOMSite,
				isEnabled: ! siteError && ! isUrlOnly,
			},
			{
				name: translate( 'Copy this site' ),
				href: isWPCOMSite
					? `https://wordpress.com/backup/${ siteSlug }/clone`
					: `/sites/overview/${ siteSlug }/backup`,
				onClick: () => handleClickMenuItem( 'clone_site' ),
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
		site?.value?.sticker,
		siteError,
		siteValue,
		translate,
	] );
}
