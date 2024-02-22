import { Site } from '../../types';

import './style.scss';

interface Props {
	selectedSite?: Site | undefined;
}

export default function SitePreviewPaneFooter( { selectedSite }: Props ) {
	if ( ! selectedSite ) {
		return null;
	}

	return <div className="site-preview__footer">Footer goes here</div>;
}
