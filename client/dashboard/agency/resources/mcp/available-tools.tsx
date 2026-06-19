import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import McpAvailableTools from './available-tools-content';
import { useMcpSettings } from './use-mcp-settings';

export default function McpAvailableToolsScreen() {
	const { recordTracksEvent } = useAnalytics();
	const { settings, save } = useMcpSettings();

	return (
		<PageLayout
			header={
				<PageHeader title={ __( 'Available tools' ) } prefix={ <Breadcrumbs length={ 2 } /> } />
			}
		>
			<McpAvailableTools
				settings={ settings }
				onSave={ save }
				recordTracksEvent={ recordTracksEvent }
			/>
		</PageLayout>
	);
}
