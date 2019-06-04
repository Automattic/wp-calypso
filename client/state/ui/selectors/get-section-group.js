/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSection from './get-section';

/**
 * Returns the current section group name.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Current section group name
 */
export default function getSectionGroup( state ) {
	return get( getSection( state ), 'group', null );
}
