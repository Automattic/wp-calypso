/**
 * Module dependencies
 */
import MeTwoStepSMS from './me.two-step.sms';

const root = '/me/two-step/';

export default class MeTwoStep {
	/**
	 * `MeTwoStep` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {null} null
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof MeTwoStep ) ) {
			return new MeTwoStep( wpcom );
		}
		this.wpcom = wpcom;
	}

	/**
	 * Get information about current user's two factor configuration.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( root, query, fn );
	}

	/**
	 * Return a `MeTwoStepSMS` instance.
	 *
	 * @returns {MeTwoStepSMS} MeTwoStepSMS instance
	 */
	sms() {
		return new MeTwoStepSMS( this.wpcom );
	}
}
