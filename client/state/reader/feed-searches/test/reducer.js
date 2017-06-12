/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { receiveFeedSearch } from '../actions';
import { items, total, algorithm } from '../reducer';

const queryKey = 'macrumor-F-ASC';
const feeds = freeze( [
	{
		URL: 'http://www.macrumors.com/macrumors.xml',
		feed_URL: 'http://www.macrumors.com/macrumors.xml',
		subscribe_URL: 'http://www.macrumors.com/macrumors.xml',
		feed_ID: '8850855',
		title: null,
		railcar: {},
	},
	{
		URL: 'http://feeds.macrumors.com/MacRumors-All',
		feed_URL: 'http://feeds.macrumors.com/MacRumors-All',
		subscribe_URL: 'http://feeds.macrumors.com/MacRumors-All',
		feed_ID: '4210277',
		title: null,
		railcar: {},
	},
] );

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should add query results to an empty object', () => {
			const prevState = {};
			const action = receiveFeedSearch( queryKey, feeds );
			const nextState = items( prevState, action );

			expect( nextState ).to.eql( {
				[ queryKey ]: feeds,
			} );
		} );

		it( 'should add query results to an already populated object', () => {
			const prevState = {
				chickens: [ { blogName: 'chickens R us' } ],
			};
			const action = receiveFeedSearch( queryKey, feeds );
			const nextState = items( prevState, action );
			expect( nextState ).to.eql( {
				...prevState,
				[ queryKey ]: feeds,
			} );
		} );
	} );

	describe( '#total', () => {
		it( 'should default to an empty object', () => {
			const state = algorithm( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should record the total', () => {
			const state = freeze( {} );
			expect( total( state, receiveFeedSearch( queryKey, feeds, 100, 'made-up' ) ) ).to.eql( {
				[ queryKey ]: 100,
			} );
		} );
	} );

	describe( '#algorithm', () => {
		it( 'should default to an empty object', () => {
			const state = algorithm( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should record the algorithm', () => {
			const state = freeze( {} );
			expect( algorithm( state, receiveFeedSearch( queryKey, feeds, 100, 'made-up' ) ) ).to.eql( {
				[ queryKey ]: 'made-up',
			} );
		} );
	} );
} );
