/** @format */
/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import { ACTIVITY_LOG_FILTER_SET, ACTIVITY_LOG_FILTER_UPDATE, NAVIGATE } from 'state/action-types';
import { filterStateToQuery } from 'my-sites/stats/activity-log/utils';
import { getActivityLogFilter } from 'state/selectors';

export const navigationMiddleware = store => {
	return next => action => {
		switch ( action.type ) {
			case ACTIVITY_LOG_FILTER_SET:
			case ACTIVITY_LOG_FILTER_UPDATE:
				const afterFilter = next( action );

				if (
					get( action, [ 'meta', 'skipUrlUpdate' ] ) ||
					! /^[/]stats[/]activity[/]/.test( document.location.pathname )
				) {
					return afterFilter;
				}

				const filter = getActivityLogFilter( store.getState(), action.siteId );
				const query = filterStateToQuery( filter );

				page( addQueryArgs( query, window.location.pathname + window.location.hash ) );

				return afterFilter;

			case NAVIGATE:
				return action.path ? page( action.path ) : next( action );

			default:
				return next( action );
		}
	};
};

export default navigationMiddleware;
