import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
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

		const siteSlug = urlToSlug( url );

		const handleClickMenuItem = ( actionType: AllowedActionTypes ) => {
			const eventName = getActionEventName( actionType, isLargeScreen );
			dispatch( recordTracksEvent( eventName ) );
		};

		const isWPCOMAtomicSiteCreationEnabled =
			isEnabled( 'jetpack/pro-dashboard-wpcom-atomic-hosting' ) && is_atomic;

		return [
			{
				name: translate( 'Set up site' ),
				href: `https://wordpress.com/home/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'set_up_site' ),
				isExternalLink: true,
				isEnabled: isWPCOMAtomicSiteCreationEnabled,
			},
			{
				name: translate( 'Change domain' ),
				href: `https://wordpress.com/domains/manage/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'change_domain' ),
				isExternalLink: true,
				isEnabled: isWPCOMAtomicSiteCreationEnabled,
			},
			{
				name: translate( 'Hosting configuration' ),
				href: `https://wordpress.com/hosting-config/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'hosting_configuration' ),
				isExternalLink: true,
				isEnabled: isWPCOMAtomicSiteCreationEnabled,
			},
			{
				name: translate( 'Issue new license' ),
				href: partnerCanIssueLicense
					? `/partner-portal/issue-license/?site_id=${ blog_id }&source=dashboard`
					: undefined,
				onClick: () => handleClickMenuItem( 'issue_license' ),
				isExternalLink: false,
				isEnabled: partnerCanIssueLicense && ! siteError && ! is_atomic,
			},
			{
				name: translate( 'View activity' ),
				href: is_atomic
					? `https://wordpress.com/activity-log/${ siteSlug }`
					: `/activity-log/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'view_activity' ),
				isExternalLink: is_atomic,
				isEnabled: ! siteError,
			},
			{
				name: translate( 'Copy this site' ),
				href: is_atomic
					? `https://wordpress.com/backup/${ siteSlug }/clone`
					: `/backup/${ siteSlug }/clone`,
				onClick: () => handleClickMenuItem( 'clone_site' ),
				isExternalLink: is_atomic,
				isEnabled: has_backup,
			},
			{
				name: translate( 'Site settings' ),
				href: is_atomic
					? `https://wordpress.com/settings/general/${ siteSlug }`
					: `/settings/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'site_settings' ),
				isExternalLink: is_atomic,
				isEnabled: has_backup,
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
				isEnabled: true,
			},
		];
	}, [ dispatch, isLargeScreen, partnerCanIssueLicense, siteError, siteValue, translate ] );
}
