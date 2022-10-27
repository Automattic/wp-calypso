import { translate } from 'i18n-calypso';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import EmptyContent from 'calypso/components/empty-content';
import PostItem, { Post } from 'calypso/my-sites/promote-post/components/post-item';
import './style.scss';

interface Props {
	content: Post[];
	isLoading: boolean;
}

export default function PostsList( { content, isLoading }: Props ) {
	const isEmpty = ! content || ! content.length;
	return (
		<>
			{ isLoading && (
				<div className="posts-list__loading-container">
					<SitePlaceholder />
				</div>
			) }
			{ ! isLoading && isEmpty && (
				<EmptyContent
					className="promote-post__empty-content"
					title={ translate( 'You have no posts or pages.' ) }
					line={ translate(
						"Start by creating a post or a page and start promoting it once it's ready"
					) }
					illustration={ null }
				/>
			) }
			{ ! isLoading && ! isEmpty && (
				<>
					{ content.map( function ( post: Post ) {
						return <PostItem key={ post.ID } post={ post } />;
					} ) }
				</>
			) }
		</>
	);
}
