import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { action } from '../constants';
import store from '../lists';

var debug = require( 'debug' )( 'calypso:test' );

describe( 'Reader Lists Store', function() {
	it( 'picks up a list from a successful response', function() {
		const newList = {
			ID: 1,
			owner: 'restapitests',
			name: 'bananas'
		};

		Dispatcher.handleServerAction( {
			type: action.RECEIVE_READER_LIST,
			data: {
				list: newList
			}
		} );

		const lists = store.getLists();
		expect( lists.size ).to.eql( 1 );
		expect( lists.first().toJS() ).to.eql( newList );
	} );

	it( 'picks up multiple lists from a successful response', function() {
		const newLists = [
			{
				ID: 1,
				owner: 'restapitests',
				name: 'bananas'
			},
			{
				ID: 2,
				owner: 'restapitests',
				name: 'apples'
			}
		];

		Dispatcher.handleServerAction( {
			type: action.RECEIVE_READER_LISTS,
			data: {
				lists: newLists
			}
		} );

		const lists = store.getLists();
		expect( lists.size ).to.eql( 2 );
		expect( lists.first().toJS() ).to.eql( newLists[0] );
	} );

	it( 'creates a new list', function() {
		const newList = {
			ID: 4,
			owner: 'restapitests',
			name: 'feijoas'
		};

		Dispatcher.handleServerAction( {
			type: action.RECEIVE_CREATE_READER_LIST,
			data: {
				list: newList
			}
		} );

		const lists = store.getLists();
		expect( lists.last().toJS() ).to.eql( newList );
		expect( store.isUpdated( 4 ) ).to.eql( true );
	} );

	it( 'dismisses a notice about an updated list', function() {
		Dispatcher.handleViewAction( {
			type: action.DISMISS_READER_LIST_NOTICE,
			listId: 4
		} );

		expect( store.isUpdated( 4 ) ).to.eql( false );
	} );
} );
