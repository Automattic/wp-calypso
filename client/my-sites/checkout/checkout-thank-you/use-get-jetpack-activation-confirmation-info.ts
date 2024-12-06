import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_COMPLETE_PLANS,
	JETPACK_GROWTH_PLANS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SECURITY_PLANS,
	JETPACK_VIDEOPRESS_PRODUCTS,
} from '@automattic/calypso-products';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { createElement, ReactNode } from 'react';
import successImageAntiSpam from 'calypso/assets/images/jetpack/licensing-activation-success-Anti-Spam.png';
import successImageComplete from 'calypso/assets/images/jetpack/licensing-activation-success-Complete.png';
import successImageDefault from 'calypso/assets/images/jetpack/licensing-activation-success-Default.png';
import successImageScan from 'calypso/assets/images/jetpack/licensing-activation-success-Scan.png';
import successImageSearch from 'calypso/assets/images/jetpack/licensing-activation-success-Search.png';
import { useSelector } from 'calypso/state';
import { getSiteSlug, getJetpackAdminUrl } from 'calypso/state/sites/selectors';

type ActivationConfirmationInfo = {
	image: string;
	text: TranslateResult | ReactNode;
	buttonUrl: string;
};

const useGetJetpackActivationConfirmationInfo = (
	siteId: number,
	productSlug: string
): ActivationConfirmationInfo => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const jetpackAdminUrl = useSelector( ( state ) =>
		getJetpackAdminUrl( state, siteId, productSlug )
	);

	const baseJetpackCloudUrl = 'https://cloud.jetpack.com';

	const confirmationInfo = {
		jetpack_anti_spam: {
			image: successImageAntiSpam,
			text: translate(
				"We'll take care of everything from here. Now you can enjoy a spam-free site!"
			),
			buttonUrl: jetpackAdminUrl || baseJetpackCloudUrl,
		},
		jetpack_backup: {
			image: successImageDefault,
			text: translate(
				'You can see your backups and restore your site on {{a}}cloud.jetpack.com{{/a}}. If you ever lose access to your site, you can restore it there.',
				{
					components: {
						a: createElement( 'a', { href: baseJetpackCloudUrl } ),
					},
				}
			),
			buttonUrl: siteSlug
				? `${ baseJetpackCloudUrl }/backup/${ siteSlug }`
				: `${ baseJetpackCloudUrl }/landing`,
		},
		jetpack_complete: {
			image: successImageComplete,
			text: translate(
				'You can see your backups, security scans, and restore your site on {{a}}cloud.jetpack.com{{/a}}. If you ever lose access to your site, you can restore it there.',
				{
					components: {
						a: createElement( 'a', { href: baseJetpackCloudUrl } ),
					},
				}
			),
			buttonUrl: siteSlug
				? `${ baseJetpackCloudUrl }/backup/${ siteSlug }`
				: `${ baseJetpackCloudUrl }/landing`,
		},
		jetpack_growth: {
			image: successImageDefault,
			text: translate( "You're all set!" ),
			buttonUrl: jetpackAdminUrl || baseJetpackCloudUrl,
		},
		jetpack_scan: {
			image: successImageScan,
			text: translate( 'You can see your security scans on {{a}}cloud.jetpack.com{{/a}}.', {
				components: {
					a: createElement( 'a', { href: baseJetpackCloudUrl } ),
				},
			} ),
			buttonUrl: siteSlug
				? `${ baseJetpackCloudUrl }/scan/${ siteSlug }`
				: `${ baseJetpackCloudUrl }/landing`,
		},
		jetpack_search: {
			image: successImageSearch,
			text: translate( "Next, we'll help you customize your Search experience for your visitors." ),
			buttonUrl: siteSlug
				? `${ baseJetpackCloudUrl }/jetpack-search/${ siteSlug }`
				: `${ baseJetpackCloudUrl }/landing`,
		},
		jetpack_security: {
			image: successImageDefault,
			text: translate(
				'You can see your backups, security scans, and restore your site on {{a}}cloud.jetpack.com{{/a}}. If you ever lose access to your site, you can restore it there.',
				{
					components: {
						a: createElement( 'a', { href: baseJetpackCloudUrl } ),
					},
				}
			),
			buttonUrl: siteSlug
				? `${ baseJetpackCloudUrl }/backup/${ siteSlug }`
				: `${ baseJetpackCloudUrl }/landing`,
		},
		jetpack_videopress: {
			image: successImageDefault,
			text: translate( 'Experience high-quality, ad-free video built specifically for WordPress.' ),
			buttonUrl: jetpackAdminUrl || baseJetpackCloudUrl,
		},
		default: {
			image: successImageDefault,
			text: translate( "You're all set!" ),
			buttonUrl: jetpackAdminUrl || baseJetpackCloudUrl,
		},
	};

	const productGroups: Record< string, readonly string[] > = {
		jetpack_anti_spam: JETPACK_ANTI_SPAM_PRODUCTS,
		jetpack_backup: JETPACK_BACKUP_PRODUCTS,
		jetpack_complete: JETPACK_COMPLETE_PLANS,
		jetpack_scan: JETPACK_SCAN_PRODUCTS,
		jetpack_search: JETPACK_SEARCH_PRODUCTS,
		jetpack_security: JETPACK_SECURITY_PLANS,
		jetpack_videopress: JETPACK_VIDEOPRESS_PRODUCTS,
		jetpack_growth: JETPACK_GROWTH_PLANS,
	};

	const productGroup =
		( Object.keys( productGroups ).find( ( key ) =>
			productGroups[ key ].includes( productSlug )
		) as keyof typeof confirmationInfo ) || 'default';

	return confirmationInfo[ productGroup ];
};

export default useGetJetpackActivationConfirmationInfo;
