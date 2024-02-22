import { Site } from '../../types';

import './style.scss';

interface Props {
	selectedSite?: Site | undefined;
}

export default function SitePreviewPaneTabs( { selectedSite }: Props ) {
	if ( ! selectedSite ) {
		return null;
	}

	return <div className="site-preview__tabs">Tabs go here</div>;
}
