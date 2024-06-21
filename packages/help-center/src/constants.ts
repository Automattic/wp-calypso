export const SUPPORT_BLOG_ID = 9619154;

/**
 * Customizer: Mapping from Calypso panel slug to tuple of focus key and value.
 */
export const PANEL_MAPPINGS: Record< string, [ string, string ] > = {
	widgets: [ 'panel', 'widgets' ],
	fonts: [ 'section', 'jetpack_fonts' ],
	identity: [ 'section', 'title_tagline' ],
	'custom-css': [ 'section', 'jetpack_custom_css' ],
	amp: [ 'section', 'amp_design' ],
	menus: [ 'panel', 'nav_menus' ],
	homepage: [ 'section', 'static_front_page' ],
	jetpack_search: [ 'section', 'jetpack_search' ],
};
