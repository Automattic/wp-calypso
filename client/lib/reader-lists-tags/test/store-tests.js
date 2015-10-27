import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { ACTION_RECEIVE_READER_LIST_TAGS, ACTION_RECEIVE_READER_LIST_TAGS_ERROR } from '../constants';
import store from '../store';


describe( 'Reader Lists Tags Store', function() {
	it.skip( 'picks up tags from a successful response', function() {
		const listId = 1;
		const foundTag = {
			ID: 130330,
			slug: 'bananas',
			name: 'bananas'
		};

		Dispatcher.handleServerAction( {
			type: ACTION_RECEIVE_READER_LIST_TAGS,
			data: {
				tags: [
					foundTag
				]
			}
		} );

		expect( store.get( listId ) ).to.have.length( 1 );
		expect( store.get( listId )[0] ).to.eql( foundTag );
	} );
} );
