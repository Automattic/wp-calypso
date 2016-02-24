/**
 * External dependencies
 */
import memoize from 'lodash/memoize';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Returns a memoized state selector for use with the Redux global application state.
 *
 * @param  {Function} selector      Function calculating cached result
 * @param  {Function} getDependants Function describing dependent state
 * @return {Function}               Memoized selector
 */
export default function createSelector( selector, getDependants = ( state ) => state ) {
	const memoizedSelector = memoize( selector, ( state, ...args ) => args.join() );
	let lastDependants;

	return Object.assign( function( state, ...args ) {
		let currentDependants = getDependants( state );
		if ( ! Array.isArray( currentDependants ) ) {
			currentDependants = [ currentDependants ];
		}

		if ( lastDependants && ! shallowEqual( currentDependants, lastDependants ) ) {
			memoizedSelector.cache.clear();
		}

		lastDependants = currentDependants;

		return memoizedSelector( state, ...args );
	}, { memoizedSelector } );
}

