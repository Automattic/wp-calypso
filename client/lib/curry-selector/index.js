/** @format */
/**
 * External dependencies
 */
import { identity, isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteCommentCounts } from 'state/selectors'
import { getPreference } from 'state/preferences/selectors';

const currySelector = function( selector ) {
	if ( ! isFunction( selector ) ) {
		console.warn( 'something something selector is not a function...' );
		return selector;
	}

	const arity = selector.length;

    return function () {
		return [ ...arguments ].length === arity
      		? selector( ...arguments )
      		: recurse( [], [ ...arguments ] );
    };

  	function nextRecursor( accumulator ) {
	    return function () {
	      	return recurse( accumulator, [ ...arguments ] );
	    };
  	}

  	function recurse( accumulator, args ) {
    	const nextAccumulator = accumulator.concat( args );

    	if ( nextAccumulator.length < arity ) {
      		return nextRecursor( nextAccumulator );
    	} else {
			const state = [ ...nextAccumulator ].pop();
			const rest = [ ...nextAccumulator ].slice( 0, -1 );

      		return selector.apply( this, [ state, ...rest ] );
    	}
  	}
};

export default currySelector;

export const quickTest = () => {
	const siteId1 = 'siteId1';
	const postId1 = 'postId1';
	const postId2 = 'postId2';
	const siteId2 = 'siteId2';
	const postId3 = 'postId3';
	const postId4 = 'postId4';

	const state = {
		comments: {
			counts: {
				[ siteId1 ]: {
					[ postId1 ]: 11,
					[ postId2 ]: 22,
				},
				[ siteId2 ]: {
					[ postId3 ]: 33,
				},
			},
		},
		preferences: {
			localValues: {
				'colorScheme': 'blue!',
			}
		}
	};

	const curriedGetPreference = currySelector( getPreference );
	const curriedGetSiteCommentCounts = currySelector( getSiteCommentCounts );

	const getColorSchemePreference = curriedGetPreference( 'colorScheme' );
	const colorSchemePreference = getColorSchemePreference( state );


	const siteCommentCount1 = curriedGetSiteCommentCounts( state, siteId1, postId1 );
	const siteCommentCount2 = curriedGetSiteCommentCounts( siteId1, postId2 )( state );
	const siteCommentCount3 = curriedGetSiteCommentCounts( siteId2 )( postId3 )( state );

	return {
		colorSchemePreference,
		siteCommentCount1,
		siteCommentCount2,
		siteCommentCount3,
	};
}