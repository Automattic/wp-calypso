import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import McpStarterPrompts from './starter-prompts-content';

export default function McpStarterPromptsScreen() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Starter prompts' ) }
					description={ __(
						'Copy a prompt into your connected assistant to get going. Edit freely — these are starting points, not scripts.'
					) }
				/>
			}
		>
			<McpStarterPrompts recordTracksEvent={ recordTracksEvent } />
		</PageLayout>
	);
}
