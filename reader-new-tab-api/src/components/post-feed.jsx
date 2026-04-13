import { PostItem } from './post-item';

export function PostFeed( { posts } ) {
	return (
		<div class="post-feed">
			<div class="post-feed__header">
				<h2 class="post-feed__title">Recent</h2>
				<p class="post-feed__subtitle">Latest from your subscriptions.</p>
			</div>
			<div class="post-feed__list">
				{ posts.map( ( post ) => (
					<PostItem key={ post.ID || post.URL } post={ post } />
				) ) }
			</div>
		</div>
	);
}
