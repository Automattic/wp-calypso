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

/**
 * Bump an anonymous stat.
 */
export function bumpStat( group: string, value: string ) {
	bumpMultipleStats( [ group, value ] );
}

/**
 * Bumps multiple anon stats at once to save on network requests.
 *
 * Example:
 * ```ts
 * bumpMultipleStats(
 *   [ 'my-stat', 'failed' ],
 *   [ 'error', 'failed' ],
 *   [ 'interesting', 'true' ]
 * );
 * ```
 */
export function bumpMultipleStats( ...groupValuePairs: [ string, string ][] ) {
	if ( typeof window === 'undefined' || ! config( 'mc_analytics_enabled' ) ) {
		return;
	}

	const queryArgs = groupValuePairs.reduce(
		( acc, [ group, value ] ) => {
			if ( group.length > 32 ) {
				captureException( new Error( `stat group name too long: ${ group }` ) );
			}
			if ( value.length > 32 ) {
				captureException( new Error( `stat value name too long: ${ value }` ) );
			}
			return { ...acc, [ `x_${ group }` ]: value };
		},
		{
			v: 'wpcom-no-pv',
			t: Math.random().toString(),
		}
	);

	const url = addQueryArgs( document.location.protocol + '//pixel.wp.com/g.gif', queryArgs );

	new window.Image().src = url;
}
