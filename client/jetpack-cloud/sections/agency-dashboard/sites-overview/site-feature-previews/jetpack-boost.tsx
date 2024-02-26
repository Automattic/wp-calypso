import BoostSitePerformance from '../site-expanded-content/boost-site-performance';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';
import { Site } from '../types';

type Props = {
	site: Site;
};

export function JetpackBoostPreview( { site }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<BoostSitePerformance site={ site } trackEvent={ () => {} } hasError={ false } />
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
