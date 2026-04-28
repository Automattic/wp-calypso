import { createContext, useContext, type ReactNode } from 'react';

export interface SocialAnalyticsContextValue {
	source: 'atmosphere' | 'mastodon';
	connectionId: number;
	onClick: ( event: string, props: Record< string, unknown > ) => void;
	// Optional per-protocol URL resolver. When set, post-card subcomponents
	// route in-app for the parent post / quoted post / reply parent. When
	// omitted (or returns null), they fall back to slice-4 bsky.app URLs.
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
