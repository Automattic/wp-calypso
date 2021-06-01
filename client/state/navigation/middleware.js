/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';
import { ACTIVITY_LOG_FILTER_SET, ACTIVITY_LOG_FILTER_UPDATE } from 'calypso/state/action-types';
import { filterStateToQuery } from 'calypso/state/activity-log/utils';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';

export const navigationMiddleware = ( store ) => {
	return ( next ) => ( action ) => {
		switch ( action.type ) {
			case ACTIVITY_LOG_FILTER_SET:
			case ACTIVITY_LOG_FILTER_UPDATE:
				/* eslint-disable no-case-declarations */
				const afterFilter = next( action );

				if (
					get( action, [ 'meta', 'skipUrlUpdate' ] ) ||
					! (
						/^[/]activity-log[/]/.test( document.location.pathname ) ||
						/^[/]backup[/]activity[/]/.test( document.location.pathname )
					)
				) {
					return afterFilter;
				}

				const filter = getActivityLogFilter( store.getState(), action.siteId );
				const query = filterStateToQuery( filter );

				page( addQueryArgs( query, window.location.pathname + window.location.hash ) );
				/* eslint-enable no-case-declarations */
				return afterFilter;

			default:
				return next( action );
		}
	};
};

export default navigationMiddleware;
