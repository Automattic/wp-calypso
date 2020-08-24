/**
 * Local module dependencies.
 */
import MarketingSurvey from './marketing.survey';

export default class Marketing {
	/**
	 * `Marketing` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @returns {undefined} undefined
	 */
	constructor( wpcom ) {
		if ( ! ( this instanceof Marketing ) ) {
			return new Marketing( wpcom );
		}
		this.wpcom = wpcom;
	}

	/**
	 * Return `MarketingSurvey` object instance
	 *
	 * @param {string} id - survey idetification
	 * @param {string} [siteId] - site identification
	 * @returns {MarketingSurvey} MarketingSurvey instance
	 */
	survey( id, siteId ) {
		return new MarketingSurvey( id, siteId, this.wpcom );
	}
}
