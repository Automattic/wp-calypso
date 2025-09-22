import config from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
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

export function bumpStat( group: string, name: string ) {
	if ( typeof window === 'undefined' || ! config( 'mc_analytics_enabled' ) ) {
		return;
	}

	const url = addQueryArgs( document.location.protocol + '//pixel.wp.com/g.gif', {
		v: 'wpcom-no-pv',
		[ `x_${ group }` ]: name,
		t: Math.random().toString(),
	} );

	new window.Image().src = url;
}
