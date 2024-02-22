import { Site } from '../../types';

import './style.scss';

interface Props {
	selectedSite?: Site | undefined;
}

export default function SitePreviewPaneContent( { selectedSite }: Props ) {
	if ( ! selectedSite ) {
		return null;
	}

	return <div className="site-preview__content">Content goes here</div>;
}
