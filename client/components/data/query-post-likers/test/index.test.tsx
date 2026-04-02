/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useSelector } from 'calypso/state';
import posts from 'calypso/state/posts/reducer';
import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QueryPostLikers from '../index';

const siteId = 100;
const postId = 200;

const TestComponent = () => {
	const likes = useSelector( ( state ) => getPostLikes( state, siteId, postId ) );

	if ( ! likes ) {
		return <span>likes:loading</span>;
	}

	const firstId = likes?.[ 0 ]?.ID;
	return (
		<>
			<span>{ `likes:${ likes.length }` }</span>
			<span>{ `firstId:${ firstId ?? 'none' }` }</span>
		</>
	);
};

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( {
		queries: {
			retry: false,
		},
	} );
	return instance;
};

describe( 'QueryPostLikers', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fills the redux store with post likers data', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ siteId }/posts/${ postId }/likes` )
			.reply( 200, {
				found: 42,
				i_like: false,
				likes: [
					{
						ID: 1234,
						login: 'test1234',
						name: 'Test User',
						avatar_URL: 'https://example.com/avatar.png',
						site_ID: siteId,
						site_visible: true,
					},
				],
			} );

		renderWithProvider(
			<>
				<QueryPostLikers siteId={ siteId } postId={ postId } />
				<TestComponent />
			</>,
			{ queryClient: getQueryClient(), reducers: { posts } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'likes:1' ) ).toBeVisible();
			expect( screen.getByText( 'firstId:1234' ) ).toBeVisible();
		} );
	} );
} );
