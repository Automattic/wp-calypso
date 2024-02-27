import BackupStorage from '../site-expanded-content/backup-storage';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';
import { Site } from '../types';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	hasError?: boolean;
};

export function JetpackBackupPreview( { site, trackEvent, hasError = false }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<BackupStorage site={ site } trackEvent={ trackEvent } hasError={ hasError } />
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
