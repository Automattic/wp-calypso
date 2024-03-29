import BackupsPage from 'calypso/my-sites/backup/main';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import SitePreviewPaneContent from '../../site-preview-pane/site-preview-pane-content';

type Props = {
	sideId: number;
};

export function JetpackBackupPreview( { sideId }: Props ) {
	const dispatch = useDispatch();

	if ( sideId ) {
		dispatch( setSelectedSiteId( sideId ) );
	}

	return (
		<>
			<SitePreviewPaneContent>
				<BackupsPage queryDate={ undefined } />
			</SitePreviewPaneContent>
		</>
	);
}
