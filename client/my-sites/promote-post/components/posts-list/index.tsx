import { translate } from 'i18n-calypso';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import EmptyContent from 'calypso/components/empty-content';
import usePromoteParams from 'calypso/data/promote-post/use-promote-params';
import PostItem, { Post } from 'calypso/my-sites/promote-post/components/post-item';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import './style.scss';

interface Props {
	content: Post[];
	isLoading: boolean;
}

export default function PostsList( { content, isLoading }: Props ) {
	const { isModalOpen, selectedSiteId, selectedPostId, keyValue } = usePromoteParams();
	const currentQuery = useSelector( getCurrentQueryArguments );
	const sourceQuery = currentQuery?.[ 'source' ];
	const source = sourceQuery ? sourceQuery.toString() : undefined;

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

			{ selectedSiteId && selectedPostId && keyValue && (
				<BlazePressWidget
					isVisible={ isModalOpen }
					siteId={ selectedSiteId }
					postId={ selectedPostId }
					keyValue={ keyValue }
					source={ source }
				/>
			) }
		</>
	);
}
