/** @format */
/**
 * External Dependencies
 */
import deepfreeze from 'deep-freeze';

/**
 * Internal Dependencies
 */
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import { receivePage } from '../actions';
import { items } from '../reducer';
import { itemsSchema } from '../schema';
import { withSchemaValidation } from 'state/utils';

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
		const itemsWithValidation = withSchemaValidation( itemsSchema, items );
		const saveAction = { type: SERIALIZE };
		const loadAction = { type: DESERIALIZE };
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
