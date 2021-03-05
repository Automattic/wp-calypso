/**
 * Module vars
 */
const root = '/marketing/survey';

export default class MarketingSurvey {
	/**
	 * `MarketingSurvey` constructor.
	 *
	 * @param {string} id - survey identification
	 * @param {string} [siteId] - site identification
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
	 */
	constructor( id, siteId, wpcom ) {
		if ( ! id ) {
			throw new TypeError( '`id` survey is not correctly defined' );
		}

		if ( ! ( this instanceof MarketingSurvey ) ) {
			return new MarketingSurvey( id, siteId, wpcom );
		}

		if ( typeof siteId === 'object' ) {
			this.wpcom = siteId;
		} else {
			this._siteId = siteId;
			this.wpcom = wpcom;
		}

		this._id = id;
		this._responses = {};
	}

	setSiteId( siteId ) {
		this._siteId = siteId;
		return this;
	}

	addResponse( key, value ) {
		this._responses = Object.assign( {}, this._responses, { [ key ]: value } );
		return this;
	}

	addResponses( responses ) {
		this._responses = Object.assign( {}, this._responses, responses );
		return this;
	}

	/**
	 * Submit a marketing survey.
	 *
	 * @param {object} [query] - query object parameter
	 * @param {object} [body] - body object parameter
	 * @param {Function} [fn] - callback function
	 * @returns {Promise} Promise
	 */
	submit( query = {}, body = {}, fn ) {
		body.survey_id = this._id;
		body.site_id = body.site_id || this._siteId;
		body.survey_responses = body.survey_responses || this._responses;
		return this.wpcom.req.post( `${ root }`, query, body, fn );
	}
}
