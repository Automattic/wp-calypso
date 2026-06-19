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
		<PageLayout header={ <PageHeader title={ __( 'MCP' ) } /> }>
			<McpOverview
				settings={ settings }
				isLoading={ isLoading }
				isSaving={ isSaving }
				onSave={ save }
				recordTracksEvent={ recordTracksEvent }
				onNavigate={ ( path ) => navigate( { to: path as '/resources/ai-mcp/tools' } ) }
			/>
		</PageLayout>
	);
}
