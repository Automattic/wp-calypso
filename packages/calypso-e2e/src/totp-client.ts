import totp from 'totp-generator';

/**
 * Client to generate TOTP codes, used for 2FA on WordPress.com.
 */
export class TOTPClient {
	private secret: string;

	/**
	 * Constructs an instance of the TOTP client.
	 *
	 * @param {string} secret Secret value used to generate TOTP codes.
	 */
	constructor( secret: string ) {
		this.secret = secret;
	}

	/**
	 * Returns the TOTP code.
	 *
	 * @returns {string} TOTP code valid for the epoch for which it was generated.
	 */
	getToken(): string {
		return totp( this.secret, { timestamp: Date.now() } ).toString();
	}
}
