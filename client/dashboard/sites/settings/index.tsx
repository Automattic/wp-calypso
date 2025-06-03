import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsQuery } from '../../app/queries';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import AgencySummary from '../settings-agency/summary';
import CachingSettingsSummary from '../settings-caching/summary';
import DatabaseSettingsSummary from '../settings-database/summary';
import DefensiveModeSettingsSummary from '../settings-defensive-mode/summary';
import PHPSettingsSummary from '../settings-php/summary';
import PrimaryDataCenterSettingsSummary from '../settings-primary-data-center/summary';
import SiteVisibilitySettingsSummary from '../settings-site-visibility/summary';
import StaticFile404SettingsSummary from '../settings-static-file-404/summary';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';
import WordPressSettingsSummary from '../settings-wordpress/summary';
import DangerZone from './danger-zone';
import SiteActions from './site-actions';

export default function SiteSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );

	if ( ! site || ! settings ) {
		return null;
	}

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Settings' ) } /> }>
			<SectionHeader title={ __( 'General' ) } />
			<SummaryButtonList>
				<SiteVisibilitySettingsSummary site={ site } />
				<SubscriptionGiftingSettingsSummary site={ site } settings={ settings } />
			</SummaryButtonList>
			<SectionHeader title={ __( 'Server' ) } />
			<SummaryButtonList>
				<DatabaseSettingsSummary site={ site } />
				<WordPressSettingsSummary site={ site } />
				<PHPSettingsSummary site={ site } />
				<AgencySummary site={ site } />
				<PrimaryDataCenterSettingsSummary site={ site } />
				<StaticFile404SettingsSummary site={ site } />
				<CachingSettingsSummary site={ site } />
				<DefensiveModeSettingsSummary site={ site } />
			</SummaryButtonList>
			<SiteActions site={ site } />
			<DangerZone site={ site } />
		</PageLayout>
	);
}
