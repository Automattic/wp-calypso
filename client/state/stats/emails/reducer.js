import { merge } from 'lodash';
import {
	EMAIL_STATS_RECEIVE,
	EMAIL_STATS_REQUEST,
	EMAIL_STATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { items as itemSchemas } from './schema';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the request stats.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const requests = ( state = {}, action ) => {
	switch ( action.type ) {
		case EMAIL_STATS_REQUEST:
		case EMAIL_STATS_RECEIVE:
		case EMAIL_STATS_REQUEST_FAILURE:
			// eslint-disable-next-line no-case-declarations
			const { siteId, postId, period, statType, date } = action;
			// eslint-disable-next-line no-case-declarations
			const status = ( () => {
				switch ( action.type ) {
					case EMAIL_STATS_REQUEST:
						return { requesting: true, status: 'pending' };
					case EMAIL_STATS_RECEIVE:
						return { requesting: false, status: 'success' };
					case EMAIL_STATS_REQUEST_FAILURE:
						return { requesting: true, status: 'error' };
				}
			} )();

			// don't set data key when period is alltime
			if ( period === PERIOD_ALL_TIME ) {
				return merge( {}, state, {
					[ siteId ]: {
						[ postId ]: {
							[ period ]: {
								[ statType ]: status,
							},
						},
					},
				} );
			}

			return merge( {}, state, {
				[ siteId ]: {
					[ postId ]: {
						[ period ]: {
							[ statType ]: {
								[ date ]: status,
							},
						},
					},
				},
			} );
	}

	return state;
};

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, email ID and stat keys to the value of the stat.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( itemSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case EMAIL_STATS_RECEIVE:
			// eslint-disable-next-line no-case-declarations
			const { siteId, postId, period, statType } = action;

			return merge( {}, state, {
				[ siteId ]: {
					[ postId ]: {
						[ period ]: {
							[ statType ]: action.stats,
						},
					},
				},
			} );
	}

	return state;
} );

export default combineReducers( {
	items,
	requests,
} );
