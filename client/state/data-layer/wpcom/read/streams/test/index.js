import warn from '@wordpress/warning';
import deepfreeze from 'deep-freeze';
import { READER_STREAMS_PAGE_REQUEST } from 'calypso/state/reader/action-types';
import { requestPage } from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp' );
jest.mock( 'calypso/reader/stats', () => ( { recordTrack: () => {} } ) );
jest.mock( '@wordpress/warning', () => jest.fn() );

// `requestPage` in `state/reader/streams/actions` is a thunk; it dispatches the
// action below for migrated streams. Build the action shape directly here so
// these legacy data-layer tests don't depend on the thunk's runtime.
function makeAction( { streamKey, ...overrides } ) {
	const colon = streamKey.indexOf( ':' );
	const streamType = colon === -1 ? streamKey : streamKey.substring( 0, colon );
	return deepfreeze( {
		type: READER_STREAMS_PAGE_REQUEST,
		payload: {
			streamKey,
			streamType,
			pageHandle: undefined,
			isPoll: false,
			gap: null,
			localeSlug: null,
			feedId: undefined,
			...overrides,
		},
	} );
}

describe( 'streams', () => {
	describe( 'requestPage', () => {
		it.each( [
			'following',
			'discover:recommended',
			'discover:recommended--wordpress--blogging',
			'discover:latest',
			'discover:latest--wordpress',
			'discover:tags',
			'discover:dailyprompt',
			'discover:freshly-pressed',
			'recent',
			'recent:1234',
			'search:{"q":"foo","sort":"date"}',
			'feed:1234',
			'site:1234',
			'notifications',
			'featured:1234',
			'p2',
			'a8c',
			'tag:photography',
			'tag_popular:photography',
			'list:{"owner":"alice","slug":"favs"}',
			'on_this_day',
			'on_this_day:3:15',
			'user:42',
			'conversations',
			'conversations-a8c',
			'likes',
			'recommendations_posts',
			'custom_recs_posts_with_images',
			'custom_recs_sites_with_images',
		] )( 'returns undefined for migrated streamKey %s', ( streamKey ) => {
			expect( requestPage( makeAction( { streamKey } ) ) ).toBeUndefined();
		} );

		it( 'no-ops without warning for unsupported stream keys', () => {
			expect( requestPage( makeAction( { streamKey: 'unknown_stream' } ) ) ).toBeUndefined();
			expect( warn ).not.toHaveBeenCalled();
		} );
	} );
} );
