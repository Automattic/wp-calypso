import 'calypso/state/help/init';

/**
 * Returns the current user's support level, representing their highest paid plan.
 *
 * @param  {object}  state   Global state tree
 * @returns {?string} Level of support
 */
export default function getSupportLevel( state ) {
	return state.help.supportLevel;
}
