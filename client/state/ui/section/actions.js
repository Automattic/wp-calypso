import { SECTION_SET, SECTION_LOADING_SET, SECTION_NAME_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

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

export function setSectionName( sectionName ) {
	const action = {
		type: SECTION_NAME_SET,
		sectionName,
	};

	return action;
}

export function setSectionLoading( isSectionLoading ) {
	return {
		type: SECTION_LOADING_SET,
		isSectionLoading,
	};
}
