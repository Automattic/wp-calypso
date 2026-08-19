import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import McpTools from './tools-content';
import { useMcpSettings } from './use-mcp-settings';

export default function McpWriteToolsScreen() {
	const { recordTracksEvent } = useAnalytics();
	const { settings, isSaving, save } = useMcpSettings();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Write' ) }
					description={ __(
						'Control which actions your external AI assistant can take on your behalf.'
					) }
				/>
			}
		>
			<McpTools
				toolType="write"
				settings={ settings }
				isSaving={ isSaving }
				onSave={ save }
				recordTracksEvent={ recordTracksEvent }
			/>
		</PageLayout>
	);
}
