import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import AgencySettingsSummary from '../settings-agency/summary';
import CachingSettingsSummary from '../settings-caching/summary';
import DatabaseSettingsSummary from '../settings-database/summary';
import DefensiveModeSettingsSummary from '../settings-defensive-mode/summary';
import HolidaySnowSummary from '../settings-holiday-snow/summary';
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
	const { data: settings } = useQuery( siteSettingsQuery( site.ID ) );
	const { supports } = useAppContext();
	const supportsSettings = supports.sites && supports.sites.settings;

	if ( ! supportsSettings ) {
		return null;
	}

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Settings' ) } /> }>
			{ supportsSettings.general && (
				<VStack spacing={ 3 }>
					<SectionHeader title={ __( 'General' ) } level={ 3 } />
					<SummaryButtonList>
						<SiteVisibilitySettingsSummary site={ site } />
						{ supportsSettings.general.redirect ? (
							<SiteRedirectSettingsSummary site={ site } />
						) : null }
						<SubscriptionGiftingSettingsSummary site={ site } settings={ settings } />
						<AgencySettingsSummary site={ site } />
						<HundredYearPlanSettingsSummary site={ site } settings={ settings } />
						<HolidaySnowSummary site={ site } settings={ settings } />
						<PlanSettingsSummary site={ site } />
					</SummaryButtonList>
				</VStack>
			) }
			{ supportsSettings.server && (
				<VStack spacing={ 3 }>
					<SectionHeader title={ __( 'Server' ) } level={ 3 } />
					<SummaryButtonList>
						<WordPressSettingsSummary site={ site } />
						<PHPSettingsSummary site={ site } />
						<SftpSshSettingsSummary site={ site } />
						<RepositoriesSettingsSummary site={ site } />
						<DatabaseSettingsSummary site={ site } />
						<PrimaryDataCenterSettingsSummary site={ site } />
						<StaticFile404SettingsSummary site={ site } />
						<CachingSettingsSummary site={ site } />
					</SummaryButtonList>
				</VStack>
			) }
			{ supportsSettings.security && (
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
		</PageLayout>
	);
}
