import ActivityLogV2 from 'calypso/my-sites/activity/activity-log-v2';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';

import 'calypso/my-sites/activity/activity-log-v2/style.scss';

type Props = {
	isLoading: boolean;
};

export function JetpackActivityPreview( { isLoading = true }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<div style={ { textAlign: 'left' } }>
					{ isLoading ? <div>Loading Activity page...</div> : <ActivityLogV2 /> }
				</div>
			</SitePreviewPaneContent>
		</>
	);
}
