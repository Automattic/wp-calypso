/** @format */

/**
 * Determines whether the user account uses a regular authentication by password.
 *
 * @param {String} authAccountType - authentication account type
 * @return {Boolean} true if the account is regular, false otherwise
 */
export const isRegularAccount = authAccountType => authAccountType === 'regular';
