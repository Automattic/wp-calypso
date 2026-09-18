/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AppPromo } from '../index';

const mockUserAgent: Record< string, boolean > = {};

jest.mock( 'calypso/lib/user-agent', () => ( {
	__esModule: true,
	get default() {
		return mockUserAgent;
	},
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( { type: 'ANALYTICS_EVENT_RECORD' } ) ),
} ) );

// jsdom cannot navigate, so keep link clicks from logging "Not implemented" errors.
const preventNavigation = ( event: Event ) => event.preventDefault();

describe( 'AppPromo', () => {
	beforeAll( () => {
		document.addEventListener( 'click', preventNavigation );
	} );

	afterAll( () => {
		document.removeEventListener( 'click', preventNavigation );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		for ( const key of Object.keys( mockUserAgent ) ) {
			delete mockUserAgent[ key ];
		}
	} );

	test( 'records an impression event with the campaign', () => {
		renderWithProvider( <AppPromo campaign="test-campaign" /> );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_app_promo_impression', {
			campaign: 'test-campaign',
		} );
	} );

	test( 'records a click event when the text link next to the QR code is clicked', async () => {
		const user = userEvent.setup();
		renderWithProvider( <AppPromo campaign="test-campaign" hasQRCode hasGetAppButton={ false } /> );

		await user.click( screen.getByRole( 'link', { name: 'wp.com/app' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_app_promo_click', {
			campaign: 'test-campaign',
			cta: 'text_link',
		} );
	} );

	test( 'records a click event when the "Get the Jetpack app" button is clicked', async () => {
		const user = userEvent.setup();
		renderWithProvider( <AppPromo campaign="test-campaign" /> );

		await user.click( screen.getByRole( 'link', { name: 'Get the Jetpack app' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_app_promo_click', {
			campaign: 'test-campaign',
			cta: 'get_app_button',
		} );
	} );

	test( 'records a click event with the campaign when the store badge is tapped on a phone', async () => {
		mockUserAgent.isiPhone = true;
		const user = userEvent.setup();
		renderWithProvider( <AppPromo campaign="test-campaign" /> );

		await user.click( screen.getByRole( 'link' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_app_promo_click', {
			campaign: 'test-campaign',
			cta: 'store_badge',
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_app_download_ios_click', {
			utm_source_string: 'calypso',
			utm_campaign: 'test-campaign',
		} );
	} );
} );
