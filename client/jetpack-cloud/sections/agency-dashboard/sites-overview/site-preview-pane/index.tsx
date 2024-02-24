import SitePreviewPaneHeader from './site-preview-pane-header';
import SitePreviewPaneTabs from './site-preview-pane-tabs';
import { SitePreviewPaneProps } from './types';

import './style.scss';

export default function SitePreviewPane( {
	site,
	features,
	closeSitePreviewPane,
}: SitePreviewPaneProps ) {
	// Ensure we have features
	if ( ! features || ! features.length ) {
		return null;
	}

	// Find the selected feature or default to the first feature
	const selectedFeature = features.find( ( feature ) => feature.tab.selected ) || features[ 0 ];

	// Ensure we have a valid feature
	if ( ! selectedFeature ) {
		return null;
	}

	// Extract the tabs from the features
	const featureTabs = features.map( ( feature ) => feature.tab );

	return (
		<div className="site-preview__pane">
			<SitePreviewPaneHeader
				title={ site.blogname }
				url={ site.url }
				urlWithScheme={ site.url_with_scheme }
				closeSitePreviewPane={ closeSitePreviewPane }
			/>
			<SitePreviewPaneTabs featureTabs={ featureTabs } />
			{ selectedFeature.preview }
		</div>
	);
}
