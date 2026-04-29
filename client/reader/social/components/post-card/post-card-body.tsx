import page from '@automattic/calypso-router';
import { useSocialAnalytics } from './analytics-context';
import { sanitizePostHtml } from './sanitize-post-html';
import type { SocialPost } from '../../types';
import type { MouseEvent } from 'react';

interface PostCardBodyProps {
	post: SocialPost;
}

export function PostCardBody( { post }: PostCardBodyProps ) {
	const analytics = useSocialAnalytics();

	if ( ! post.html ) {
		return <p className="social-post-card-body">{ post.text }</p>;
	}
	// DOMPurify-sanitised via sanitizePostHtml; see sanitize-post-html.ts.
	// The backend already wp_kses-sanitises post.html with the same
	// allow-list, so this is defence-in-depth, not the only line of defence.
	const __html = sanitizePostHtml( post.html );

	// Backend stamps @-mention anchors with `data-id="<author-id>"` (numeric
	// account id for Mastodon, DID for atmosphere). When present, route the
	// click in-app via the analytics context's `getProfileUrl` resolver.
	// Modifier-clicks (cmd/ctrl/middle/shift/alt) pass through so users can
	// open mentions in a new tab. Anchors without `data-id` keep their
	// default external navigation.
	const handleClick = ( event: MouseEvent< HTMLDivElement > ) => {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		const anchor = ( event.target as Element | null )?.closest( 'a' );
		if ( ! anchor ) {
			return;
		}
		const dataId = anchor.getAttribute( 'data-id' );
		if ( ! dataId ) {
			return;
		}
		const inAppUrl = analytics?.getProfileUrl?.( { id: dataId, did: dataId } ) ?? null;
		if ( inAppUrl ) {
			event.preventDefault();
			page( inAppUrl );
		}
	};

	// onClick on the wrapper div is event delegation onto the real <a>
	// children produced by dangerouslySetInnerHTML — anchors handle
	// keyboard activation themselves, so the div isn't actually interactive.
	/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
	return (
		<div
			className="social-post-card-body"
			onClick={ handleClick }
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={ { __html } }
		/>
	);
	/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
}
