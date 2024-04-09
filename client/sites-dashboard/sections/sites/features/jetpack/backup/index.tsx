import { useContext } from 'react';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import SitePreviewPaneContent from '../../../site-preview-pane/site-preview-pane-content';

type Props = {
	siteId: number;
};

export function JetpackBackupPreview( { siteId }: Props ) {
	const { featurePreview } = useContext( SitesDashboardContext );
	const dispatch = useDispatch();

	if ( siteId ) {
		dispatch( setSelectedSiteId( siteId ) );
	}

	return (
		<>
			<SitePreviewPaneContent>
				<SitePreviewPaneContent>{ siteId && featurePreview }</SitePreviewPaneContent>
			</SitePreviewPaneContent>
		</>
	);
}
