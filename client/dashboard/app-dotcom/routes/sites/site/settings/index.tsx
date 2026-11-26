import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PerformanceTrackerStop } from '../../../../../app/performance-tracking';
import { PageHeader } from '../../../../../components/page-header';
import PageLayout from '../../../../../components/page-layout';
import { SectionHeader } from '../../../../../components/section-header';
import { SummaryButtonList } from '../../../../../components/summary-button-list';
import AgencySettingsSummary from '../../../../../sites/agency-wpcom/components/agency-wpcom-summary';
import AISiteToolsSettingsSummary from '../../../../../sites/ai-tools/components/ai-tools-summary';
import ApmSettingsSummary from '../../../../../sites/apm/components/apm-summary';
import { useCanViewApm } from '../../../../../sites/apm/utils/backend-access';
import CachingSettingsSummary from '../../../../../sites/caching/components/caching-summary';
import { SitesNoticeArbiter } from '../../../../../sites/components/notice-arbiter';
import CrontabSettingsSummary from '../../../../../sites/crontab/components/crontab-summary';
import DatabaseSettingsSummary from '../../../../../sites/database/components/database-summary';
import DefensiveModeSettingsSummary from '../../../../../sites/defensive-mode/components/defensive-mode-summary';
import RepositoriesSettingsSummary from '../../../../../sites/deployments/components/repositories-summary';
import HundredYearPlanSettingsSummary from '../../../../../sites/hundred-year-plan/components/hundred-year-plan-summary';
import PHPSettingsSummary from '../../../../../sites/php-version/components/php-version-summary';
import PlanSettingsSummary from '../../../../../sites/plan/components/plan-summary';
import PrimaryDataCenterSettingsSummary from '../../../../../sites/primary-data-center/components/primary-data-center-summary';
import SftpSshSettingsSummary from '../../../../../sites/sftp-ssh/components/sftp-ssh-summary';
import DangerZone from '../../../../../sites/site-actions/components/danger-zone';
import SiteActions from '../../../../../sites/site-actions/components/site-actions';
import SiteRedirectSettingsSummary from '../../../../../sites/site-redirect/components/site-redirect-summary';
import StaticFile404SettingsSummary from '../../../../../sites/static-file-404/components/static-file-404-summary';
import SubscriptionGiftingSettingsSummary from '../../../../../sites/subscription-gifting/components/subscription-gifting-summary';
import SiteVisibilitySettingsSummary from '../../../../../sites/visibility/components/visibility-summary';
import WebApplicationFirewallSettingsSummary from '../../../../../sites/web-application-firewall/components/web-application-firewall-summary';
import WordPressSettingsSummary from '../../../../../sites/wordpress-version/components/wordpress-version-summary';
import WpcomLoginSettingsSummary from '../../../../../sites/wpcom-login/components/wpcom-login-summary';
import { getSiteTypeFeatureSupports } from '../../../../../utils/site-type-feature-support';
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
