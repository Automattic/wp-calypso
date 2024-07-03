import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import getActionEventName from './get-action-event-name';
import type { SiteNode, AllowedActionTypes } from '../types';

export default function useSiteActions(
	site: SiteNode,
	isLargeScreen: boolean,
	siteError?: boolean
) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const partnerCanIssueLicense = Boolean( partner?.can_issue_licenses );

	const siteValue = site?.value;

	return useMemo( () => {
		if ( ! siteValue ) {
			return [];
		}

		const { url, url_with_scheme, blog_id, has_backup, is_atomic } = siteValue;

		let issueLicenseURL = undefined;

		if ( isA8CForAgencies() ) {
			issueLicenseURL = A4A_MARKETPLACE_LINK;
		} else if ( partnerCanIssueLicense ) {
			issueLicenseURL = `/partner-portal/issue-license/?site_id=${ blog_id }&source=dashboard`;
		}

		const siteSlug = urlToSlug( url );

		const handleClickMenuItem = ( actionType: AllowedActionTypes ) => {
			const eventName = getActionEventName( actionType, isLargeScreen );
			dispatch( recordTracksEvent( eventName ) );
		};

		const isWPCOMAtomicSiteCreationEnabled =
			( isEnabled( 'jetpack/pro-dashboard-wpcom-atomic-hosting' ) || isA8CForAgencies() ) &&
			is_atomic;

		const isUrlOnly = site?.value?.sticker?.includes( 'jetpack-manage-url-only-site' );

		return [
			{
				name: translate( 'Set up site' ),
				href: `https://wordpress.com/home/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'set_up_site' ),
				isExternalLink: true,
				isEnabled: isWPCOMAtomicSiteCreationEnabled && ! isUrlOnly,
			},
			{
				name: translate( 'Change domain' ),
				href: `https://wordpress.com/domains/manage/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'change_domain' ),
				isExternalLink: true,
				isEnabled: isWPCOMAtomicSiteCreationEnabled && ! isUrlOnly,
			},
			{
				name: translate( 'Hosting configuration' ),
				href: `https://wordpress.com/hosting-config/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'hosting_configuration' ),
				isExternalLink: true,
				isEnabled: isWPCOMAtomicSiteCreationEnabled && ! isUrlOnly,
			},
			{
				name: translate( 'Issue new license' ),
				href: issueLicenseURL,
				onClick: () => handleClickMenuItem( 'issue_license' ),
				isExternalLink: false,
				isEnabled:
					( partnerCanIssueLicense || isA8CForAgencies() ) &&
					! siteError &&
					! is_atomic &&
					! isUrlOnly,
			},
			{
				name: translate( 'View activity' ),
				href: is_atomic
					? `https://wordpress.com/activity-log/${ siteSlug }`
					: `/activity-log/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'view_activity' ),
				isExternalLink: is_atomic,
				isEnabled: ! siteError && ! isUrlOnly,
			},
			{
				name: translate( 'Copy this site' ),
				href: is_atomic
					? `https://wordpress.com/backup/${ siteSlug }/clone`
					: `/backup/${ siteSlug }/clone`,
				onClick: () => handleClickMenuItem( 'clone_site' ),
				isExternalLink: is_atomic,
				isEnabled: has_backup && ! isUrlOnly,
			},
			{
				name: translate( 'Site settings' ),
				href: is_atomic
					? `https://wordpress.com/settings/general/${ siteSlug }`
					: `/settings/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'site_settings' ),
				isExternalLink: is_atomic,
				isEnabled: has_backup && ! isUrlOnly,
			},
			{
				name: translate( 'View site' ),
				href: url_with_scheme,
				onClick: () => handleClickMenuItem( 'view_site' ),
				isExternalLink: true,
				isEnabled: true,
			},
			{
				name: translate( 'Visit WP Admin' ),
				href: `${ url_with_scheme }/wp-admin/admin.php?page=jetpack#/dashboard`,
				onClick: () => handleClickMenuItem( 'visit_wp_admin' ),
				isExternalLink: true,
				isEnabled: true && ! isUrlOnly,
			},
			{
				name: translate( 'Remove site' ),
				onClick: () => handleClickMenuItem( 'remove_site' ),
				isEnabled: isA8CForAgencies() && isEnabled( 'a4a-site-selector-and-importer' ),
				icon: 'trash',
				className: 'is-error',
			},
		];
	}, [
		dispatch,
		isLargeScreen,
		partnerCanIssueLicense,
		site?.value?.sticker,
		siteError,
		siteValue,
		translate,
	] );
}
