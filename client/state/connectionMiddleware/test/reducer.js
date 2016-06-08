/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	OFFLINE_QUEUE_ADD,
	OFFLINE_QUEUE_REMOVE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { actionQueue } from '../reducer';

describe( 'reducer', () => {
	describe( '#actionQueue()', () => {
		it( 'should default to empty array', () => {
			const state = actionQueue( undefined, false );
			expect( state ).to.eql( [] );
		} );
		it( 'add action to the queue and remove type property', () => {
			const state = actionQueue( [
				{ squash: false, id: 1, hash: 'a1', action: {} }
			],
				{ type: OFFLINE_QUEUE_ADD, squash: false, id: 2, hash: 'a2', action: {} }
			);
			expect( state ).to.deep.eql( [
				{ squash: false, id: 1, hash: 'a1', action: {} },
				{ squash: false, id: 2, hash: 'a2', action: {} }
			] );
		} );
		it( 'should add to the queue when squash=false and hash is equal', () => {
			const state = actionQueue( [
					{ squash: false, id: 1, hash: 'a1', action: {} }
			],
				{ type: OFFLINE_QUEUE_ADD, squash: false, id: 2, hash: 'a1', action: {} }
			);
			expect( state ).to.deep.eql( [
				{ squash: false, id: 1, hash: 'a1', action: {} },
				{ squash: false, id: 2, hash: 'a1', action: {} }
			] );
		} );
		it( 'should NOT add to the queue when squash=true and hash is equal', () => {
			const state = actionQueue( [
					{ squash: true, id: 1, hash: 'a1', action: {} }
			],
				{ type: OFFLINE_QUEUE_ADD, squash: true, id: 2, hash: 'a1', action: {} }
			);
			expect( state ).to.deep.eql( [
				{ squash: true, id: 1, hash: 'a1', action: {} }
			] );
		} );
		it( 'should add to the queue when squash=true and hash is different', () => {
			const state = actionQueue( [
					{ squash: true, id: 1, hash: 'a1', action: {} }
			],
				{ type: OFFLINE_QUEUE_ADD, squash: true, id: 2, hash: 'a2', action: {} }
			);
			expect( state ).to.deep.eql( [
				{ squash: true, id: 1, hash: 'a1', action: {} },
				{ squash: true, id: 2, hash: 'a2', action: {} }
			] );
		} );
		it( 'should remove only action with the matching id from the queue', () => {
			const original = [
				{ id: 1, hash: 'action 1', action: {} },
				{ id: 2, hash: 'action 2', action: {} },
				{ id: 3, hash: 'action 3', action: {} }
			];
			const state = actionQueue( original, {
				type: OFFLINE_QUEUE_REMOVE,
				id: 2
			} );
			expect( state ).to.deep.eql( [
				{ id: 1, hash: 'action 1', action: {} },
				{ id: 3, hash: 'action 3', action: {} }
			] );
		} );
		it( 'should persist state', () => {
			const state = actionQueue( [ { type: 'test action type' } ], {
				type: SERIALIZE
			} );
			expect( state ).to.eql( [ { type: 'test action type' } ] );
		} );
		it( 'should load persisted state', () => {
			const state = actionQueue( [ { type: 'test action type' } ], {
				type: DESERIALIZE
			} );
			expect( state ).to.eql( [ { type: 'test action type' } ] );
		} );
	} );
} );
