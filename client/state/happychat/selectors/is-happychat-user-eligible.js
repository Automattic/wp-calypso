/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state - global redux state
 * @return {Boolean?} Whether the user is eligible for Happychat. `null` if the
 * eligibility status is unknown (i.e., not fetched from server yet)
 */
export default state => get( state, 'happychat.user.isEligible' );
