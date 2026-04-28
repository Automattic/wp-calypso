import { TimeSince } from '@automattic/components';

interface PostCardTimestampProps {
	post: { created_at: string; indexed_at: string };
}

// Renders the post's timestamp as an inert standalone block under the body
// (no anchor, no card-link plumbing). Used by SocialPostCard when
// prominentTimestamp is set — i.e. on the thread-view target post — so the
// layout matches bsky.app: header has author-only, timestamp lives between
// the body / embed and the counts row.
export function PostCardTimestamp( { post }: PostCardTimestampProps ) {
	const timestampIso = post.created_at || post.indexed_at;
	if ( ! timestampIso ) {
		return null;
	}
	return (
		<div className="social-post-card-timestamp">
			<TimeSince date={ timestampIso } dateFormat="lll" />
		</div>
	);
}
