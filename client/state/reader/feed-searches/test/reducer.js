/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { receiveFeedSearch } from '../actions';
import { items } from '../reducer';

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
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should add query results to an empty object', () => {
			const prevState = {};
			const action = receiveFeedSearch( queryKey, feeds );
			const nextState = items( prevState, action );

			expect( nextState ).to.eql( {
				[ queryKey ]: feeds,
			} );
		} );

		test( 'should add query results to an already populated object', () => {
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
} );
