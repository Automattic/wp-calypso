import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsQuery } from '../../app/queries';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import {
	default as AgencySettingsSummary,
	useCanRenderAgencySettingsSummary,
} from '../settings-agency/summary';
import CachingSettingsSummary from '../settings-caching/summary';
import DatabaseSettingsSummary from '../settings-database/summary';
import {
	default as DefensiveModeSettingsSummary,
	useCanRenderSettingsDefensiveModeSummary,
} from '../settings-defensive-mode/summary';
import {
	default as HundredYearPlanSettingsSummary,
	useCanRenderHundredYearPlanSettingsSummary,
} from '../settings-hundred-year-plan/summary';
import PHPSettingsSummary from '../settings-php/summary';
import {
	default as PrimaryDataCenterSettingsSummary,
	useCanRenderSettingsPrimaryDataCenterSummary,
} from '../settings-primary-data-center/summary';
import SiteVisibilitySettingsSummary from '../settings-site-visibility/summary';
import StaticFile404SettingsSummary from '../settings-static-file-404/summary';
import {
	default as SubscriptionGiftingSettingsSummary,
	useCanRenderSubscriptionGiftingSettingsSummary,
} from '../settings-subscription-gifting/summary';
import {
	default as WordPressSettingsSummary,
	useCanRenderWordPressSettingsSummary,
} from '../settings-wordpress/summary';
import DangerZone from './danger-zone';
import SiteActions from './site-actions';
import type { Site, SiteSettings } from '../../data/types';

function InnerSiteSettings( { site, settings }: { site: Site; settings: SiteSettings } ) {
	const {
		show: showSubscriptionGiftingSettingsSummary,
		props: subscriptionGiftingSettingsSummaryProps,
	} = useCanRenderSubscriptionGiftingSettingsSummary( { site, settings } );

	const { show: showHundredYearPlanSettingsSummary, props: hundredYearPlanSettingsSummaryProps } =
		useCanRenderHundredYearPlanSettingsSummary( { site, settings } );

	const { show: showWordPressSettingsSummary, props: wordPressSettingsSummaryProps } =
		useCanRenderWordPressSettingsSummary( { site } );

	const { show: showAgencySettingsSummary, props: agencySettingsSummaryProps } =
		useCanRenderAgencySettingsSummary( { site } );

	const {
		show: showPrimaryDataCenterSettingsSummary,
		props: primaryDataCenterSettingsSummaryProps,
	} = useCanRenderSettingsPrimaryDataCenterSummary( { site } );

	const { show: showDefensiveModeSettingsSummary, props: defensiveModeSettingsSummaryProps } =
		useCanRenderSettingsDefensiveModeSummary( { site } );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Settings' ) } /> }>
			<SectionHeader title={ __( 'General' ) } />
			<SummaryButtonList>
				<SiteVisibilitySettingsSummary site={ site } />
				{ showSubscriptionGiftingSettingsSummary ? (
					<SubscriptionGiftingSettingsSummary { ...subscriptionGiftingSettingsSummaryProps } />
				) : null }
				{ showHundredYearPlanSettingsSummary ? (
					<HundredYearPlanSettingsSummary { ...hundredYearPlanSettingsSummaryProps } />
				) : null }
			</SummaryButtonList>
			<SectionHeader title={ __( 'Server' ) } />
			<SummaryButtonList>
				<DatabaseSettingsSummary site={ site } />
				{ showWordPressSettingsSummary ? (
					<WordPressSettingsSummary { ...wordPressSettingsSummaryProps } />
				) : null }
				<PHPSettingsSummary site={ site } />
				{ showAgencySettingsSummary ? (
					<AgencySettingsSummary { ...agencySettingsSummaryProps } />
				) : null }
				{ showPrimaryDataCenterSettingsSummary ? (
					<PrimaryDataCenterSettingsSummary { ...primaryDataCenterSettingsSummaryProps } />
				) : null }
				<StaticFile404SettingsSummary site={ site } />
				<CachingSettingsSummary site={ site } />
				{ showDefensiveModeSettingsSummary ? (
					<DefensiveModeSettingsSummary { ...defensiveModeSettingsSummaryProps } />
				) : null }
			</SummaryButtonList>
			<SiteActions site={ site } />
			<DangerZone site={ site } />
		</PageLayout>
	);
}

export default function SiteSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );

	if ( ! site || ! settings ) {
		return null;
	}

	return <InnerSiteSettings site={ site } settings={ settings } />;
}
