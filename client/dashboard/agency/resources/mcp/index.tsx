import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import McpOverview from './overview-content';
import { useMcpSettings } from './use-mcp-settings';

export default function Mcp() {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();
	const { settings, isLoading, isSaving, save } = useMcpSettings();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'AI and MCP' ) }
					description={ __(
						'Control how AI assistants interact with your Automattic for Agencies account and sites.'
					) }
				/>
			}
		>
			<McpOverview
				settings={ settings }
				isLoading={ isLoading }
				isSaving={ isSaving }
				onSave={ save }
				recordTracksEvent={ recordTracksEvent }
				onNavigate={ ( path ) =>
					navigate( { to: path as '/resources/ai-mcp/read' | '/resources/ai-mcp/write' } )
				}
			/>
		</PageLayout>
	);
}
