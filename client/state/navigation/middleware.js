/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import {
	ACTIVITY_LOG_FILTER_SET,
	ACTIVITY_LOG_FILTER_UPDATE,
	NAVIGATE,
	HISTORY_REPLACE,
} from 'state/action-types';
import { filterStateToQuery } from 'state/activity-log/utils';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';

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
						/^[/]backups[/]activity[/]/.test( document.location.pathname )
					)
				) {
					return afterFilter;
				}

				const filter = getActivityLogFilter( store.getState(), action.siteId );
				const query = filterStateToQuery( filter );

				page( addQueryArgs( query, window.location.pathname + window.location.hash ) );
				/* eslint-enable no-case-declarations */
				return afterFilter;

			case NAVIGATE:
				if ( action.path ) {
					page( action.path );
				}

				return next( action );
			case HISTORY_REPLACE:
				if ( action.path ) {
					if ( action.saveContext ) {
						// Replace the history entry, but don't dispatch a new navigation context.
						//path, state, init, dispatch
						page.replace( action.path, null, false, false );
					} else {
						page.replace( action.path );
					}
				}
				return next( action );
			default:
				return next( action );
		}
	};
};

export default navigationMiddleware;
