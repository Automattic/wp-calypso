import { createContext, useContext, type ReactNode } from 'react';

// Tracks event-name contract for shared post-card subcomponents:
// emit `calypso_reader_<source>_timeline_*` regardless of the surface
// the card is rendered on. Per-protocol shells (e.g. ThreadPanel) wrap
// this provider and rewrite the `_timeline_` prefix to a surface-
// specific one (e.g. `_thread_`) inside their `onClick` handler. Keep
// hard-coded event names inside subcomponents on the `_timeline_`
// prefix so the rewrite stays the single source of truth.
export interface SocialAnalyticsContextValue {
	source: 'atmosphere' | 'mastodon';
	connectionId: number;
	onClick: ( event: string, props: Record< string, unknown > ) => void;
	// Optional URL resolver. Returning null (or omitting) signals the consumer to fall back to a public URL.
	getThreadUrl?: ( postUri: string ) => string | null;
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
