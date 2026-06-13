/**
 * @jest-environment jsdom
 */

import { loadScript } from '@automattic/load-script';
import { mayWeInitTracker } from 'calypso/lib/analytics/tracker-buckets';
import {
	DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS,
	ensureGoogleConsentModeDefault,
	getGoogleConsentModeSignals,
	initializeGoogleTag,
	updateGoogleConsentMode,
} from '../ad-tracking/consent-mode';
import { GOOGLE_GTM_SCRIPT_URL } from '../ad-tracking/constants';
import { initGTMContainer, loadGTMContainer } from '../ad-tracking/gtm-container';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracker-buckets', () => ( {
	mayWeInitTracker: jest.fn(),
} ) );

const mockLoadScript = loadScript;
const mockMayWeInitTracker = mayWeInitTracker;

const trackingPrefs = ( { analytics, advertising, ok = true } ) => ( {
	ok,
	buckets: {
		essential: true,
		analytics,
		advertising,
	},
} );

const setCookie = ( name, value ) => {
	document.cookie = `${ name }=${ encodeURIComponent( value ) }; path=/`;
};

const deleteCookie = ( name ) => {
	document.cookie = `${ name }=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

const resetTrackingCookies = () => {
	[ 'sensitive_pixel_options', 'sensitive_pixel_option', 'country_code', 'region' ].forEach(
		deleteCookie
	);
};

const setGeoCookies = ( countryCode = 'US', region = 'utah' ) => {
	setCookie( 'country_code', countryCode );
	setCookie( 'region', region );
};

const setTrackingPrefsCookie = ( prefs ) => {
	setCookie( 'sensitive_pixel_options', JSON.stringify( prefs ) );
};

const setGlobalPrivacyControl = ( value ) => {
	Object.defineProperty( window.navigator, 'globalPrivacyControl', {
		configurable: true,
		value,
	} );
};

const dataLayerCalls = () =>
	window.dataLayer.map( ( call ) =>
		'function' === typeof call?.[ Symbol.iterator ] ? Array.from( call ) : [ call ]
	);

const resetGoogleWindow = () => {
	delete window.dataLayer;
	delete window.gtag;
	delete window.__calypsoGoogleConsentModeDefaultSet;
	delete window.__calypsoGoogleTagInitialized;
};

describe( 'Google Consent Mode', () => {
	beforeEach( () => {
		resetGoogleWindow();
		resetTrackingCookies();
		setGeoCookies();
		setTrackingPrefsCookie( trackingPrefs( { analytics: true, advertising: true } ) );
		setGlobalPrivacyControl( false );
		mockMayWeInitTracker.mockReturnValue( true );
		mockLoadScript.mockResolvedValue();
	} );

	afterEach( () => {
		jest.clearAllMocks();
		resetGoogleWindow();
		resetTrackingCookies();
	} );

	describe( 'getGoogleConsentModeSignals', () => {
		test( 'denies all signals for GDPR visitors before consent is saved', () => {
			resetTrackingCookies();
			setGeoCookies( 'DE', 'berlin' );

			expect( getGoogleConsentModeSignals() ).toEqual( DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS );
		} );

		test( 'maps analytics-only consent to analytics granted and ads denied', () => {
			setGeoCookies( 'DE', 'berlin' );
			setTrackingPrefsCookie( trackingPrefs( { analytics: true, advertising: false } ) );

			expect( getGoogleConsentModeSignals() ).toEqual( {
				analytics_storage: 'granted',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
			} );
		} );

		test( 'maps accept-all consent to all granted', () => {
			expect( getGoogleConsentModeSignals() ).toEqual( {
				analytics_storage: 'granted',
				ad_storage: 'granted',
				ad_user_data: 'granted',
				ad_personalization: 'granted',
			} );
		} );

		test( 'maps declined non-essential consent to all denied', () => {
			setGeoCookies( 'DE', 'berlin' );
			setTrackingPrefsCookie( trackingPrefs( { analytics: false, advertising: false } ) );

			expect( getGoogleConsentModeSignals() ).toEqual( {
				analytics_storage: 'denied',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
			} );
		} );

		test( 'maps CCPA advertising opt-out to advertising denied', () => {
			setGeoCookies( 'US', 'california' );
			setTrackingPrefsCookie( trackingPrefs( { analytics: true, advertising: false } ) );

			expect( getGoogleConsentModeSignals() ).toEqual( {
				analytics_storage: 'granted',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
			} );
		} );

		test( 'denies advertising signals when CCPA GPC blocks advertising tracking', () => {
			setGeoCookies( 'US', 'california' );
			setTrackingPrefsCookie( trackingPrefs( { analytics: true, advertising: true } ) );
			setGlobalPrivacyControl( true );

			expect( getGoogleConsentModeSignals() ).toEqual( {
				analytics_storage: 'granted',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
			} );
		} );

		test( 'fails closed when tracking preferences cannot be read', () => {
			setCookie( 'sensitive_pixel_options', '{' );

			expect( getGoogleConsentModeSignals() ).toEqual( DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS );
		} );
	} );

	test( 'initializes gtag with default denied then current consent before js', () => {
		setTrackingPrefsCookie( trackingPrefs( { analytics: true, advertising: false } ) );

		initializeGoogleTag();

		const calls = dataLayerCalls();
		expect( calls[ 0 ] ).toEqual( [ 'consent', 'default', DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS ] );
		expect( calls[ 1 ] ).toEqual( [
			'consent',
			'update',
			{
				analytics_storage: 'granted',
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
			},
		] );
		expect( calls[ 2 ][ 0 ] ).toBe( 'js' );
		expect( calls[ 2 ][ 1 ] ).toBeInstanceOf( Date );
	} );

	test( 'does not initialize gtag when update is limited to an existing tag', () => {
		updateGoogleConsentMode( { onlyIfInitialized: true } );

		expect( window.gtag ).toBeUndefined();
		expect( window.dataLayer ).toBeUndefined();
	} );

	test( 'sets the default consent state only once', () => {
		ensureGoogleConsentModeDefault();
		ensureGoogleConsentModeDefault();

		expect( dataLayerCalls() ).toEqual( [
			[ 'consent', 'default', DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS ],
		] );
	} );

	test( 'loads GTM only after Consent Mode commands are queued', async () => {
		await loadGTMContainer( 'GTM-TEST' );

		const calls = dataLayerCalls();
		expect( calls[ 0 ] ).toEqual( [ 'consent', 'default', DEFAULT_GOOGLE_CONSENT_MODE_SIGNALS ] );
		expect( calls[ 1 ][ 0 ] ).toBe( 'consent' );
		expect( calls[ 1 ][ 1 ] ).toBe( 'update' );
		expect( mockLoadScript ).toHaveBeenCalledWith( GOOGLE_GTM_SCRIPT_URL + 'GTM-TEST' );
	} );

	test( 'pushes GTM start only after Consent Mode commands are queued', async () => {
		await initGTMContainer();

		const calls = dataLayerCalls();
		expect( calls[ 0 ][ 0 ] ).toBe( 'consent' );
		expect( calls[ 1 ][ 0 ] ).toBe( 'consent' );
		expect( calls[ 2 ] ).toEqual( [
			expect.objectContaining( {
				event: 'gtm.js',
			} ),
		] );
	} );
} );
