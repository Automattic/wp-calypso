/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/help/init';

export const SUPPORT_LEVEL_FREE = 'free';
export const SUPPORT_LEVEL_PERSONAL = 'personal';
export const SUPPORT_LEVEL_PERSONAL_WITH_LEGACY_CHAT = 'personal-with-legacy-chat';
export const SUPPORT_LEVEL_PREMIUM = 'premium';
export const SUPPORT_LEVEL_BUSINESS = 'business';
export const SUPPORT_LEVEL_ECOMMERCE = 'ecommerce';
export const SUPPORT_LEVEL_JETPACK_PAID = 'jetpack-paid';

/**
 * Returns the current user's support level, representing their highest paid plan.
 *
 * @param  {object}  state   Global state tree
 * @returns {string} Level of support
 */
export default function getSupportLevel( state ) {
	return get( state, 'help.supportLevel', null );
}
