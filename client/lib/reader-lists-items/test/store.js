import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { action } from '../constants';
import store from '../store';

describe( 'store', function() {
	it( 'picks up items from a successful response', function() {
		const listId = 1;
		const foundItem = {
			feed_ID: 40474296,
			site_ID: null
		};
		const foundItemTwo = {
			feed_ID: null,
			site_ID: 75823925
		};

		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_ITEMS,
			data: {
				items: [
					foundItem
				],
				list_ID: listId,
				number: 1,
				page: 1
			}
		} );

		let itemsForList = store.getItemsForList( listId ).toArray();
		expect( itemsForList ).to.have.length( 1 );
		expect( itemsForList[0].toJS() ).to.eql( foundItem );

		// Rreceive a second page
		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_ITEMS,
			data: {
				items: [
					foundItemTwo
				],
				list_ID: listId,
				number: 1,
				page: 2
			}
		} );

		itemsForList = store.getItemsForList( listId ).toArray();
		expect( itemsForList ).to.have.length( 2 );
		expect( itemsForList[1].toJS() ).to.eql( foundItemTwo );
	} );

	it( 'returns the current page for the specified list', function() {
		const listId = 1;

		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_ITEMS,
			data: {
				tags: [],
				number: 0,
				list_ID: listId,
				page: 7
			}
		} );

		expect( store.getCurrentPage( listId ) ).to.eql( 7 );
		expect( store.isLastPage( listId ) ).to.eql( true );
	} );
} );
