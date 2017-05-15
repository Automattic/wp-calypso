/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { receiveRecommendedSites, } from '../actions';
import { items } from '../reducer';

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
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should add rec results to an empty object', () => {
			const prevState = {};
			const action = receiveRecommendedSites( { seed, sites } );
			const nextState = items( prevState, action );

			expect( nextState ).to.eql( {
				[ seed ]: sites,
			} );
		} );

		it( 'should add recs to an already populated object', () => {
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
} );
