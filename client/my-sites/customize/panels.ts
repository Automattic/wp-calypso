/**
 * Mapping from Calypso panel slug to tuple of focus key and value.
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

/**
 * Given the name of a Calypso customizer panel, returns an object containing
 * the section or panel to be used in autofocus. Returns null if the panel is
 * not recognized.
 *
 * @param  {string}  panel Calypso panel slug
 * @returns {?Object}       WordPress autofocus argument object
 */
export function getCustomizerFocus( panel: string ) {
	if ( PANEL_MAPPINGS.hasOwnProperty( panel ) ) {
		const [ key, value ] = PANEL_MAPPINGS[ panel ];
		return { [ `autofocus[${ key }]` ]: value };
	}

	return null;
}
