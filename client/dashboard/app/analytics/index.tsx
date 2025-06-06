import { createContext, useContext } from 'react';

export type AnalyticsClient = {
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	recordPageView: ( url: string, title: string ) => void;
};

const AnalyticsContext = createContext< AnalyticsClient >( {
	recordTracksEvent() {},
	recordPageView() {},
} );

interface AnalyticsProviderProps {
	children: React.ReactNode;
	client: AnalyticsClient;
}

export function AnalyticsProvider( { children, client }: AnalyticsProviderProps ) {
	return <AnalyticsContext.Provider value={ client }>{ children }</AnalyticsContext.Provider>;
}

export function useAnalytics() {
	return useContext( AnalyticsContext );
}
