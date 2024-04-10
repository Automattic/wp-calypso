import { useContext, useEffect, ReactNode } from 'react';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import SitePreviewPaneContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-preview-pane/site-preview-pane-content';
import { useDispatch, useSelector } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Site } from '../../types';

type Props = {
	site: Site;
	children?: ReactNode;
};

export function JetpackFeaturePreview( { site, children }: Props ) {
	const { featurePreview } = useContext( SitesDashboardContext );
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		if ( siteId === null ) {
			dispatch( setSelectedSiteId( site.blog_id ) );
		}
	}, [ siteId ] );

	return siteId && <SitePreviewPaneContent>{ children || featurePreview }</SitePreviewPaneContent>;
}
