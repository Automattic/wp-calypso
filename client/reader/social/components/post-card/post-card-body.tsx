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
		const dataHandle = anchor.getAttribute( 'data-handle' );
		if ( dataId || dataHandle ) {
			// Per-protocol resolvers pick whichever field they understand and
			// validate. Atmosphere validates handle then DID; Mastodon reads
			// `id`; Fediverse (CM-725) prefers the user-readable webfinger from
			// `data-handle` over the canonical AP actor URL in `data-id`. The
			// backend stamps either a DID (atmosphere), a numeric account id
			// (Mastodon), or an AP actor URL + webfinger pair (Fediverse).
			// When `data-handle` is absent (atmosphere / Mastodon), broadcast
			// `data-id` to the handle slot so the existing resolver fallback
			// keeps working.
			const inAppUrl =
				analytics?.getProfileUrl?.( {
					id: dataId,
					handle: dataHandle ?? dataId,
					did: dataId,
				} ) ?? null;
			if ( inAppUrl ) {
				event.preventDefault();
				page( inAppUrl );
				return;
			}
			if ( ! analytics ) {
				return;
			}
			// data-id / data-handle present but resolver returned null — likely
			// a backend ↔ frontend desync (validator rejected a shape we didn't
			// anticipate, or the protocol shell forgot to bind getProfileUrl).
			// Surface so it's observable instead of silently routing to the
			// external host with no analytics signal.
			// eslint-disable-next-line no-console
			console.warn( '[reader-social] mention anchor not resolved to in-app URL', {
				dataId,
				dataHandle,
				href: anchor.getAttribute( 'href' ),
				source: analytics.source,
			} );
			analytics.onClick( `calypso_reader_${ analytics.source }_timeline_mention_unresolved`, {
				connection_id: analytics.connectionId,
				data_id: dataId,
				data_handle: dataHandle,
			} );
			return;
		}
		const dataTag = anchor.getAttribute( 'data-tag' );
		if ( dataTag ) {
			const inAppTagUrl = analytics?.getTagUrl?.( dataTag ) ?? null;
			if ( inAppTagUrl ) {
				event.preventDefault();
				page( inAppTagUrl );
				return;
			}
			if ( ! analytics ) {
				return;
			}
			// data-tag present but resolver returned null — backend ↔ frontend desync.
			// Same observability pattern as the data-id miss path.
			// eslint-disable-next-line no-console
			console.warn( '[reader-social] data-tag anchor not resolved to in-app URL', {
				dataTag,
				href: anchor.getAttribute( 'href' ),
				source: analytics.source,
			} );
			analytics.onClick( `calypso_reader_${ analytics.source }_timeline_tag_unresolved`, {
				connection_id: analytics.connectionId,
				data_tag: dataTag,
			} );
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
