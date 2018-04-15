/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getGoolgeMyBusinessSiteStats = ( state, siteId, statName, timeSpan ) =>
	get( state, `googleMyBusiness[${ siteId }].stats[${ statName + '_' + timeSpan }]`, null );
