export const STORE_KEY = 'automattic/block-editor-nav-sidebar';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}
export const SITE_HOME_HOST_NAME = window.wpcomBlockEditorNavSidebar.homeHost;
export const SITE_HOME_URL = window.wpcomBlockEditorNavSidebar.homeUrl;
export const SITE_TITLE = window.wpcomBlockEditorNavSidebar.siteTitle;
