const root = '/me/two-step/sms/';

export default class MeTwoStepSMS {

	/**
	 * `MeTwoStepSMS` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Null} null
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof MeTwoStepSMS ) ) {
			return new MeTwoStepSMS( wpcom );
		}
		this.wpcom = wpcom;
	}

	/**
	 * Sends a two-step code via SMS to the current user.
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	send( query, fn ) {
		return this.wpcom.req.post( root + 'new', query, fn );
	}
}
