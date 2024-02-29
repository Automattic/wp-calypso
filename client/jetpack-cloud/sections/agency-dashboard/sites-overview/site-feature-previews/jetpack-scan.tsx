import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ScanPage from 'calypso/my-sites/scan/main';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';
import { Site } from '../types';

import 'calypso/my-sites/scan/style.scss';

type Props = {
	site: Site;
};

export function JetpackScanPreview( { site }: Props ) {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		if ( site ) {
			dispatch( setSelectedSiteId( site.blog_id ) );
		}
	}, [ site ] );

	return (
		<>
			<SitePreviewPaneContent>
				{ siteId ? <ScanPage /> : <div>Loading Scan page...</div> }
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
