/**
 * Internal dependencies
 */
import { SECTION_SET } from 'state/action-types';

export function setSection( section, options = {} ) {
	const action = {
		...options,
		type: SECTION_SET,
	};
	if ( section ) {
		action.section = section;
	}

	return action;
}
