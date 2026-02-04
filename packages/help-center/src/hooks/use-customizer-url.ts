import { PANEL_MAPPINGS } from '../constants';

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
