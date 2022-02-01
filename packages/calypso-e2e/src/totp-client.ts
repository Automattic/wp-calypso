import totp from 'totp-generator';

/**
 *
 */
export class TOTPClient {
	private secret: string;

	/**
	 *
	 * @param secret
	 */
	constructor( secret: string ) {
		this.secret = secret;
	}

	/**
	 *
	 * @returns {string} TOTP code valid for the epoch for which it was generated.
	 */
	getToken(): string {
		return totp( this.secret ).toString();
	}
}
