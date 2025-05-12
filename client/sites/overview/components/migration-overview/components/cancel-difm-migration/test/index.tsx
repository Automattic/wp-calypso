/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import CancelDifmMigrationForm from '../index';

jest.mock( '@automattic/calypso-config', () => {
	return {
		__esModule: true,
		default: jest.fn(), // mock config()
		isEnabled: jest.fn(),
	};
} );

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		post: jest.fn(),
	},
} ) );

describe( 'CancelDifmMigrationForm', () => {
	const siteId = 123;
	const isEnabled = jest.requireMock( '@automattic/calypso-config' ).isEnabled;

	beforeEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
		isEnabled.mockReturnValue( true );
	} );

	it( 'renders nothing if feature flag is disabled', () => {
		isEnabled.mockReturnValue( false );
		renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
		expect( screen.queryByRole( 'button', { name: /request cancellation/i } ) ).toBeNull();
	} );

	it( 'opens dialog on button click', async () => {
		renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
		await userEvent.click( screen.getByRole( 'button', { name: /request cancellation/i } ) );
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		expect( screen.getByText( /request migration cancellation/i ) ).toBeVisible();
	} );

	it( 'closes dialog on cancel', async () => {
		renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
		await userEvent.click( screen.getByRole( 'button', { name: /request cancellation/i } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /don't cancel migration/i } ) );
		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).toBeNull();
		} );
	} );
} );
