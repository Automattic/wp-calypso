/**
 * Internal dependencies
 */
import { SECTION_SET } from 'state/action-types';

export function setSection( section, options = {} ) {
	options.type = SECTION_SET;
	if ( section ) {
		options.section = section;
	}
	options.hasSidebar = options.hasSidebar === false ? false : true;
	return options;
}
