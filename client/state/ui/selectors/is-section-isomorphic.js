/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSection from './get-section';

/**
 * Returns true if the current section is isomorphic.
 *
 * @param  {object}  state Global state tree
 * @returns {bool}    True if current section is isomorphic
 *
 * @see client/sections
 */
export default function isSectionIsomorphic( state ) {
	return get( getSection( state ), 'isomorphic', false );
}
