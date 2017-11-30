/** @format */

/**
 * Determines whether the user account uses regular authentication by password.
 *
 * @param {String} authAccountType - authentication account type
 * @return {Boolean} true if the account is regular, false otherwise
 */
export const isRegularAccount = authAccountType => authAccountType === 'regular';

/**
 * Determines whether the user account uses authentication without password.
 *
 * @param {String} authAccountType - authentication account type
 * @return {Boolean} true if the account is passwordless, false otherwise
 */
export const isPasswordlessAccount = authAccountType => authAccountType === 'passwordless';
