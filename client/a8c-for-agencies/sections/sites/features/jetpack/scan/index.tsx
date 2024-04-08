import { useContext } from 'react';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import SitePreviewPaneContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-preview-pane/site-preview-pane-content';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { Site } from '../../../types';

import 'calypso/my-sites/scan/style.scss';

type Props = {
	site: Site;
};

export function JetpackScanPreview( { site }: Props ) {
	const { featurePreview } = useContext( SitesDashboardContext );
	const dispatch = useDispatch();

	if ( site ) {
		dispatch( setSelectedSiteId( site.blog_id ) );
	}

	return (
		<>
			<SitePreviewPaneContent>{ site && featurePreview }</SitePreviewPaneContent>
		</>
	);
}
