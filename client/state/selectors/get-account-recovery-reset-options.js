/**
 * Returns a list of pairs of email and sms number that can be used for resetting a user's password.
 *
 * @param  {Object} state Global state tree
 * @return {Array}        Pairs of email and sms number.
 */
export default ( state ) => {
	return state.accountRecovery.reset.options.items;
};
