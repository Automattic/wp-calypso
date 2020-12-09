/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	VIEWERS_REQUEST_SUCCESS,
	VIEWERS_REQUEST,
	VIEWERS_REQUEST_FAILURE,
	REMOVE_VIEWER_SUCCESS,
} from '../../action-types';
import { items, queries, fetching } from '../reducer';

describe( '#items', () => {
	test( 'should key viewers by id', () => {
		const state = items( null, {
			type: VIEWERS_REQUEST_SUCCESS,
			siteId: 12345,
			data: {
				viewers: [
					{ ID: 1, avatar_URL: 'url' },
					{ ID: 2, avatar_URL: 'url' },
				],
			},
		} );
		expect( state ).toEqual( {
			1: { ID: 1, avatar_URL: 'url' },
			2: { ID: 2, avatar_URL: 'url' },
		} );
	} );

	test( 'should accumulate viewers', () => {
		const initialState = deepFreeze( { 3: { ID: 3, avatar_URL: 'url' } } );
		const state = items( initialState, {
			type: VIEWERS_REQUEST_SUCCESS,
			data: {
				viewers: [ { ID: 4, avatar_URL: 'url' } ],
			},
		} );
		expect( state ).toEqual( {
			3: { ID: 3, avatar_URL: 'url' },
			4: { ID: 4, avatar_URL: 'url' },
		} );
	} );

	test( 'should overwrite an existing viewer in the state with new data from the API', () => {
		const initialState = deepFreeze( { 3: { ID: 3, avatar_URL: 'url' } } );
		const state = items( initialState, {
			type: VIEWERS_REQUEST_SUCCESS,
			data: {
				viewers: [ { ID: 3, avatar_URL: 'updated-url' } ],
			},
		} );
		expect( state ).toEqual( { 3: { ID: 3, avatar_URL: 'updated-url' } } );
	} );

	test( 'should remove a viewer from the state', () => {
		const initialState = deepFreeze( {
			3: { ID: 3, avatar_URL: 'url' },
			4: { ID: 4, avatar_URL: 'url' },
		} );

		const state = items( initialState, {
			type: REMOVE_VIEWER_SUCCESS,
			viewerId: 4,
		} );

		expect( state ).toEqual( { 3: { ID: 3, avatar_URL: 'url' } } );
	} );
} );

describe( '#queries', () => {
	test( 'should only store the follower ids and total count', () => {
		const state = queries( undefined, {
			type: VIEWERS_REQUEST_SUCCESS,
			siteId: 1,
			data: {
				viewers: [
					{ ID: 1, avatar: 'url' },
					{ ID: 2, avatar: 'url' },
				],
				found: 1,
			},
		} );
		expect( state ).toEqual( { [ 1 ]: { ids: [ 1, 2 ], found: 1 } } );
	} );

	test( 'should group ids by siteId', () => {
		const initialState = deepFreeze( {
			[ 1 ]: { ids: [ 1 ], found: 1 },
		} );
		const state = queries( initialState, {
			type: VIEWERS_REQUEST_SUCCESS,
			siteId: 2,
			data: {
				viewers: [ { ID: 1, avatar: 'url' } ],
				found: 1,
			},
		} );
		expect( state ).toEqual( {
			[ 1 ]: { ids: [ 1 ], found: 1 },
			[ 2 ]: { ids: [ 1 ], found: 1 },
		} );
	} );

	test( 'should accumulate follower ids and update total for identical queries', () => {
		const initialState = deepFreeze( { [ 1 ]: { ids: [ 3 ] } } );
		const state = queries( initialState, {
			type: VIEWERS_REQUEST_SUCCESS,
			siteId: 1,
			data: {
				viewers: [ { ID: 4, avatar: 'url' } ],
				found: 2,
			},
		} );
		expect( state ).toEqual( { [ 1 ]: { ids: [ 3, 4 ], found: 2 } } );
	} );

	test( 'should not repeat ids within the same query', () => {
		const initialState = deepFreeze( { [ 1 ]: { ids: [ 1 ] } } );
		const state = queries( initialState, {
			type: VIEWERS_REQUEST_SUCCESS,
			siteId: 1,
			data: {
				viewers: [ { ID: 1, avatar: 'url' } ],
				found: 1,
			},
		} );
		expect( state ).toEqual( { [ 1 ]: { ids: [ 1 ], found: 1 } } );
	} );

	test( 'should remove an id and update total', () => {
		const initialState = deepFreeze( {
			[ 1 ]: { ids: [ 2, 6 ], found: 2 },
		} );
		const state = queries( initialState, {
			type: REMOVE_VIEWER_SUCCESS,
			siteId: 1,
			viewerId: 2,
		} );

		expect( state ).toEqual( {
			[ 1 ]: { ids: [ 6 ], found: 1 },
		} );
	} );
} );

describe( '#fetching', () => {
	test( 'should return `true` in case viewers are requested for a given site', () => {
		const siteId = 12345;
		const initialState = { [ siteId ]: false };
		const state = fetching( initialState, { type: VIEWERS_REQUEST, siteId } );

		expect( state[ siteId ] ).toBe( true );
	} );

	test( 'should return `false` in case viewers were requested successfully for a given site', () => {
		const siteId = 12345;
		const initialState = { [ siteId ]: true };
		const state = fetching( initialState, { type: VIEWERS_REQUEST_SUCCESS, siteId } );

		expect( state[ siteId ] ).toBe( false );
	} );

	test( 'should return `false` in case viewers were requested unsuccessfully for a given site', () => {
		const siteId = 12345;
		const initialState = { [ siteId ]: true };
		const state = fetching( initialState, { type: VIEWERS_REQUEST_FAILURE, siteId } );

		expect( state[ siteId ] ).toBe( false );
	} );

	test( 'should only affect status for a given site', () => {
		const siteId1 = 12345;
		const siteId2 = 54321;
		const initialState = {
			[ siteId1 ]: false,
			[ siteId2 ]: false,
		};
		const state = fetching( initialState, { type: VIEWERS_REQUEST, siteId: siteId1 } );

		expect( state[ siteId1 ] ).toBe( true );
		expect( state[ siteId2 ] ).toBe( false );
	} );
} );
