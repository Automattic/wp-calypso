import { getPostsForQuery } from 'calypso/state/posts/selectors';
import getChecklistTaskUrls from 'calypso/state/selectors/get-checklist-task-urls';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';

jest.mock( 'calypso/state/posts/selectors', () => ( { getPostsForQuery: jest.fn() } ) );
jest.mock( 'calypso/state/selectors/get-editor-url', () => jest.fn() );
jest.mock( 'calypso/state/selectors/get-front-page-editor-url', () => jest.fn( () => null ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteUrl: jest.fn( () => 'https://example.com' ),
} ) );

describe( 'getChecklistTaskUrls()', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		getEditorUrl.mockImplementation(
			( state, siteId, postId ) => `/editor/${ siteId }/${ postId }`
		);
	} );

	test( 'sets post_published to the editor URL of the first published post', () => {
		getPostsForQuery.mockReturnValue( [
			{ ID: 1, type: 'page' },
			{ ID: 42, type: 'post' },
			{ ID: 43, type: 'post' },
		] );

		expect( getChecklistTaskUrls( {}, 9 ).post_published ).toBe( '/editor/9/42' );
	} );

	test( 'leaves post_published null when there is no published post', () => {
		getPostsForQuery.mockReturnValue( [ { ID: 1, type: 'page' } ] );

		expect( getChecklistTaskUrls( {}, 10 ).post_published ).toBe( null );
	} );
} );
