import freeze from 'deep-freeze';
import { receiveRelatedSites } from '../actions';
import { items, pagingOffset } from '../reducer';

const tag = 'macrumors';
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
			expect( state ).toEqual( {} );
		} );

		test( 'should add rec results to an empty object', () => {
			const prevState = {};
			const action = receiveRelatedSites( { tag, sites } );
			const nextState = items( prevState, action );

			expect( nextState ).toEqual( {
				[ tag ]: sites,
			} );
		} );

		test( 'should add recs to an already populated object', () => {
			const prevState = {
				42: [ { feedId: 233434 } ],
			};
			const action = receiveRelatedSites( { tag, sites } );
			const nextState = items( prevState, action );
			expect( nextState ).toEqual( {
				...prevState,
				[ tag ]: sites,
			} );
		} );
	} );

	describe( '#pagingOffset', () => {
		test( 'should default to empty object', () => {
			expect( pagingOffset( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should set the offset of a seed to the specified number', () => {
			const prevState = {};
			const action = receiveRelatedSites( { tag, offset: 20 } );
			const nextState = pagingOffset( prevState, action );

			expect( nextState ).toEqual( {
				[ tag ]: 20,
			} );
		} );

		test( 'should never let the offset for a seed get smaller', () => {
			const prevState = { [ tag ]: 42 };
			const action = receiveRelatedSites( { tag, offset: 20 } );
			const nextState = pagingOffset( prevState, action );

			expect( nextState ).toEqual( {
				[ tag ]: 42,
			} );
		} );
	} );
} );
