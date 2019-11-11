/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSection from './get-section';

/**
 * Returns the current section name.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Current section name
 */
export default function getSectionName( state ) {
	return get( getSection( state ), 'name', null );
}
