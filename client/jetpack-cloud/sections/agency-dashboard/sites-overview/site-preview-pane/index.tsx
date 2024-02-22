import { Site } from '../types';
import SitePreviewPaneContent from './site-preview-pane-content';
import SitePreviewPaneFooter from './site-preview-pane-footer';
import SitePreviewPaneHeader from './site-preview-pane-header';
import SitePreviewPaneTabs from './site-preview-pane-tabs';

import './style.scss';

interface Props {
	selectedSite: Site;
	closeSitePreviewPane: () => void;
}

export default function SitePreviewPane( { selectedSite, closeSitePreviewPane }: Props ) {
	return (
		<div className="site-preview__pane">
			<SitePreviewPaneHeader
				selectedSite={ selectedSite }
				closeSitePreviewPane={ closeSitePreviewPane }
			/>
			<SitePreviewPaneTabs selectedSite={ selectedSite } />
			<SitePreviewPaneContent selectedSite={ selectedSite } />
			<SitePreviewPaneFooter selectedSite={ selectedSite } />
		</div>
	);
}
