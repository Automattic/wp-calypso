import { get } from 'lodash';
import getSection from './get-section';

/**
 * Returns the current section group name.
 *
 * @param  {object}  state Global state tree
 * @returns {?string}       Current section group name
 */
export default function getSectionGroup( state ) {
	return get( getSection( state ), 'group', null );
}
