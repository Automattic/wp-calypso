import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { action } from '../constants';
import store from '../store';

describe( 'Reader Lists Tags Store', function() {
	it( 'picks up tags from a successful response', function() {
		const listId = 1;
		const foundTag = {
			ID: 130330,
			slug: 'bananas',
			name: 'bananas'
		};

		Dispatcher.handleServerAction( {
			type: action.ACTION_RECEIVE_READER_LIST_TAGS,
			data: {
				tags: [
					foundTag
				],
				list_ID: listId
			}
		} );

		expect( store.getTagsForList( listId ) ).to.have.length( 1 );
		expect( store.getTagsForList( listId )[0] ).to.eql( foundTag );
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
