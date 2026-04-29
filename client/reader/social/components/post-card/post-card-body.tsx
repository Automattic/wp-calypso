import { sanitizePostHtml } from './sanitize-post-html';
import type { AtmosphereFeedItem } from '@automattic/api-core';

interface PostCardBodyProps {
	post: AtmosphereFeedItem;
}

export function PostCardBody( { post }: PostCardBodyProps ) {
	if ( ! post.html ) {
		return <p className="social-post-card-body">{ post.text }</p>;
	}
	// DOMPurify-sanitised via sanitizePostHtml; see sanitize-post-html.ts.
	// The backend already wp_kses-sanitises post.html with the same
	// allow-list, so this is defence-in-depth, not the only line of defence.
	const __html = sanitizePostHtml( post.html );
	return (
		<div
			className="social-post-card-body"
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={ { __html } }
		/>
	);
}
