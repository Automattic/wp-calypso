/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { VIEWERS_REQUEST_SUCCESS } from '../../action-types';
import { items, queries } from '../reducer';

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
		const original = deepFreeze( { 3: { ID: 3, avatar_URL: 'url' } } );
		const state = items( original, {
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
		const original = deepFreeze( { 3: { ID: 3, avatar_URL: 'url' } } );
		const state = items( original, {
			type: VIEWERS_REQUEST_SUCCESS,
			data: {
				viewers: [ { ID: 3, avatar_URL: 'updated-url' } ],
			},
		} );
		expect( state ).toEqual( { 3: { ID: 3, avatar_URL: 'updated-url' } } );
	} );
} );

describe( '#queries', () => {
	test( 'should only store the follower ids, total, and last page for a query', () => {
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
	test( 'should create a separate closure for different queries', () => {
		const original = deepFreeze( {
			[ 1 ]: { ids: [ 1 ], found: 1 },
		} );
		const state = queries( original, {
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
		const original = deepFreeze( { [ 1 ]: { ids: [ 3 ] } } );
		const state = queries( original, {
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
		const original = deepFreeze( { [ 1 ]: { ids: [ 1 ] } } );
		const state = queries( original, {
			type: VIEWERS_REQUEST_SUCCESS,
			siteId: 1,
			data: {
				viewers: [ { ID: 1, avatar: 'url' } ],
				found: 1,
			},
		} );
		expect( state ).toEqual( { [ 1 ]: { ids: [ 1 ], found: 1 } } );
	} );
} );
