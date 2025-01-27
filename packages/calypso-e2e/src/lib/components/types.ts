/* EditorToolbarComponent */

/**
 * Preview options.
 */
export type EditorPreviewOptions = 'Desktop' | 'Mobile' | 'Tablet';

/* EditorSettingsSidebarComponent */

/**
 * Tabs in the Editor Settings Sidebar.
 *
 * The Post and Page values never coexist together.
 */
export type EditorSidebarTab = 'Post' | 'Block' | 'Page';

/**
 * Post/Page privacy options.
 */
export type ArticlePrivacyOptions = 'Public' | 'Private' | 'Password';

/**
 * Schedule format for specifying a pubilshed date (future/past).
 */
export interface ArticlePublishSchedule {
	year: number;
	month: number;
	date: number;
	hours: number;
	minutes: number;
	meridian: 'AM' | 'PM';
}

/**
 * Settings button on the Editor Toolbar.
 */
export type EditorToolbarSettingsButton = 'Settings' | 'Jetpack';
