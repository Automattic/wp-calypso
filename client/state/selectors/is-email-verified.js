/**
 * Returns true if there is the user's email is verified, false if not.
 *
 * @param {state} state State object
 */
export const isEmailVerified = ( state ) => state.currentUser.user.email_verified;
