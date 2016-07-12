/**
 * External dependencies
 */
import { expect } from 'chai';
import head from 'lodash/head';
import last from 'lodash/last';
import tail from 'lodash/tail';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import Dispatcher from 'dispatcher';
import { STORED_CARDS_FROM_API, STORED_CARDS } from './data';
import StoredCardsStore from './../store';

describe( 'store', () => {
	it( 'should be an object', () => {
		expect( StoredCardsStore ).to.be.an( 'object' );
	} );

	it( 'should return an object with the initial state', () => {
		expect( StoredCardsStore.get() ).to.be.eql( {
			isFetching: false,
			list: []
		} );
	} );

	it( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.STORED_CARDS_FETCH
		} );

		expect( StoredCardsStore.get() ).to.be.eql( {
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
			isFetching: false,
			list: STORED_CARDS
		} );
	} );
} );
