import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import McpSummary from '../mcp/summary';
import PreferencesDefaultLandingSummary from '../preferences-default-landing/summary';
import PreferencesLanguageSummary from '../preferences-language/summary';
import PreferencesNewHostingDashboardSummary from '../preferences-new-hosting-dashboard/summary';

export default function PreferencesIndex() {
	const { optIn } = useAppContext();

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
				<PreferencesLanguageSummary />
				<PreferencesDefaultLandingSummary />
				<McpSummary />
			</VStack>
		</PageLayout>
	);
}
