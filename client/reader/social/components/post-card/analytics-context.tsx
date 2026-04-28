import { createContext, useContext, type ReactNode } from 'react';

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
