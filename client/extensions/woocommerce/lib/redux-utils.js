/**
 * External dependencies
 */

import { bindActionCreators } from 'redux';
import { isFunction, reduce } from 'lodash';

/**
 * Calls Redux' bindActionCreators on the passed in actionCreators
 * and also binds their first argument to be siteId
 *
 * @param { Function|object } actionCreators - action creators to be bound to siteId and passed on to bindActionCreators
 * @param { Function } dispatch - dispatch function
 * @param {number} siteId - site ID
 * @returns {Function|object} result of bindActionCreators
 */
export const bindActionCreatorsWithSiteId = ( actionCreators, dispatch, siteId ) => {
	if ( isFunction( actionCreators ) ) {
		return bindActionCreators( actionCreators.bind( null, siteId ), dispatch );
	}

	return bindActionCreators(
		reduce(
			actionCreators,
			( accumulator, action, key ) => {
				accumulator[ key ] = action.bind( null, siteId );
				return accumulator;
			},
			{}
		),
		dispatch
	);
};
