import { PANEL_MAPPINGS } from '@automattic/help-center/src/constants';

/**
 * Given the name of a Calypso customizer panel, returns an object containing
 * the section or panel to be used in autofocus. Returns null if the panel is
 * not recognized.
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
