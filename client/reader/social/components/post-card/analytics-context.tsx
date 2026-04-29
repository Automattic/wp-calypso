import { createContext, useContext, type ReactNode } from 'react';

// Tracks event-name contract for shared post-card subcomponents:
// emit `calypso_reader_<source>_timeline_*` regardless of the surface
// the card is rendered on. Per-protocol shells (e.g. ThreadPanel) wrap
// this provider and rewrite the `_timeline_` prefix to a surface-
// specific one (e.g. `_thread_`) inside their `onClick` handler. Keep
// hard-coded event names inside subcomponents on the `_timeline_`
// prefix so the rewrite stays the single source of truth.

export interface SocialProfileRefInput {
	// Universal protocol-agnostic identifier — DID for atmosphere, numeric
	// account id for Mastodon. Per-protocol resolvers decide which they
	// understand and which to validate.
	id?: string | null;
	// Atmosphere-named alias kept for back-compat with the slice-6 wiring.
	did?: string | null;
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
