/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/happychat/init';

/**
 * @param {object} state - global redux state
 * @returns {boolean?} Whether the user is eligible for Happychat. `null` if the
 * eligibility status is unknown (i.e., not fetched from server yet)
 */
export default ( state ) => get( state, 'happychat.user.isEligible' );
