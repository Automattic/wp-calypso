/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useSelector } from 'calypso/state';
import posts from 'calypso/state/posts/reducer';
import { getPostLikeCount } from 'calypso/state/posts/selectors/get-post-like-count';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QueryPostLikes from '../index';

const siteId = 100;
const postId = 200;

const TestComponent = () => {
	const likeCount = useSelector( ( state ) => getPostLikeCount( state, siteId, postId ) );
	const iLike = useSelector( ( state ) => isLikedPost( state, siteId, postId ) );

	if ( likeCount === 0 && ! iLike ) {
		return null;
	}

	return (
		<>
			<span>{ `count:${ likeCount }` }</span>
			<span>{ `iLike:${ String( iLike ) }` }</span>
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

describe( 'QueryPostLikes', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fills the redux store with post likes data', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ siteId }/posts/${ postId }/likes` )
			.reply( 200, { found: 42, i_like: true, likes: [] } );

		renderWithProvider(
			<>
				<QueryPostLikes siteId={ siteId } postId={ postId } />
				<TestComponent />
			</>,
			{ queryClient: getQueryClient(), reducers: { posts } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'count:42' ) ).toBeVisible();
			expect( screen.getByText( 'iLike:true' ) ).toBeVisible();
		} );
	} );
} );
