/**
 * Return a boolean value indicating whether requesting for the password reset options is in progress.
 *
 * @param  {Object} state  Global state tree
 * @return {Boolean} If the request is in progress
 */

export default ( state ) => {
	return state.accountRecovery.reset.options.isRequesting;
};
