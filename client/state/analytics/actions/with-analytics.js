/**
 * External dependencies
 */
import { curry, get, isFunction, merge } from 'lodash';

const mergedMetaData = ( a, b ) => [
	...get( a, 'meta.analytics', [] ),
	...get( b, 'meta.analytics', [] ),
];

const joinAnalytics = ( analytics, action ) =>
	isFunction( action )
		? ( dispatch ) => {
				dispatch( analytics );
				dispatch( action );
		  }
		: merge( {}, action, { meta: { analytics: mergedMetaData( analytics, action ) } } );

const withAnalytics = curry( joinAnalytics );

export default withAnalytics;
