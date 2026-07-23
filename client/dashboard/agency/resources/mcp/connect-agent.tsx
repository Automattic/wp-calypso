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
			header={
				<PageHeader
					title={ __( 'Connect external AI assistant' ) }
					prefix={ <Breadcrumbs length={ 2 } /> }
				/>
			}
		>
			<McpConnectAgent recordTracksEvent={ recordTracksEvent } />
		</PageLayout>
	);
}
