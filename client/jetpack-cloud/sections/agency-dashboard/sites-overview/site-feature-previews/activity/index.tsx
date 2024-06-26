import ActivityLogV2 from 'calypso/my-sites/activity/activity-log-v2';
import SitePreviewPaneContent from '../../site-preview-pane/site-preview-pane-content';

import 'calypso/my-sites/activity/activity-log-v2/style.scss';
import './style.scss';

export function JetpackActivityPreview() {
	return (
		<SitePreviewPaneContent>
			<ActivityLogV2 />
		</SitePreviewPaneContent>
	);
}
