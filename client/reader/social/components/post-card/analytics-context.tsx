import { createContext, useContext, type ReactNode } from 'react';

export interface SocialAnalyticsContextValue {
	source: 'atmosphere' | 'mastodon';
	connectionId: number;
	onClick: ( event: string, props: Record< string, unknown > ) => void;
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
