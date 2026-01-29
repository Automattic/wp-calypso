import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import AgencySettingsSummary from '../settings-agency/summary';
import AISiteAssistantSettingsSummary from '../settings-ai-assistant/summary';
import AISiteToolsSettingsSummary from '../settings-ai-tools/summary';
import CachingSettingsSummary from '../settings-caching/summary';
import CrontabSettingsSummary from '../settings-crontab/summary';
import DatabaseSettingsSummary from '../settings-database/summary';
import DefensiveModeSettingsSummary from '../settings-defensive-mode/summary';
import HundredYearPlanSettingsSummary from '../settings-hundred-year-plan/summary';
import PHPSettingsSummary from '../settings-php/summary';
import PlanSettingsSummary from '../settings-plan/summary';
import PrimaryDataCenterSettingsSummary from '../settings-primary-data-center/summary';
import SiteRedirectSettingsSummary from '../settings-redirect/summary';
import RepositoriesSettingsSummary from '../settings-repositories/summary';
import SftpSshSettingsSummary from '../settings-sftp-ssh/summary';
import SiteVisibilitySettingsSummary from '../settings-site-visibility/summary';
import StaticFile404SettingsSummary from '../settings-static-file-404/summary';
import SubscriptionGiftingSettingsSummary from '../settings-subscription-gifting/summary';
import WebApplicationFirewallSettingsSummary from '../settings-web-application-firewall/summary';
import WordPressSettingsSummary from '../settings-wordpress/summary';
import WpcomLoginSettingsSummary from '../settings-wpcom-login/summary';
import DangerZone from './danger-zone';
import SiteActions from './site-actions';
import type { SiteSettings } from '@automattic/api-core';

export default function SiteSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: settings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const siteTypeSupports = getSiteTypeFeatureSupports( site );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Settings' ) }
					description={ __( 'Configure your site’s general, server, and security settings.' ) }
				/>
			}
		>
			{ siteTypeSupports.settingsGeneral && (
				<VStack spacing={ 3 }>
					<SectionHeader title={ __( 'General' ) } level={ 3 } />
					<SummaryButtonList>
						<SiteVisibilitySettingsSummary site={ site } />
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
			{ siteTypeSupports.settingsExperimental && isEnabled( 'wordpress-ai-assistant' ) && (
				<VStack spacing={ 3 }>
					<SectionHeader title={ __( 'Experimental (Staging)' ) } level={ 3 } />
					<SummaryButtonList>
						<AISiteAssistantSettingsSummary site={ site } />
					</SummaryButtonList>
				</VStack>
			) }
			<SiteActions site={ site } />
			<DangerZone site={ site } />
		</PageLayout>
	);
}
