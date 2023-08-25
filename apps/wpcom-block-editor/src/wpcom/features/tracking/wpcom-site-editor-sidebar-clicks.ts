import tracksRecordEvent from './track-record-event';
import { DelegateEventHandler } from './types';

export const wpcomSiteEditorSidebarNavigationClick = (): DelegateEventHandler => {
	return {
		id: 'wpcom_site_editor_sidebar_navigation_click',
		// \2f is the encoded slash.
		selector: '#\\2fnavigation',
		type: 'click',
		handler: () =>
			tracksRecordEvent( 'wpcom_block_editor_nav_sidebar_main_item_click', {
				item_type: 'navigation',
			} ),
	};
};

export const wpcomSiteEditorSidebarPagesClick = (): DelegateEventHandler => {
	return {
		id: 'wpcom_site_editor_sidebar_pages_click',
		// \2f is the encoded slash.
		selector: '#\\2fpage',
		type: 'click',
		handler: () =>
			tracksRecordEvent( 'wpcom_block_editor_nav_sidebar_main_item_click', {
				item_type: 'pages',
			} ),
	};
};

export const wpcomSiteEditorSidebarPatternsClick = (): DelegateEventHandler => {
	return {
		id: 'wpcom_site_editor_sidebar_patterns_click',
		// \2f is the encoded slash.
		selector: '#\\2fpatterns',
		type: 'click',
		handler: () =>
			tracksRecordEvent( 'wpcom_block_editor_nav_sidebar_main_item_click', {
				item_type: 'patterns',
			} ),
	};
};

export const wpcomSiteEditorSidebarStylesClick = (): DelegateEventHandler => {
	return {
		id: 'wpcom_site_editor_sidebar_styles_click',
		/**
		 * There is no id attribute (`#/wp_global_styles`) for themes that do not have style variations.
		 *
		 * @see https://github.com/okmttdhr/gutenberg/blob/70ccdefe1fd0b02638f5a8ae4f1c03e6f7fe27cc/packages/edit-site/src/components/sidebar-navigation-screen-global-styles/index.js#L63-L83
		 */
		selector:
			'.edit-site-sidebar-navigation-screen__content [role=listitem]:nth-child(2) .edit-site-sidebar-navigation-item',
		type: 'click',
		handler: () =>
			tracksRecordEvent( 'wpcom_block_editor_nav_sidebar_main_item_click', {
				item_type: 'styles',
			} ),
	};
};

export const wpcomSiteEditorSidebarTemplatesClick = (): DelegateEventHandler => {
	return {
		id: 'wpcom_site_editor_sidebar_templates_click',
		// \2f is the encoded slash.
		selector: `#\\2fwp_template`,
		type: 'click',
		handler: () =>
			tracksRecordEvent( 'wpcom_block_editor_nav_sidebar_main_item_click', {
				item_type: 'templates',
			} ),
	};
};
