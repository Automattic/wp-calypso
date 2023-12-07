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
				isEnabled: partnerCanIssueLicense && ! siteError,
			},
			{
				name: translate( 'View activity' ),
				href: `/activity-log/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'view_activity' ),
				isExternalLink: false,
				isEnabled: ! siteError,
			},
			{
				name: translate( 'Copy this site' ),
				href: `/backup/${ siteSlug }/clone`,
				onClick: () => handleClickMenuItem( 'clone_site' ),
				isExternalLink: false,
				isEnabled: has_backup,
			},
			{
				name: translate( 'Site settings' ),
				href: `/settings/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'site_settings' ),
				isExternalLink: false,
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
	}, [ dispatch, isLargeScreen, siteError, siteValue, translate ] );
}
