/** @format */
/**
 * External Dependencies
 */
import deepfreeze from 'deep-freeze';

/**
 * Internal Dependencies
 */
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import { receivePage, selectItem } from '../actions';
import streamsReducer, { items, selected } from '../reducer';

jest.mock( 'lib/warn', () => () => {} );

describe( 'streams.items reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( items( undefined, {} ) ).toEqual( {} );
	} );

	it( 'should put a stream under the right key', () => {
		const startState = deepfreeze( {} );
		const action = receivePage( {
			streamKey: 'following',
			query: {},
			posts: [ { global_ID: 1234 } ],
		} );
		expect( items( startState, action ) ).toEqual( {
			following: [ { global_ID: 1234 } ],
		} );
	} );

	it( 'should add new posts to existing stream', () => {
		const startState = deepfreeze( {
			following: [ { global_ID: 42 } ],
		} );
		const action = receivePage( {
			streamKey: 'following',
			query: {},
			posts: [ { global_ID: 1234 } ],
		} );
		expect( items( startState, action ) ).toEqual( {
			following: [ { global_ID: 42 }, { global_ID: 1234 } ],
		} );
	} );
} );

describe( 'streams.selected reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( selected( undefined, {} ) ).toEqual( {} );
	} );

	it( 'should store the index requested for nonexistent stream', () => {
		expect( selected( undefined, selectItem( { streamKey: 'following', index: 7 } ) ) ).toEqual( {
			following: 7,
		} );
	} );

	it( 'should update the index for a stream', () => {
		const prevState = { following: 10 };
		const action = selectItem( { streamKey: 'following', index: 7 } );
		expect( selected( prevState, action ) ).toEqual( {
			following: 7,
		} );
	} );
} );

describe( 'streams combined reducer', () => {
	const saveAction = { type: SERIALIZE };
	const loadAction = { type: DESERIALIZE };

	const validState = deepfreeze( {
		items: { following: [ {} ], 'feed:123': [ {}, {} ] },
		selected: { following: 0, 'feed:123': 42, elmo: 'is red' },
	} );

	const invalidState = deepfreeze( {
		items: { chickens: Infinity },
		selected: { chickens: Infinity },
	} );

	it( 'should serialize any items data', () => {
		expect( streamsReducer( validState, saveAction ).items ).toEqual( validState.items );
		expect( streamsReducer( invalidState, saveAction ).items ).toEqual( invalidState.items );
	} );

	it( 'should deserialize valid items data', () => {
		expect( streamsReducer( validState, loadAction ).items ).toEqual( validState.items );
	} );

	it( 'should not deserialize invalid items data', () => {
		expect( streamsReducer( invalidState, loadAction ).items ).toEqual( {} );
	} );

	it( 'should never serialize the selected data', () => {
		expect( streamsReducer( validState, saveAction ).selected ).toBeUndefined();
		expect( streamsReducer( invalidState, saveAction ).selected ).toBeUndefined();
	} );

	it( 'should never deserialize the selected data', () => {
		expect( streamsReducer( validState, loadAction ).selected ).toEqual( {} );
		expect( streamsReducer( invalidState, loadAction ).selected ).toEqual( {} );
	} );
} );
