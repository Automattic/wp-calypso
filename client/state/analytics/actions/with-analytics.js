/**
 * External dependencies
 */
import { curry, get, merge } from 'lodash';

const mergedMetaData = ( a, b ) => [
	...get( a, 'meta.analytics', [] ),
	...get( b, 'meta.analytics', [] ),
];

const joinAnalytics = ( analytics, action ) =>
	typeof action === 'function'
		? ( dispatch ) => {
				dispatch( analytics );
				dispatch( action );
		  }
		: merge( {}, action, { meta: { analytics: mergedMetaData( analytics, action ) } } );

export const withAnalytics = curry( joinAnalytics );
