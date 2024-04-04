import BackupsPage from 'calypso/my-sites/backup/main';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import SitePreviewPaneContent from '../../site-preview-pane/site-preview-pane-content';

type Props = {
	siteId: number;
};

export function JetpackBackupPreview( { siteId }: Props ) {
	const dispatch = useDispatch();

	if ( siteId ) {
		dispatch( setSelectedSiteId( siteId ) );
	}

	return (
		<>
			<SitePreviewPaneContent>
				<BackupsPage queryDate={ undefined } />
			</SitePreviewPaneContent>
		</>
	);
}
