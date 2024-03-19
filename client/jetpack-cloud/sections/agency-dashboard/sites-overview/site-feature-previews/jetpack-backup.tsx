import BackupsPage from 'calypso/my-sites/backup/main';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';

export function JetpackBackupPreview() {
	return (
		<>
			<SitePreviewPaneContent>
				<BackupsPage queryDate={ undefined } />
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
