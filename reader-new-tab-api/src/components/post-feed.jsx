import { PostItem } from './post-item';

export function PostFeed( { posts, title } ) {
	return (
		<div class="post-feed">
			<div class="post-feed__header">
				<h2 class="post-feed__title">{ title }</h2>
			</div>
			<div class="post-feed__list">
				{ posts.map( ( post ) => (
					<PostItem key={ post.ID || post.URL } post={ post } />
				) ) }
			</div>
		</div>
	);
}
