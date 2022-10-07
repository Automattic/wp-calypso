import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import PostItem, { Post } from 'calypso/my-sites/promote-post/components/post-item';
import './style.scss';
import { getPostsForQuery, isRequestingPostsForQuery } from 'calypso/state/posts/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function PostsList() {
	// todo use for searching
	const query = {
		// author,
		// category,
		number: 20, // max supported by /me/posts endpoint for all-sites mode
		status: 'publish', // do not allow private or unpublished posts
		// order: 'DESC',
		// search: 'world',
		// site_visibility: ! siteId ? 'visible' : undefined,
		// tag,
		// type: 'post',
	};

	const selectedSiteId = useSelector( getSelectedSiteId );
	const posts = useSelector( ( state ) => {
		const posts = getPostsForQuery( state, selectedSiteId, query );
		return posts?.filter( ( post: any ) => ! post.password );
	} );
	const isLoading = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, query )
	);

	const isEmpty = ! posts || ! posts.length;
	return (
		<>
			<QueryPosts siteId={ selectedSiteId } query={ query } postId={ null } />
			{ isLoading && (
				<div className="posts-list__loading-container">
					<LoadingEllipsis />
				</div>
			) }
			{ ! isLoading && isEmpty && (
				<EmptyContent
					title={ translate( 'No promoted posts' ) }
					line={ 'attributes.line' }
					action={ 'attributes.action' }
					actionURL={ 'attributes.actionURL' }
					// actionHoverCallback={ preloadEditor }
					illustration={ megaphoneIllustration }
					illustrationWidth={ 150 }
				/>
			) }
			{ ! isLoading && ! isEmpty && (
				<>
					{ posts.map( function ( post: Post ) {
						return <PostItem key={ post.ID } post={ post } />;
					} ) }
				</>
			) }
		</>
	);
}
