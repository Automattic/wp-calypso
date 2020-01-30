/**
 * Local module dependencies.
 */
import MarketingSurvey from './marketing.survey';

export default class Marketing {
	/**
	 * `Marketing` constructor.
	 *
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Undefined} undefined
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
	 * @param {String} id - survey idetification
	 * @param {String} [siteId] - site identification
	 * @return {MarketingSurvey} MarketingSurvey instance
	 */
	survey( id, siteId ) {
		return new MarketingSurvey( id, siteId, this.wpcom );
	}
}
