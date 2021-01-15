/**
 * Dominant license states.
 */
export const STATE_ATTACHED = 'attached';
export const STATE_DETACHED = 'detached';
export const STATE_REVOKED = 'revoked';

/**
 * Get the dominant state of a license based on its properties.
 * For example, if a license is neither attached to a site and revoked then it is both detached and revoked but
 * the dominant state would be considered to be revoked as it is of higher importance.
 *
 * @param {string} attachedOn Date the license was attached on, if any.
 * @param {string} revokedOn Date the license was revoked on, if any.
 * @returns {string} The dominant state matching one of the STATE_* constant values.
 */
export function getLicenseDominantState( attachedOn: string, revokedOn: string ): string {
	if ( revokedOn ) {
		return STATE_REVOKED;
	}

	if ( attachedOn ) {
		return STATE_ATTACHED;
	}

	return STATE_DETACHED;
}
