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
import { items, selected } from '../reducer';
import { withSchemaValidation } from 'state/utils';

const saveAction = { type: SERIALIZE };
const loadAction = { type: DESERIALIZE };
describe( 'stream items reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( items( undefined, {} ) ).toEqual( {} );
	} );

	it( 'should put a stream under the right key', () => {
		const startState = deepfreeze( {} );
		const action = receivePage( {
			streamId: 'following',
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
			streamId: 'following',
			query: {},
			posts: [ { global_ID: 1234 } ],
		} );
		expect( items( startState, action ) ).toEqual( {
			following: [ { global_ID: 42 }, { global_ID: 1234 } ],
		} );
	} );

	describe( 'schema', () => {
		const itemsWithValidation = withSchemaValidation( items.schema, items );
		const validState = deepfreeze( { following: [], 'feed:123': [ {}, {} ] } );
		const invalidState = deepfreeze( { chickens: Infinity } );

		it( 'should serialize any data', () => {
			expect( itemsWithValidation( validState, saveAction ) ).toEqual( validState );
			expect( itemsWithValidation( invalidState, saveAction ) ).toEqual( invalidState );
		} );

		it( 'should deserialize valid data', () => {
			expect( itemsWithValidation( validState, loadAction ) ).toEqual( validState );
		} );
		it( 'should not deserialize invalid data', () => {
			expect( itemsWithValidation( invalidState, loadAction ) ).toEqual( {} );
		} );
	} );
} );

describe( 'stream selected', () => {
	it( 'should return an empty object by default', () => {
		expect( selected( undefined, {} ) ).toEqual( {} );
	} );

	it( 'should store the index requested for nonexistent stream', () => {
		expect( selected( undefined, selectItem( { streamId: 'following', index: 7 } ) ) ).toEqual( {
			following: 7,
		} );
	} );

	it( 'should update the index for a stream', () => {
		const prevState = { following: 10 };
		const action = selectItem( { streamId: 'following', index: 7 } );
		expect( selected( prevState, action ) ).toEqual( {
			following: 7,
		} );
	} );

	describe( 'schema', () => {
		const selectedWithValidation = withSchemaValidation( selected.schema, selected );
		const validState = deepfreeze( { following: 0, 'feed:123': 42 } );
		const invalidState = deepfreeze( { chickens: Infinity } );

		it( 'should never deserialize', () => {
			expect( selectedWithValidation( validState, loadAction ) ).toEqual( {} );
			expect( selectedWithValidation( invalidState, loadAction ) ).toEqual( {} );
		} );
	} );
} );
