/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns original string data from GlotPress
 *
 * @param  {Object}  state       Global state tree
 * @return {Object|Null} 		Original string data from GlotPress
 */
export default function getCommunityTranslatorStringData( state, originalId ) {
	return get( state, `i18n.communityTranslator.items.${ originalId }`, null );
}
