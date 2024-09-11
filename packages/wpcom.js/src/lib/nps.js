export default class Nps {
	/**
	 * `Nps` constructor.
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof Nps ) ) {
			return new Nps( wpcom );
		}

		this.wpcom = wpcom;
	}
	/**
	 * Submit a response to the NPS Survey.
	 * @param {string}     surveyName     The name of the NPS survey being submitted
	 * @param {number}	score          The value for the survey response
	 * @param {Function}   fn             The callback function
	 * @returns {Promise} A promise representing the request.
	 */
	submitNPSSurvey( surveyName, score, fn ) {
		return this.wpcom.req.post(
			{ path: `/nps/${ surveyName }` },
			{ apiVersion: '1.2' },
			{ score },
			fn
		);
	}

	/**
	 * Dismiss the NPS Survey.
	 * @param {string}     surveyName     The name of the NPS survey being submitted
	 * @param {Function}   fn             The callback function
	 * @returns {Promise} A promise representing the request.
	 */
	dismissNPSSurvey( surveyName, fn ) {
		return this.wpcom.req.post(
			{ path: `/nps/${ surveyName }` },
			{ apiVersion: '1.2' },
			{ dismissed: true },
			fn
		);
	}

	/**
	 * Check the eligibility status for the NPS Survey.
	 * @param {Function}   fn             The callback function
	 * @returns {Promise} A promise representing the request.
	 */
	checkNPSSurveyEligibility( fn ) {
		return this.wpcom.req.get( { path: '/nps' }, { apiVersion: '1.2' }, {}, fn );
	}

	/**
	 * Send the optional feedback for the NPS Survey.
	 * @param {string}   surveyName   The name of the NPS survey being submitted
	 * @param {string}   feedback     The content
	 * @param {Function} fn           The callback function
	 * @returns {Promise} A promise representing the request.
	 */
	sendNPSSurveyFeedback( surveyName, feedback, fn ) {
		return this.wpcom.req.post(
			{ path: `/nps/${ surveyName }` },
			{ apiVersion: '1.2' },
			{ feedback },
			fn
		);
	}
}
