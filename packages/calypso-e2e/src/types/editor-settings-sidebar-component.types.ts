/**
 * Tabs in the Editor Settings Sidebar.
 *
 * The Post and Page values never coexist together.
 */
export type EditorSidebarTab = 'Post' | 'Block' | 'Page';

/**
 * The different foldable sections on the sidebar.
 */
export type ArticleSections =
	| 'Status & Visibility'
	| 'Revisions'
	| 'Permalink'
	| 'Categories'
	| 'Tags'
	| 'Discussion';

/**
 * Post/Page privacy options.
 */
export type PrivacyOptions = 'Public' | 'Private' | 'Password';

/**
 * Schedule format for specifying a pubilshed date (future/past).
 */
export interface Schedule {
	year: number;
	month: number;
	date: number;
	hours: number;
	minutes: number;
	meridian: 'am' | 'pm';
}
