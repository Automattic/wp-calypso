import { addQueryArgs } from '@wordpress/url';
import { PANEL_MAPPINGS } from '../constants';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSiteSlug } from './use-site-slug';

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
	const { site } = useHelpCenterContext();
	const siteSlug = useSiteSlug();
	const returnUrl = window.location.href;

	return panels.reduce(
		( acc, panel ) => {
			if ( ! site?.jetpack && siteSlug ) {
				const panelPath = panel === 'root' ? '' : panel;
				const url = [ '' ]
					.concat( [ 'customize', panelPath, siteSlug ].filter( Boolean ) )
					.join( '/' );
				acc[ panel ] = addQueryArgs( url, {
					return: returnUrl,
				} );
			} else {
				const customizerUrl = site?.options.admin_url + 'customize.php';

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
