import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import {
	STORED_CARDS_ADD_COMPLETED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
	STORED_CARDS_UPDATE_IS_BACKUP_COMPLETED,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import reducer, { items } from '../reducer';
import { STORED_CARDS_FROM_API, SELECTED_STORED_CARDS } from './fixture';

describe( 'items', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should return an object with the initial state', () => {
		expect( reducer( undefined, { type: 'UNRELATED' } ) ).to.be.eql( {
			items: [],
			isFetching: false,
			isDeleting: {},
			hasLoadedFromServer: false,
		} );
	} );

	test( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		expect( reducer( undefined, { type: STORED_CARDS_FETCH } ) ).to.be.eql( {
			items: [],
			isFetching: true,
			isDeleting: {},
			hasLoadedFromServer: false,
		} );
	} );

	test( 'should return an object with the list of stored cards when fetching completed', () => {
		const state = reducer( undefined, {
			type: STORED_CARDS_FETCH_COMPLETED,
			list: STORED_CARDS_FROM_API,
		} );

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: {},
			hasLoadedFromServer: true,
		} );
	} );

	test( 'should return an object with an empty list of stored cards when fetching failed', () => {
		const state = reducer( undefined, {
			type: STORED_CARDS_FETCH_FAILED,
		} );

		expect( state ).to.be.eql( {
			items: [],
			isFetching: false,
			isDeleting: {},
			hasLoadedFromServer: false,
		} );
	} );

	test( 'should add a stored card to the list if the stored card add request succeeded', () => {
		const state = reducer(
			deepFreeze( {
				items: STORED_CARDS_FROM_API.slice( 0, 3 ),
				isFetching: false,
				hasLoadedFromServer: true,
			} ),
			{
				type: STORED_CARDS_ADD_COMPLETED,
				item: STORED_CARDS_FROM_API[ 3 ],
			}
		);

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: {},
			hasLoadedFromServer: true,
		} );
	} );

	test( 'should keep the current state and enable isDeleting when requesting a stored card deletion', () => {
		const state = reducer(
			deepFreeze( {
				items: STORED_CARDS_FROM_API,
				isFetching: false,
				isDeleting: {},
				hasLoadedFromServer: true,
			} ),
			{
				type: STORED_CARDS_DELETE,
				card: STORED_CARDS_FROM_API[ 0 ],
			}
		);

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: { 1234567: true },
			hasLoadedFromServer: true,
		} );
	} );

	test( 'should remove a stored card from the list if the stored card deletion request succeeded', () => {
		const state = reducer(
			deepFreeze( {
				items: STORED_CARDS_FROM_API,
				isFetching: false,
				isDeleting: true,
				hasLoadedFromServer: true,
			} ),
			{
				type: STORED_CARDS_DELETE_COMPLETED,
				card: SELECTED_STORED_CARDS[ 0 ],
			}
		);

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API.slice( 1, 4 ),
			isFetching: false,
			isDeleting: {},
			hasLoadedFromServer: true,
		} );
	} );

	test( 'should not change the list of items if the stored card deletion request failed', () => {
		const state = reducer(
			deepFreeze( {
				items: STORED_CARDS_FROM_API,
				isFetching: false,
				isDeleting: { 1234567: true },
				hasLoadedFromServer: true,
			} ),
			{
				type: STORED_CARDS_DELETE_FAILED,
				card: STORED_CARDS_FROM_API[ 0 ],
			}
		);

		expect( state ).to.be.eql( {
			items: STORED_CARDS_FROM_API,
			isFetching: false,
			isDeleting: {},
			hasLoadedFromServer: true,
		} );
	} );

	test( 'should modify the stored card is_backup property correctly when is_backup is enabled', () => {
		const state = reducer(
			deepFreeze( {
				items: STORED_CARDS_FROM_API,
				isFetching: false,
				hasLoadedFromServer: true,
			} ),
			{
				type: STORED_CARDS_UPDATE_IS_BACKUP_COMPLETED,
				stored_details_id: STORED_CARDS_FROM_API[ 0 ].stored_details_id,
				is_backup: 'yes',
			}
		);

		expect(
			state.items[ 0 ].meta.find( ( meta ) => meta.meta_key === 'is_backup' ).meta_value
		).to.be.eql( 'yes' );
	} );

	test( 'should modify the stored card is_backup property correctly when is_backup is disabled', () => {
		const state = reducer(
			deepFreeze( {
				items: STORED_CARDS_FROM_API,
				isFetching: false,
				hasLoadedFromServer: true,
			} ),
			{
				type: STORED_CARDS_UPDATE_IS_BACKUP_COMPLETED,
				stored_details_id: STORED_CARDS_FROM_API[ 0 ].stored_details_id,
				is_backup: false,
			}
		);

		expect(
			state.items[ 0 ].meta.find( ( meta ) => meta.meta_key === 'is_backup' ).meta_value
		).to.be.eql( null );
	} );

	describe( 'persistence', () => {
		test( 'should persist state', () => {
			const originalState = deepFreeze( STORED_CARDS_FROM_API );

			const state = serialize( items, originalState );

			expect( state ).to.eql( originalState );
		} );

		test( 'should load valid persisted state', () => {
			const originalState = deepFreeze( STORED_CARDS_FROM_API );

			const state = deserialize( items, originalState );

			expect( state ).to.eql( originalState );
		} );

		test( 'should load default state when schema does not match', () => {
			const originalState = deepFreeze( [
				{
					card_type: 'amex',
					payment_partner: 'moneypress',
					email: 1234,
				},
			] );

			const state = deserialize( items, originalState );

			expect( state ).to.eql( [] );
		} );
	} );
} );
