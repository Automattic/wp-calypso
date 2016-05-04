/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	FOLLOWERS_RECEIVE
} from 'state/action-types';
import {
	items,
	queries,
	queriesLastPage,
	queriesTotal
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
	} );
	describe( '#queries()', () => {
		it( 'should only store the follower ids for a query', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const state = queries( undefined, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: {
					subscribers: [ { ID: 1, avatar: 'url' }, { ID: 2, avatar: 'url' } ]
				}
			} );
			expect( state ).to.eql( { [ serializedQuery ]: [ 1, 2 ] } );
		} );
		it( 'should create a separate closure for different queries', () => {
			const query1 = { siteId: 1 };
			const query2 = { siteId: 2 };
			const serializedQuery1 = getSerializedQuery( query1 );
			const serializedQuery2 = getSerializedQuery( query2 );
			const original = deepFreeze( { [ serializedQuery1 ]: [ 1 ] } );
			const state = queries( original, {
				type: FOLLOWERS_RECEIVE,
				query: query2,
				data: {
					subscribers: [ { ID: 1, avatar: 'url' } ]
				}
			} );
			expect( state ).to.eql( { [ serializedQuery1 ]: [ 1 ], [ serializedQuery2 ]: [ 1 ] } );
		} );
		it( 'should accumulate follower ids for identical queries', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const original = deepFreeze( { [ serializedQuery ]: [ 3 ] } );
			const state = queries( original, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: {
					subscribers: [ { ID: 4, avatar: 'url' } ]
				}
			} );
			expect( state ).to.eql( { [ serializedQuery ]: [ 3, 4 ] } );
		} );
		it( 'should not repeat ids within the same query', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const original = deepFreeze( { [ serializedQuery ]: [ 1 ] } );
			const state = queries( original, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: {
					subscribers: [ { ID: 1, avatar: 'url' } ]
				}
			} );
			expect( state ).to.eql( { [ serializedQuery ]: [ 1 ] } );
		} );
	} );
	describe( '#queriesLastPage()', () => {
		it( 'should store the last page when a query is complete', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const state = queriesLastPage( undefined, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: { pages: 5 }
			} );
			expect( state ).to.eql( { [ serializedQuery ]: 5 } );
		} );
	} );
	describe( '#queriesTotal()', () => {
		it( 'should store the total number of followers when a query is complete', () => {
			const query = { siteId: 1 };
			const serializedQuery = getSerializedQuery( query );
			const state = queriesTotal( undefined, {
				type: FOLLOWERS_RECEIVE,
				query: query,
				data: { total: 500 }
			} );
			expect( state ).to.eql( { [ serializedQuery ]: 500 } );
		} );
	} );
} );
