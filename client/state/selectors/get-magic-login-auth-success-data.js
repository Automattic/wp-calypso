/**
 * Returns the magic login authentication success data if it exists
 * @param  {Object}  state Global state tree
 * @returns {Object | null}  The auth success data if it exists, null otherwise
 */
export default function getMagicLoginAuthSuccessData( state ) {
	return state.login.magicLogin.authSuccessData;
}
