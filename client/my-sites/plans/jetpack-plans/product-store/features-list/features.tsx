import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
} from '@automattic/calypso-products';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import GrowthIcon from 'calypso/assets/images/jetpack/jetpack-icon-growth.svg';
import LockIcon from 'calypso/assets/images/jetpack/jetpack-icon-lock.svg';
import PerformanceIcon from 'calypso/assets/images/jetpack/jetpack-icon-performance.svg';

type FeaturesGroup = {
	features: Array< TranslateResult >;
	icon: string;
	included: boolean;
	slug: string;
	title: string;
};

export function useBundleFeaturesList( planSlug: string ) {
	const translate = useTranslate();

	const securityBundleFeatures: Array< FeaturesGroup > = [
		{
			icon: LockIcon,
			included: true,
			slug: 'security',
			title: translate( 'Security' ),
			features: [
				translate( 'Real-time backups as you edit' ),
				translate( '10GB of cloud storage' ),
				translate( '30-day activity log archive' ),
				translate( 'Unlimited one-click restores from the last 30 days' ),
				translate( 'Real-time malware scanning and one-click fixes' ),
				translate( 'Comment and form spam protection (10k API calls/mo)' ),
			],
		},
		{
			icon: PerformanceIcon,
			included: false,
			slug: 'performance',
			title: translate( 'Performance' ),
			features: [ translate( 'Site Search' ), translate( 'VideoPress' ), translate( 'Boost' ) ],
		},
		{
			icon: GrowthIcon,
			included: false,
			slug: 'growth',
			title: translate( 'Growth' ),
			features: [ translate( 'CRM: with 30 extensions' ) ],
		},
	];

	const completeBundleFeatures: Array< FeaturesGroup > = [
		{
			icon: LockIcon,
			included: true,
			slug: 'security',
			title: translate( 'Security' ),
			features: [
				translate( 'Real-time backups as you edit' ),
				translate( '{{b}}1TB (1,000GB){{/b}} of cloud storage', {
					components: {
						b: <b />,
					},
				} ),
				translate( '{{b}}1-year{{/b}} activity log archive', {
					components: {
						b: <b />,
					},
				} ),
				translate( 'Unlimited one-click restores from the last {{b}}one year{{/b}}', {
					components: {
						b: <b />,
					},
				} ),
				translate( 'Real-time malware scanning and one-click fixes' ),
				translate( 'Comment and form spam protection ({{b}}60k API calls/mo{{/b}})', {
					components: {
						b: <b />,
					},
				} ),
			],
		},
		{
			icon: PerformanceIcon,
			included: true,
			slug: 'performance',
			title: translate( 'Performance' ),
			features: [
				<b>{ translate( 'Site Search: 100k records' ) }</b>,
				<b>{ translate( 'VideoPress: 1TB ad-free video hosting' ) }</b>,
				<b>{ translate( 'Boost: Automatic CSS Generation' ) }</b>,
			],
		},
		{
			icon: GrowthIcon,
			included: true,
			slug: 'growth',
			title: translate( 'Growth' ),
			features: [ <b>{ translate( 'CRM: Entrepreneur with 30 extensions' ) }</b> ],
		},
	];

	const bundleFeaturesList: Record< string, Array< FeaturesGroup > > = {
		[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: securityBundleFeatures,
		[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: securityBundleFeatures,
		[ PLAN_JETPACK_COMPLETE ]: completeBundleFeatures,
		[ PLAN_JETPACK_COMPLETE_MONTHLY ]: completeBundleFeatures,
	};

	return bundleFeaturesList[ planSlug ];
}
