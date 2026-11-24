import { vi } from 'vitest';
import { getPostsForQuery } from 'calypso/state/posts/selectors';
import getChecklistTaskUrls from 'calypso/state/selectors/get-checklist-task-urls';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';

vi.mock( 'calypso/state/posts/selectors', () => ( { getPostsForQuery: vi.fn() } ) );
vi.mock( 'calypso/state/selectors/get-editor-url', () => ( { default: vi.fn() } ) );
vi.mock( 'calypso/state/selectors/get-front-page-editor-url', () => ( { default: vi.fn( () => null ) } ) );
vi.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteUrl: vi.fn( () => 'https://example.com' ),
} ) );

describe( 'getChecklistTaskUrls()', () => {
	beforeEach( () => {
		vi.clearAllMocks();
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
