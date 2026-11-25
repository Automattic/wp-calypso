import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import CachingSettingsSummary from '../caching/components/caching-summary';
import { SitesNoticeArbiter } from '../components/notice-arbiter';
import DatabaseSettingsSummary from '../database/components/database-summary';
import DefensiveModeSettingsSummary from '../defensive-mode/components/defensive-mode-summary';
import { useCanViewApm } from '../performance/backend-access';
import PHPSettingsSummary from '../php-version/components/php-version-summary';
import PrimaryDataCenterSettingsSummary from '../primary-data-center/components/primary-data-center-summary';
import AgencySettingsSummary from '../settings-agency/summary';
import AISiteToolsSettingsSummary from '../settings-ai-tools/summary';
import ApmSettingsSummary from '../settings-apm/summary';
import CrontabSettingsSummary from '../settings-crontab/summary';
import HundredYearPlanSettingsSummary from '../settings-hundred-year-plan/summary';
import PlanSettingsSummary from '../settings-plan/summary';
import SiteRedirectSettingsSummary from '../settings-redirect/summary';
import RepositoriesSettingsSummary from '../settings-repositories/summary';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';
import WebApplicationFirewallSettingsSummary from '../settings-web-application-firewall/summary';
import WpcomLoginSettingsSummary from '../settings-wpcom-login/summary';
import SftpSshSettingsSummary from '../sftp-ssh/components/sftp-ssh-summary';
import StaticFile404SettingsSummary from '../static-file-404/components/static-file-404-summary';
import SiteVisibilitySettingsSummary from '../visibility/components/visibility-summary';
import WordPressSettingsSummary from '../wordpress-version/components/wordpress-version-summary';
import DangerZone from './danger-zone';
import SiteActions from './site-actions';
import type { SiteSettings } from '@automattic/api-core';

export default function SiteSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: settings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const siteTypeSupports = getSiteTypeFeatureSupports( site );
	const canViewApm = useCanViewApm();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Settings' ) }
					description={ __( 'Configure your site’s general, server, and security settings.' ) }
				/>
			}
			notices={ <SitesNoticeArbiter /> }
		>
			{ siteTypeSupports.settingsGeneral && (
				<VStack spacing={ 3 }>
					<SectionHeader title={ __( 'General' ) } level={ 3 } />
					<SummaryButtonList>
						{ siteTypeSupports.settingsGeneralDotcomSiteVisibility ? (
							<SiteVisibilitySettingsSummary site={ site } />
						) : null }
						{ isEnabled( 'wordpress-ai-tools' ) && siteTypeSupports.settingsGeneralAITools ? (
							<AISiteToolsSettingsSummary site={ site } />
						) : null }
						{ siteTypeSupports.settingsGeneralRedirect ? (
							<SiteRedirectSettingsSummary site={ site } />
						) : null }
						<SubscriptionGiftingSettingsSummary site={ site } settings={ settings } />
						<AgencySettingsSummary site={ site } />
						<HundredYearPlanSettingsSummary site={ site } settings={ settings } />
						<PlanSettingsSummary site={ site } />
					</SummaryButtonList>
				</VStack>
			) }
			{ siteTypeSupports.settingsServer && (
				<VStack spacing={ 3 }>
					<SectionHeader title={ __( 'Server' ) } level={ 3 } />
					<SummaryButtonList>
						<WordPressSettingsSummary site={ site } />
						<PHPSettingsSummary site={ site } />
						<SftpSshSettingsSummary site={ site } />
						<CrontabSettingsSummary site={ site } />
						<RepositoriesSettingsSummary site={ site } />
						<DatabaseSettingsSummary site={ site } />
						<PrimaryDataCenterSettingsSummary site={ site } />
						<StaticFile404SettingsSummary site={ site } />
						<CachingSettingsSummary site={ site } />
						{ canViewApm ? <ApmSettingsSummary site={ site } /> : null }
					</SummaryButtonList>
				</VStack>
			) }
			{ siteTypeSupports.settingsSecurity && (
				<VStack spacing={ 3 }>
					<SectionHeader title={ __( 'Security' ) } level={ 3 } />
					<SummaryButtonList>
						<WebApplicationFirewallSettingsSummary site={ site } />
						<WpcomLoginSettingsSummary site={ site } />
						<DefensiveModeSettingsSummary site={ site } />
					</SummaryButtonList>
				</VStack>
			) }
			<SiteActions site={ site } />
			<DangerZone site={ site } />
			<PerformanceTrackerStop />
		</PageLayout>
	);
}
