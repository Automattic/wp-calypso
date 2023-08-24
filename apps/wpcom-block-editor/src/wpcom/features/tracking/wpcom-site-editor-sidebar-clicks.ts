import tracksRecordEvent from './track-record-event';

export const wpcomSiteEditorSidebarNavigationClick = () => {
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

export const wpcomSiteEditorSidebarPagesClick = () => {
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

export const wpcomSiteEditorSidebarPatternsClick = () => {
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

export const wpcomSiteEditorSidebarStylesClick = () => {
	return {
		id: 'wpcom_site_editor_sidebar_styles_click',
		// \2f is the encoded slash.
		selector: '#\\2fwp_global_styles',
		type: 'click',
		handler: () =>
			tracksRecordEvent( 'wpcom_block_editor_nav_sidebar_main_item_click', {
				item_type: 'styles',
			} ),
	};
};

export const wpcomSiteEditorSidebarTemplatesClick = () => {
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
