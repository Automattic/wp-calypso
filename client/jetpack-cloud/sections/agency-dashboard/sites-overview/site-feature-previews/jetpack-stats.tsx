import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';
import { Site } from '../types';

type Props = {
	site: Site;
};

export function JetpackStatsPreview( { site }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<div>
					<b>Stats Pane</b>
					<br />
					{ site.url }
				</div>
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
