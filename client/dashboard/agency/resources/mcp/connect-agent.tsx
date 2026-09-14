import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import McpConnectAgent from './connect-agent-content';

export default function McpConnectAgentScreen() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Connect external AI assistant' ) }
					description={ __(
						'Get instructions for connecting your external AI assistant to your Automattic for Agencies account via MCP.'
					) }
				/>
			}
		>
			<McpConnectAgent recordTracksEvent={ recordTracksEvent } />
		</PageLayout>
	);
}
