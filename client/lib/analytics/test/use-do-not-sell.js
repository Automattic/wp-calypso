/**
 * @jest-environment jsdom
 */

import {
	getTrackingPrefs,
	recordTracksEvent,
	setTrackingPrefs,
} from '@automattic/calypso-analytics';
import { act, renderHook } from '@testing-library/react';
import { updateGoogleConsentMode } from 'calypso/lib/analytics/ad-tracking/consent-mode';
import { loadTrackingScripts } from 'calypso/lib/analytics/ad-tracking/load-tracking-scripts';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import useDoNotSell from '../utils/use-do-not-sell';

const mockDispatch = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	getTrackingPrefs: jest.fn(),
	isRegionInCcpaZone: jest.fn( () => true ),
	recordTracksEvent: jest.fn(),
	setTrackingPrefs: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/ad-tracking/consent-mode', () => ( {
	updateGoogleConsentMode: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/ad-tracking/load-tracking-scripts', () => ( {
	loadTrackingScripts: jest.fn(),
} ) );

jest.mock( 'calypso/state/user-settings/actions', () => ( {
	saveUserSettings: jest.fn( ( settings ) => ( {
		type: 'SAVE_USER_SETTINGS',
		settings,
	} ) ),
} ) );

jest.mock( 'react-redux', () => ( {
	useDispatch: () => mockDispatch,
} ) );

const trackingPrefs = ( { advertising } ) => ( {
	ok: true,
	buckets: {
		essential: true,
		analytics: true,
		advertising,
	},
} );

const setCookie = ( name, value ) => {
	document.cookie = `${ name }=${ encodeURIComponent( value ) }; path=/`;
};

const deleteCookie = ( name ) => {
	document.cookie = `${ name }=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

describe( 'useDoNotSell', () => {
	beforeEach( () => {
		setCookie( 'country_code', 'US' );
		setCookie( 'region', 'california' );
		getTrackingPrefs.mockReturnValue( trackingPrefs( { advertising: true } ) );
		setTrackingPrefs.mockImplementation( ( prefs ) =>
			trackingPrefs( { advertising: prefs.buckets.advertising } )
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
		deleteCookie( 'country_code' );
		deleteCookie( 'region' );
	} );

	const renderUseDoNotSell = async () => {
		const { result } = renderHook( () => useDoNotSell() );

		await act( async () => {} );

		return result;
	};

	test( 'updates an existing Google consent mode tag when opting out', async () => {
		const result = await renderUseDoNotSell();

		act( () => {
			result.current.onSetDoNotSell( true );
		} );

		expect( setTrackingPrefs ).toHaveBeenCalledWith( {
			ok: true,
			buckets: { advertising: false },
		} );
		expect( updateGoogleConsentMode ).toHaveBeenCalledWith( { onlyIfInitialized: true } );
		expect( loadTrackingScripts ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'a8c_ccpa_optout', {
			source: 'calypso',
			hostname: window.location.hostname,
			pathname: window.location.pathname,
		} );
		expect( saveUserSettings ).toHaveBeenCalledWith( { advertising_targeting_opt_out: true } );
	} );

	test( 'reloads tracking scripts when opting back in', async () => {
		const result = await renderUseDoNotSell();

		act( () => {
			result.current.onSetDoNotSell( false );
		} );

		expect( setTrackingPrefs ).toHaveBeenCalledWith( {
			ok: true,
			buckets: { advertising: true },
		} );
		expect( loadTrackingScripts ).toHaveBeenCalledWith( true );
		expect( updateGoogleConsentMode ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( saveUserSettings ).toHaveBeenCalledWith( { advertising_targeting_opt_out: false } );
	} );
} );
