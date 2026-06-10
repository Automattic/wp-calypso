/**
 * @jest-environment jsdom
 */

import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { EmailSettingsModal } from '../index';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// Fix the device timezone so the local↔UTC delivery-window conversion is
// deterministic in tests: UTC-4 (America/New_York during EDT).
jest.mock( '@automattic/i18n-utils', () => {
	const actual = jest.requireActual( '@automattic/i18n-utils' );
	return {
		...actual,
		useDeliveryWindowTimezone: () => ( {
			timezone: 'America/New_York',
			offsetHours: -4,
			isUtcFallback: false,
		} ),
	};
} );

const API_ROOT = 'https://public-api.wordpress.com';
const SETTINGS_PATH = '/rest/v1.1/me/settings';

const mockSettings = ( overrides: Record< string, unknown > = {} ) => ( {
	subscription_delivery_email_default: 'never',
	subscription_delivery_mail_option: 'html',
	subscription_delivery_day: 0,
	subscription_delivery_hour: 8,
	...overrides,
} );

const nockGetSettings = ( overrides: Record< string, unknown > = {} ) =>
	nock( API_ROOT ).get( SETTINGS_PATH ).reply( 200, mockSettings( overrides ) );

// Captures every POST body so tests can assert what was saved and that
// rapid edits coalesce into a single request.
const nockPostSettings = ( { status = 200 }: { status?: number } = {} ) => {
	const bodies: Record< string, unknown >[] = [];
	nock( API_ROOT )
		.post( SETTINGS_PATH, ( body ) => {
			bodies.push( body as Record< string, unknown > );
			return true;
		} )
		.reply( status, {} )
		.persist();
	return bodies;
};

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( {
		queries: {
			retry: false,
		},
	} );
	return instance;
};

const renderModal = ( onContinue: () => void = jest.fn() ) =>
	renderWithProvider( <EmailSettingsModal onContinue={ onContinue } />, {
		queryClient: getQueryClient(),
	} );

const findFrequencySelect = () =>
	screen.findByRole( 'combobox', { name: 'Default email delivery' } );

describe( 'EmailSettingsModal', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'renders the title and description', async () => {
		nockGetSettings();
		renderModal();

		expect(
			screen.getByRole( 'heading', { name: 'Choose your delivery settings' } )
		).toBeVisible();
		expect(
			screen.getByText( /Please choose the default email settings for new posts/ )
		).toBeVisible();
		expect( await findFrequencySelect() ).toBeVisible();
	} );

	it( 'shows only the delivery frequency select when delivery is set to never', async () => {
		nockGetSettings();
		renderModal();

		expect( await findFrequencySelect() ).toHaveValue( 'never' );
		expect(
			screen.queryByRole( 'combobox', { name: 'Email delivery format' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'combobox', { name: 'Email delivery time' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'combobox', { name: 'Email delivery day' } )
		).not.toBeInTheDocument();
	} );

	it( 'reveals only the fields relevant to the selected frequency', async () => {
		nockGetSettings();
		nockPostSettings();
		const user = userEvent.setup();
		renderModal();

		const frequency = await findFrequencySelect();

		await user.selectOptions( frequency, 'instantly' );
		expect( screen.getByRole( 'combobox', { name: 'Email delivery format' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'combobox', { name: 'Email delivery time' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'combobox', { name: 'Email delivery day' } )
		).not.toBeInTheDocument();

		await user.selectOptions( frequency, 'daily' );
		expect( screen.getByRole( 'combobox', { name: 'Email delivery format' } ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'Email delivery time' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'combobox', { name: 'Email delivery day' } )
		).not.toBeInTheDocument();

		await user.selectOptions( frequency, 'weekly' );
		expect( screen.getByRole( 'combobox', { name: 'Email delivery format' } ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'Email delivery time' } ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'Email delivery day' } ) ).toBeVisible();
	} );

	it( 'displays the stored UTC delivery window in local time', async () => {
		// Stored UTC hour 8 with a -4 offset displays as the 04:00 local bucket.
		nockGetSettings( { subscription_delivery_email_default: 'weekly' } );
		renderModal();

		expect( await screen.findByRole( 'combobox', { name: 'Email delivery time' } ) ).toHaveValue(
			'4'
		);
		expect( screen.getByRole( 'combobox', { name: 'Email delivery day' } ) ).toHaveValue( '0' );
		expect( screen.getByText( 'Timezone: America/New_York' ) ).toBeVisible();
	} );

	it( 'debounce-saves edits as a single request with the delivery window converted to UTC', async () => {
		nockGetSettings( { subscription_delivery_email_default: 'daily' } );
		const postBodies = nockPostSettings();
		const user = userEvent.setup();
		renderModal();

		// Local 20:00 with a -4 offset is 00:00 UTC the next day, so the day
		// wraps from Sunday (0) to Monday (1).
		await user.selectOptions( await findFrequencySelect(), 'weekly' );
		await user.selectOptions(
			screen.getByRole( 'combobox', { name: 'Email delivery time' } ),
			'20'
		);

		await waitFor(
			() => {
				expect( postBodies ).toHaveLength( 1 );
			},
			{ timeout: 3000 }
		);

		expect( postBodies[ 0 ] ).toMatchObject( {
			subscription_delivery_email_default: 'weekly',
			subscription_delivery_hour: 0,
			subscription_delivery_day: 1,
		} );
	} );

	it( 'flushes the pending save immediately and advances when Continue is clicked', async () => {
		nockGetSettings( { subscription_delivery_email_default: 'instantly' } );
		const postBodies = nockPostSettings();
		const onContinue = jest.fn();
		const user = userEvent.setup();
		renderModal( onContinue );

		await user.selectOptions(
			await screen.findByRole( 'combobox', { name: 'Email delivery format' } ),
			'text'
		);
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalledTimes( 1 );
		// The save fires synchronously on Continue, well before the debounce
		// would have elapsed.
		expect( postBodies ).toHaveLength( 1 );
		expect( postBodies[ 0 ] ).toMatchObject( { subscription_delivery_mail_option: 'text' } );
	} );

	it( 'still advances on Continue when nothing was changed, without saving', async () => {
		nockGetSettings();
		const postBodies = nockPostSettings();
		const onContinue = jest.fn();
		const user = userEvent.setup();
		renderModal( onContinue );

		await findFrequencySelect();
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalledTimes( 1 );
		expect( postBodies ).toHaveLength( 0 );
	} );

	it( 'shows an error notice when saving fails', async () => {
		nockGetSettings();
		nockPostSettings( { status: 500 } );
		const user = userEvent.setup();
		renderModal();

		await user.selectOptions( await findFrequencySelect(), 'instantly' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		// The message also lands in the hidden a11y-speak live region, so scope
		// the query to the visible notice content.
		expect(
			await screen.findByText( 'Failed to save your email settings. Please try again.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
	} );
} );
