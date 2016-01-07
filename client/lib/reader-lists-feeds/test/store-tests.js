import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { action } from '../constants';
import store from '../store';

describe( 'Reader Lists Feeds Store', function() {
	it( 'picks up tags from a successful response', function() {
		const listId = 1;
		const foundFeed = {
			feed_ID: 40474296,
			site_ID: null
		};
		const foundFeedTwo = {
			feed_ID: null,
			site_ID: 75823925
		};

		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_FEEDS,
			data: {
				feeds: [
					foundFeed
				],
				list_ID: listId,
				number: 1,
				page: 1
			}
		} );

		let feedsForList = store.getFeedsForList( listId ).toArray();
		expect( feedsForList ).to.have.length( 1 );
		expect( feedsForList[0].toJS() ).to.eql( foundFeed );

		// Receive a second page
		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_FEEDS,
			data: {
				feeds: [
					foundFeedTwo
				],
				list_ID: listId,
				number: 1,
				page: 2
			}
		} );

		feedsForList = store.getFeedsForList( listId ).toArray();
		expect( feedsForList ).to.have.length( 2 );
		expect( feedsForList[1].toJS() ).to.eql( foundFeedTwo );
	} );

	it( 'returns the current page for the specified list', function() {
		const listId = 1;

		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_FEEDS,
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
