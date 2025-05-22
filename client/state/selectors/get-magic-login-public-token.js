/**
 * Returns the public token for magic login if it exists
 * @param  {Object}  state Global state tree
 * @returns {string|null}  The public token if it exists, null otherwise
 */
export default function getMagicLoginPublicToken( state ) {
	return state.login.magicLogin.publicToken;
}
