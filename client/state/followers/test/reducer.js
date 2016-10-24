/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	FOLLOWERS_RECEIVE,
	FOLLOWER_REMOVE_SUCCESS
} from 'state/action-types';
import {
	items,
	queries
} from '../reducer';
import { getSerializedQuery } from 'state/followers/utils';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should key followers by id', () => {
			const state = items( null, {
				type: FOLLOWERS_RECEIVE,
				data: {
					subscribers: [
						{ ID: 1, avatar: 'url' },
						{ ID: 2, avatar: 'url' }
					]
				}
			} );
			expect( state ).to.eql( { 1: { ID: 1, avatar: 'url', avatar_URL: 'url' }, 2: { ID: 2, avatar: 'url', avatar_URL: 'url' } } );
		} );
		it( 'should accumulate followers', () => {
			const original = deepFreeze( { 3: { ID: 3, avatar: 'url', avatar_URL: 'url' } } );
			const state = items( original, {
				type: FOLLOWERS_RECEIVE,
				data: {
					subscribers: [ { ID: 4, avatar: 'url' } ]
				}
			} );
			expect( state ).to.eql( { 3: { ID: 3, avatar: 'url', avatar_URL: 'url' }, 4: { ID: 4, avatar: 'url', avatar_URL: 'url' } } );
		} );
		it( 'should overwrite an existing follower in the state with new data from the API', () => {
			const original = deepFreeze( { 3: { ID: 3, avatar: 'url', avatar_URL: 'url' } } );
			const state = items( original, {
				type: FOLLOWERS_RECEIVE,
				data: {
					subscribers: [ { ID: 3, avatar: 'updated-url' } ]
				}
			} );
			expect( state ).to.eql( { 3: { ID: 3, avatar: 'updated-url', avatar_URL: 'updated-url' } } );
		} );
		it( 'should remove a follower from the state', () => {
			const original = deepFreeze( {
				3: { ID: 3, avatar: 'url', avatar_URL: 'url' },
				4: { ID: 4, avatar: 'url', avatar_URL: 'url' }
			} );
			const state = items( original, {
				type: FOLLOWER_REMOVE_SUCCESS,
				follower: { ID: 4 }
			} );
			expect( state ).to.eql( { 3: { ID: 3, avatar: 'url', avatar_URL: 'url' } } );
		} );
	} );
	describe( '#queries()', () => {
		it( 'should only store the follower ids, total, and last page for a query', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const state = queries( undefined, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: {
					subscribers: [ { ID: 1, avatar: 'url' }, { ID: 2, avatar: 'url' } ],
					total: 1,
					pages: 1
				}
			} );
			expect( state ).to.eql( { [ serializedQuery ]: { ids: [ 1, 2 ], total: 1, lastPage: 1 } } );
		} );
		it( 'should create a separate closure for different queries', () => {
			const query1 = { siteId: 1 };
			const query2 = { siteId: 2 };
			const serializedQuery1 = getSerializedQuery( query1 );
			const serializedQuery2 = getSerializedQuery( query2 );
			const original = deepFreeze( { [ serializedQuery1 ]: { ids: [ 1 ], total: 1, lastPage: 1 } } );
			const state = queries( original, {
				type: FOLLOWERS_RECEIVE,
				query: query2,
				data: {
					subscribers: [ { ID: 1, avatar: 'url' } ],
					total: 1,
					pages: 1
				}
			} );
			expect( state ).to.eql( {
				[ serializedQuery1 ]: { ids: [ 1 ], total: 1, lastPage: 1 },
				[ serializedQuery2 ]: { ids: [ 1 ], total: 1, lastPage: 1 }
			} );
		} );
		it( 'should accumulate follower ids and update total for identical queries', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const original = deepFreeze( { [ serializedQuery ]: { ids: [ 3 ], total: 1, lastPage: 1 } } );
			const state = queries( original, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: {
					subscribers: [ { ID: 4, avatar: 'url' } ],
					total: 2,
					pages: 1
				}
			} );
			expect( state ).to.eql( { [ serializedQuery ]: { ids: [ 3, 4 ], total: 2, lastPage: 1 } } );
		} );
		it( 'should not repeat ids within the same query', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const original = deepFreeze( { [ serializedQuery ]: { ids: [ 1 ], total: 1, lastPage: 1 } } );
			const state = queries( original, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: {
					subscribers: [ { ID: 1, avatar: 'url' } ],
					total: 1,
					pages: 1
				}
			} );
			expect( state ).to.eql( { [ serializedQuery ]: { ids: [ 1 ], total: 1, lastPage: 1 } } );
		} );
		it( 'should remove an id and update totals for all queries', () => {
			const query1 = { siteId: 1 };
			const query2 = { siteId: 2 };
			const serializedQuery1 = getSerializedQuery( query1 );
			const serializedQuery2 = getSerializedQuery( query2 );
			const original = deepFreeze( {
				[ serializedQuery1 ]: { ids: [ 1, 2, 3 ], total: 101, lastPage: 2 },
				[ serializedQuery2 ]: { ids: [ 2, 6 ], total: 2, lastPage: 1 }
			} );
			const state = queries( original, {
				type: FOLLOWER_REMOVE_SUCCESS,
				follower: { ID: 2 }
			} );
			expect( state ).to.eql( {
				[ serializedQuery1 ]: { ids: [ 1, 3 ], total: 100, lastPage: 1 },
				[ serializedQuery2 ]: { ids: [ 6 ], total: 1, lastPage: 1 }
			} );
		} );
	} );
} );
