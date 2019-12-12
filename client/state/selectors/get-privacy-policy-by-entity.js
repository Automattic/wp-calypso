/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Return the privacy policy by the given entity
 *
 * @param  {Object} state - Global state tree
 * @param {String} entity - the entity to get the privacy policy, for instance, `automattic`.
 * @return {Object} Privacy policy object
 */
export default function getPrivacyPolicyByEntity( state, entity ) {
	return get( state, [ 'privacyPolicy', 'entities', entity ], {} );
}
