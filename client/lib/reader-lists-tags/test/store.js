import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { action } from '../constants';
import store from '../store';

describe( 'store', function() {
	it( 'picks up tags from a successful response', function() {
		const listId = 1;
		const foundTag = {
			ID: 130330,
			slug: 'bananas',
			name: 'bananas'
		};
		const foundTagTwo = {
			ID: 130331,
			slug: 'feijoas',
			name: 'feijoas'
		};

		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_TAGS,
			data: {
				tags: [
					foundTag
				],
				list_ID: listId,
				number: 1,
				page: 1
			}
		} );

		let tagsForList = store.getTagsForList( listId ).toArray();
		expect( tagsForList ).to.have.length( 1 );
		expect( tagsForList[0].toJS() ).to.eql( foundTag );

		// Receive a second page
		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_TAGS,
			data: {
				tags: [
					foundTagTwo
				],
				list_ID: listId,
				number: 1,
				page: 2
			}
		} );

		tagsForList = store.getTagsForList( listId ).toArray();
		expect( tagsForList ).to.have.length( 2 );
		expect( tagsForList[1].toJS() ).to.eql( foundTagTwo );
	} );

	it( 'returns the current page for the specified list', function() {
		const listId = 1;

		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_TAGS,
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
