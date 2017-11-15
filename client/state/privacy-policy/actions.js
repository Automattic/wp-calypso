/** @format */

/**
 * Internal dependencies
 */
import { PRIVACY_POLICY_ADD, PRIVACY_POLICY_REQUEST } from 'state/action-types';

/**
 * Internal dependencies
 */

export const requestPrivacyPolicy = () => ( {
	type: PRIVACY_POLICY_REQUEST,
} );

export const privacyPolicyReceive = entities => ( {
	type: PRIVACY_POLICY_ADD,
	entities,
} );
