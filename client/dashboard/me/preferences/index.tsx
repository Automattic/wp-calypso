import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import BlockedSitesSummary from '../blocked-sites/summary';
import McpSummary from '../mcp/summary';
import PreferencesDefaultLandingSummary from '../preferences-default-landing/summary';
import PreferencesLanguageSummary from '../preferences-language/summary';
import PreferencesNewHostingDashboardSummary from '../preferences-new-hosting-dashboard/summary';
import PrivacySummary from '../privacy/summary';
import type { AppConfig, MeSupports } from '../../app/context';

const hasAppSupport = ( appSupports: AppConfig[ 'supports' ], feature: keyof MeSupports ) => {
	return appSupports.me && appSupports.me[ feature ];
};

export default function PreferencesIndex() {
	const { optIn, supports } = useAppContext();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Preferences' ) }
					description={ __( 'Customize your account preferences and settings.' ) }
				/>
			}
		>
			<VStack spacing={ 6 }>
				{ optIn && <PreferencesNewHostingDashboardSummary /> }
				<McpSummary />
				<PreferencesLanguageSummary />
				<PreferencesDefaultLandingSummary />
				{ hasAppSupport( supports, 'privacy' ) && <PrivacySummary /> }
				<BlockedSitesSummary />
			</VStack>
		</PageLayout>
	);
}
