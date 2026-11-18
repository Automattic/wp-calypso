/**
 * Thrown when the user belongs to a site they can’t manage here, e.g. as an Editor, or on a P2.
 */
export class SitePermissionError extends Error {
	constructor() {
		super( 'The current user can’t manage this site.' );
		this.name = 'SitePermissionError';
	}
}
