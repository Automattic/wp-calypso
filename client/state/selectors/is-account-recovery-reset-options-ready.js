/**
 * Return a boolean value indicating whether the account recovery reset options are fetched and ready to be used.
 *
 * @param  {Object} state Global state tree
 * @return {Boolean}      If the reset options are ready.
 */
export default ( state ) => {
	const resetOptions = state.accountRecovery.reset.options;
	return ! resetOptions.error && 0 < resetOptions.items.length;
};
