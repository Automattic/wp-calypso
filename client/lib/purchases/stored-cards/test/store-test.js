/**
 * External dependencies
 */
import { expect } from 'chai';
import first from 'lodash/array/first';
import last from 'lodash/array/last';
import rest from 'lodash/array/rest';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import Dispatcher from 'dispatcher';
import { STORED_CARDS_FROM_API, STORED_CARDS } from './constants';
import StoredCardsStore from './../store';

describe( 'Stored Cards Store', () => {
	it( 'should be an object', () => {
		expect( StoredCardsStore ).to.be.an( 'object' );
	} );

	it( 'should return an object with the initial state', () => {
		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: false,
			list: []
		} );
	} );

	it( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_FETCH
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: true,
			list: []
		} );
	} );

	it( 'should return an object with the previous list of cards and fetching disabled when fetching failed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_FETCH_FAILED,
			error: 'Unable to fetch stored cards'
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: false,
			list: []
		} );
	} );

	it( 'should return an object with a list of cards and fetching disabled when fetching completed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_FETCH_COMPLETED,
			list: STORED_CARDS_FROM_API
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: false,
			list: STORED_CARDS
		} );
	} );

	it( 'should return an object with a card for a specific id', () => {
		expect( StoredCardsStore.getByCardId( 12345 ).data ).to.be.eql( {
			id: 12345,
			expiry: '2016-11-30',
			number: 2596,
			type: 'amex',
			name: 'Jane Doe'
		} );
	} );

	it( 'should return an object with the previous list of cards and fetching disabled when fetching failed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_FETCH_FAILED,
			error: 'Unable to fetch stored cards'
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: false,
			list: STORED_CARDS
		} );
	} );

	it( 'should return an object with the previous list of cards and deleting enabled when deleting is triggered', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_DELETE,
			card: first( STORED_CARDS )
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: true,
			isFetching: false,
			list: STORED_CARDS
		} );
	} );

	it( 'should return an object with the previous list of cards and deleting disabled when deleting failed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_DELETE_FAILED,
			card: first( STORED_CARDS )
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: false,
			list: STORED_CARDS
		} );
	} );

	it( 'should return an object with a new list of cards and deleting disabled when deleting completed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_DELETE_COMPLETED,
			card: first( STORED_CARDS )
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: false,
			list: rest( STORED_CARDS )
		} );
	} );

	it( 'should return an object with an empty list of cards and deleting disabled when deleting completed', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_DELETE_COMPLETED,
			card: last( STORED_CARDS )
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
			isDeleting: false,
			isFetching: false,
			list: []
		} );
	} );
} );
