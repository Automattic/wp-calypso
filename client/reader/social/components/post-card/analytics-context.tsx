import { createContext, useContext, type ReactNode } from 'react';
import type { SocialPost } from '../../types';

// Tracks event-name contract for shared post-card subcomponents:
// emit `calypso_reader_<source>_timeline_*` regardless of the surface
// the card is rendered on. Per-protocol shells (e.g. ThreadPanel) wrap
// this provider and rewrite the `_timeline_` prefix to a surface-
// specific one (e.g. `_thread_`) inside their `onClick` handler. Keep
// hard-coded event names inside subcomponents on the `_timeline_`
// prefix so the rewrite stays the single source of truth.

export interface SocialProfileRefInput {
	// Universal protocol-agnostic identifier — DID for atmosphere, numeric
	// account id for Mastodon, canonical AP actor URL for Fediverse. Per-
	// protocol resolvers decide which they understand and which to validate.
	id?: string | null;
	// Atmosphere-named alias kept for back-compat with the slice-6 wiring.
	did?: string | null;
	// User-readable identifier. Across protocols: a bsky handle
	// (`alice.bsky.social`) for atmosphere, a webfinger handle
	// (`alice@example.com`) for Mastodon and Fediverse. Mention anchors
	// in post HTML can stamp `data-handle="<value>"` alongside `data-id`
	// (CM-725 wires this for Fediverse and Mastodon); the body / bio
	// click handlers read it and pass it here so per-protocol resolvers
	// can build a cleaner user-readable URL than they would from the
	// raw `data-id` (which carries actor URLs or numeric ids). When
	// `data-handle` is absent the handlers broadcast `data-id` to this
	// field as a back-compat fallback (atmosphere today).
	handle?: string | null;
}

export interface SocialAnalyticsContextValue {
	// Free-form protocol identifier slotted into Tracks event names as
	// `calypso_reader_<source>_*`. Per-protocol shells set their own value
	// (e.g. 'atmosphere', 'mastodon') — kept as a plain string so adding a
	// third protocol doesn't require editing this shared file.
	source: string;
	connectionId: number;
	onClick: ( event: string, props: Record< string, unknown > ) => void;
	// Optional URL resolver. Returning null (or omitting) signals the consumer to fall back to a public URL.
	getThreadUrl?: ( postUri: string ) => string | null;
	/** Slice 6: resolve an author ref to an in-app profile URL, or null to fall back. */
	getProfileUrl?: ( ref: SocialProfileRefInput ) => string | null;
	/**
	 * Slice 8: in-app hashtag-feed URL for a tag, or null to fall back.
	 * Mastodon panels bind this; protocols without a hashtag concept
	 * (atmosphere) leave it unset and `<PostCardBody>` falls back to the
	 * anchor's external href.
	 */
	getTagUrl?: ( tag: string ) => string | null;
	/**
	 * Slice 7c: open the reply composer for a post. When bound,
	 * `<PostCardCounts>` renders the replies count as a button that
	 * invokes this callback instead of routing to the in-app thread.
	 * Per-protocol shells without a composer leave it unset and the
	 * existing in-app-thread / external-thread fallback applies.
	 */
	onReplyClick?: ( post: SocialPost ) => void;
	/**
	 * Slice 7d: open the quote composer for a post. When bound,
	 * `<RepostButton>`'s "Quote post" menu item becomes active.
	 * Per-protocol shells without a quote concept leave it unset.
	 */
	onQuoteClick?: ( post: SocialPost ) => void;
	/**
	 * Slice 7d: DID of the user owning the active connection. When set and
	 * matching `post.author.did`, `<SocialPostCard>` renders the post-actions
	 * kebab in the header. Per-protocol shells set this to `connection.did`.
	 */
	ownerDid?: string;
}

const Ctx = createContext< SocialAnalyticsContextValue | null >( null );

export function SocialAnalyticsProvider( {
	value,
	children,
}: {
	value: SocialAnalyticsContextValue;
	children: ReactNode;
} ) {
	return <Ctx.Provider value={ value }>{ children }</Ctx.Provider>;
}

export function useSocialAnalytics(): SocialAnalyticsContextValue | null {
	return useContext( Ctx );
}
