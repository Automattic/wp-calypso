import 'calypso/state/happychat/init';

/**
 * Returns the current user's support level, representing their highest paid plan.
 *
 * @param  {Object}  state   Global state tree
 * @returns {?string} Level of support
 */
export default function getSupportLevel( state ) {
	return state.happychat.user.supportLevel;
}
