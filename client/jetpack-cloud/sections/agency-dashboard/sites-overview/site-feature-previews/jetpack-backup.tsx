import BackupsPage from 'calypso/my-sites/backup/main';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';

export function JetpackBackupPreview() {
	return (
		<>
			<SitePreviewPaneContent>
				<BackupsPage queryDate={ undefined } />
			</SitePreviewPaneContent>
		</>
	);
}
