/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSection from './get-section';
import getSectionName from './get-section-name';

/**
 * Returns the current section message path, or name if none.
 *
 * @param  {object}  state Global state tree
 * @returns {?string}       Current section group name
 */
export default function getSectionMessagePath( state ) {
	return get( getSection( state ), 'message-path', getSectionName( state ) );
}
