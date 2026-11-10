/**
 * Whether the latest magic-login email was for an account that does not exist yet.
 * @param {Object} state Global state tree
 * @returns {boolean} True when the send response said this is a new account.
 */
export default function getMagicLoginIsNewAccount( state ) {
	return state.login.magicLogin.isNewAccount === true;
}
