import { get } from 'lodash';
import getSection from './get-section';

/**
 * Returns the current section name.
 *
 * @param  {Object}  state Global state tree
 * @returns {?string}       Current section name
 */
export default function getSectionName( state ) {
	return get( getSection( state ), 'name', null );
}
