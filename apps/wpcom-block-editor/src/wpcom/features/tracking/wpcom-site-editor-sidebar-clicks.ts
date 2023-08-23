import tracksRecordEvent from './track-record-event';

export const wpcomSiteEditorSidebarNavigationClick = () => {
	return {
		id: 'wpcom_site_editor_sidebar_navigation_click',
		// \2f is the encoded slash.
		selector: '#\\2fnavigation',
		type: 'click',
		handler: () => tracksRecordEvent( 'wpcom_site_editor_sidebar_navigation_click' ),
	};
};

export const wpcomSiteEditorSidebarPagesClick = () => {
	return {
		id: 'wpcom_site_editor_sidebar_pages_click',
		// \2f is the encoded slash.
		selector: '#\\2fpage',
		type: 'click',
		handler: () => tracksRecordEvent( 'wpcom_site_editor_sidebar_pages_click' ),
	};
};

export const wpcomSiteEditorSidebarPatternsClick = () => {
	return {
		id: 'wpcom_site_editor_sidebar_patterns_click',
		// \2f is the encoded slash.
		selector: '#\\2fpatterns',
		type: 'click',
		handler: () => tracksRecordEvent( 'wpcom_site_editor_sidebar_patterns_click' ),
	};
};

export const wpcomSiteEditorSidebarStylesClick = () => {
	return {
		id: 'wpcom_site_editor_sidebar_styles_click',
		// \2f is the encoded slash.
		selector: '#\\2fwp_global_styles',
		type: 'click',
		handler: () => tracksRecordEvent( 'wpcom_site_editor_sidebar_styles_click' ),
	};
};

export const wpcomSiteEditorSidebarTemplatesClick = () => {
	return {
		id: 'wpcom_site_editor_sidebar_templates_click',
		// \2f is the encoded slash.
		selector: `#\\2fwp_template`,
		type: 'click',
		handler: () => tracksRecordEvent( 'wpcom_site_editor_sidebar_templates_click' ),
	};
};
