/**
 * Internal dependencies
 */
import { SECTION_SET } from 'state/action-types';

export function setSection( section, options = {} ) {
	const action = {
		...options,
		type: SECTION_SET,
		hasSidebar: options.hasSidebar === false ? false : true,
	};
	if ( section ) {
		action.section = section;
	}

	return action;
}

export function hideSidebar() {
	return {
		type: SECTION_SET,
		hasSidebar: false,
	};
}
