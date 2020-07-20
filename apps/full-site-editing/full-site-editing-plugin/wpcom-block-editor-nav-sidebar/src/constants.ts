export const STORE_KEY = 'automattic/block-editor-nav-sidebar';

declare global {
	interface Window {
		wpcomBlockEditorNavSidebar?: {
			homeUrl: string;
		};
	}
}

export const SITE_HOME_URL = window.wpcomBlockEditorNavSidebar?.homeUrl;
