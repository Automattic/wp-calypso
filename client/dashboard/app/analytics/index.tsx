import config from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { createContext, useContext } from 'react';

export type AnalyticsClient = {
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	recordPageView: ( url: string, title: string ) => void;
};

const defaultNoopAnalyticsClient = {
	recordTracksEvent() {},
	recordPageView() {},
};

const AnalyticsContext = createContext< AnalyticsClient >( defaultNoopAnalyticsClient );

interface AnalyticsProviderProps {
	children: React.ReactNode;
	client: AnalyticsClient;
}

export function AnalyticsProvider( { children, client }: AnalyticsProviderProps ) {
	return <AnalyticsContext.Provider value={ client }>{ children }</AnalyticsContext.Provider>;
}

export function useAnalytics() {
	const context = useContext( AnalyticsContext );

	if (
		! config< string >( 'env_id' ).includes( 'production' ) &&
		context === defaultNoopAnalyticsClient
	) {
		// eslint-disable-next-line no-console
		console.error( 'useAnalytics() must be used with a <AnalyticsProvider>' );
	}

	return context;
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
