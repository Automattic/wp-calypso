import BackupStorage from '../site-expanded-content/backup-storage';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';
import { Site } from '../types';

type Props = {
	site: Site;
};

export function JetpackBackupPreview( { site }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<BackupStorage site={ site } trackEvent={ () => {} } hasError={ false } />
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
