/**
 * External dependencies
 */
import { get, merge } from 'lodash';

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

export const withAnalytics = ( ...args ) => {
	return args.length >= joinAnalytics.length
		? joinAnalytics( ...args )
		: ( ...args2 ) => withAnalytics( ...args.concat( args2 ) );
};
