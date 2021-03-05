/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { receiveRecommendedSites } from '../actions';
import { items, pagingOffset } from '../reducer';

const seed = 0;
const sites = freeze( [
	{
		blog_url: 'http://www.macrumors.com/macrumors.xml',
		feedId: '8850855',
	},
	{
		blog_url: 'http://sites.macrumors.com/MacRumors-All',
		feedId: '4210277',
	},
] );

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should add rec results to an empty object', () => {
			const prevState = {};
			const action = receiveRecommendedSites( { seed, sites } );
			const nextState = items( prevState, action );

			expect( nextState ).to.eql( {
				[ seed ]: sites,
			} );
		} );

		test( 'should add recs to an already populated object', () => {
			const prevState = {
				42: [ { feedId: 233434 } ],
			};
			const action = receiveRecommendedSites( { seed, sites } );
			const nextState = items( prevState, action );
			expect( nextState ).to.eql( {
				...prevState,
				[ seed ]: sites,
			} );
		} );
	} );

	describe( '#pagingOffset', () => {
		test( 'should default to empty object', () => {
			expect( pagingOffset( undefined, {} ) ).to.eql( {} );
		} );

		test( 'should set the offset of a seed to the specified number', () => {
			const prevState = {};
			const action = receiveRecommendedSites( { seed, offset: 20 } );
			const nextState = pagingOffset( prevState, action );

			expect( nextState ).to.eql( {
				[ seed ]: 20,
			} );
		} );

		test( 'should never let the offset for a seed get smaller', () => {
			const prevState = { [ seed ]: 42 };
			const action = receiveRecommendedSites( { seed, offset: 20 } );
			const nextState = pagingOffset( prevState, action );

			expect( nextState ).to.eql( {
				[ seed ]: 42,
			} );
		} );
	} );
} );
