import config from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
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

const MISSING_PROVIDER_MESSAGE = 'useAnalytics() must be used with a <AnalyticsProvider>';

let hasCapturedMissingProviderOnce = false;

export function useAnalytics() {
	const context = useContext( AnalyticsContext );

	if ( context === defaultNoopAnalyticsClient ) {
		if ( config( 'env' ) !== 'production' ) {
			// eslint-disable-next-line no-console
			console.error( MISSING_PROVIDER_MESSAGE );
		} else if ( ! hasCapturedMissingProviderOnce ) {
			hasCapturedMissingProviderOnce = true;
			captureException( new Error( MISSING_PROVIDER_MESSAGE ) );
		}
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
