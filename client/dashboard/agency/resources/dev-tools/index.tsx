import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import DevToolsContent from './dev-tools-content';

export default function DevTools() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Developer tools' ) }
					description={ __(
						'Build and ship client work faster with local development and automated deploys. Test ideas and demo progress to clients with disposable environments that need no cleanup.'
					) }
				/>
			}
		>
			<DevToolsContent recordTracksEvent={ recordTracksEvent } />
		</PageLayout>
	);
}
