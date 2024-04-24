import { useContext, useEffect, ReactNode } from 'react';
import ItemPreviewPaneContent from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/item-preview-pane-content';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
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

	return siteId && <ItemPreviewPaneContent>{ children || featurePreview }</ItemPreviewPaneContent>;
}
