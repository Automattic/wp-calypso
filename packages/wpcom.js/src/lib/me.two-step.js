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
	 * @return {Null} null
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
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( root, query, fn );
	}

	/**
	 * Return a `MeTwoStepSMS` instance.
	 *
	 * @return {MeTwoStepSMS} MeTwoStepSMS instance
	 */
	sms() {
		return new MeTwoStepSMS( this.wpcom );
	}
}
