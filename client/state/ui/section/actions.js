/**
 * Internal dependencies
 */
import { SECTION_SET, SECTION_LOADING_SET } from 'state/action-types';

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

export function setSectionLoading( isSectionLoading ) {
	return {
		type: SECTION_LOADING_SET,
		isSectionLoading,
	};
}
