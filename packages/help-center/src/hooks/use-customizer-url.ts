import { addQueryArgs } from '@wordpress/url';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSiteSlug } from './use-site-slug';

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
 * @param  panel Calypso panel slug
 * @returns WordPress autofocus argument object
 */
export function getCustomizerFocus( panel: string ) {
	if ( PANEL_MAPPINGS.hasOwnProperty( panel ) ) {
		const [ key, value ] = PANEL_MAPPINGS[ panel ];
		return { [ `autofocus[${ key }]` ]: value };
	}

	return null;
}
const panels = [ 'root', 'homepage', 'identity', 'menus' ] as const;

export function useCustomizerUrls() {
	const { adminUrl, isJetpackSite } = useHelpCenterContext();
	const siteSlug = useSiteSlug();
	const returnUrl = window.location.href;

	return panels.reduce(
		( acc, panel ) => {
			if ( ! isJetpackSite && siteSlug ) {
				const url = [ '' ].concat( [ 'customize', panel, siteSlug ].filter( Boolean ) ).join( '/' );
				acc[ panel ] = addQueryArgs( url, {
					return: returnUrl,
				} );
			} else {
				const customizerUrl = adminUrl + 'customize.php';

				acc[ panel ] = addQueryArgs( customizerUrl, {
					return: returnUrl,
					...( panel ? getCustomizerFocus( panel ) : {} ),
				} );
			}
			return acc;
		},
		{} as Record< ( typeof panels )[ number ], string >
	);
}
