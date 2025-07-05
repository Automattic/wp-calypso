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

jest.mock( '../use-site-migration-status', () => ( {
	useSiteMigrationStatus: jest.fn(),
} ) );

jest.mock( '../use-find-zendesk-migration-ticket', () => ( {
	useFindZendeskMigrationTicket: jest.fn(),
} ) );

describe( 'CancelDifmMigrationForm', () => {
	const siteId = 123;
	const isEnabled = jest.requireMock( '@automattic/calypso-config' ).isEnabled;
	const useSiteMigrationStatus = jest.requireMock(
		'../use-site-migration-status'
	).useSiteMigrationStatus;
	const useFindZendeskMigrationTicket = jest.requireMock(
		'../use-find-zendesk-migration-ticket'
	).useFindZendeskMigrationTicket;

	beforeEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
		isEnabled.mockReturnValue( true );
		useSiteMigrationStatus.mockReturnValue( {
			site: { ID: siteId },
			isMigrationCompleted: false,
			isMigrationInProgress: false,
		} );
		useFindZendeskMigrationTicket.mockReturnValue( {
			data: { ticket_id: '123' },
		} );
	} );

	describe( 'when migration is not in progress', () => {
		beforeEach( () => {
			useSiteMigrationStatus.mockReturnValue( {
				site: { ID: siteId },
				isMigrationCompleted: false,
				isMigrationInProgress: false,
			} );
		} );

		it( 'shows cancel migration button', () => {
			renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
			expect( screen.getByRole( 'button', { name: /cancel migration/i } ) ).toBeVisible();
		} );

		it( 'opens dialog with cancel migration content', async () => {
			renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
			await userEvent.click( screen.getByRole( 'button', { name: /cancel migration/i } ) );
			expect( screen.getByRole( 'dialog' ) ).toBeVisible();
			expect( screen.getByRole( 'heading', { name: /cancel migration/i } ) ).toBeVisible();
			expect( screen.getByText( /our Happiness Engineers will be notified/i ) ).toBeVisible();
		} );
	} );

	describe( 'when migration is in progress', () => {
		beforeEach( () => {
			useSiteMigrationStatus.mockReturnValue( {
				site: { ID: siteId },
				isMigrationCompleted: false,
				isMigrationInProgress: true,
			} );
		} );

		it( 'shows request cancellation button', () => {
			renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
			expect(
				screen.getByRole( 'button', { name: /request migration cancellation/i } )
			).toBeVisible();
		} );

		it( 'opens dialog with request cancellation content', async () => {
			renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
			await userEvent.click(
				screen.getByRole( 'button', { name: /request migration cancellation/i } )
			);
			expect( screen.getByRole( 'dialog' ) ).toBeVisible();
			expect(
				screen.getByRole( 'heading', { name: /request migration cancellation/i } )
			).toBeVisible();
			expect( screen.getByText( /you'll lose all your progress/i ) ).toBeVisible();
		} );
	} );

	it( 'closes dialog on cancel', async () => {
		renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
		await userEvent.click( screen.getByRole( 'button', { name: /cancel migration/i } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /don't cancel migration/i } ) );
		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).toBeNull();
		} );
	} );

	it( 'should not show the cancel migration button if there is no zendesk ticket', () => {
		useFindZendeskMigrationTicket.mockReturnValue( {
			data: {
				ticket_id: null,
			},
		} );
		renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
		expect( screen.queryByRole( 'button', { name: /cancel migration/i } ) ).toBeNull();
	} );

	it( 'useFindZendeskMigrationTicket should not make a request if the migration is completed', () => {
		useSiteMigrationStatus.mockReturnValue( {
			site: { ID: siteId },
			isMigrationCompleted: true,
			isMigrationInProgress: false,
		} );
		renderWithProvider( <CancelDifmMigrationForm siteId={ siteId } /> );
		expect( useFindZendeskMigrationTicket ).toHaveBeenCalledWith( siteId, false );
	} );
} );
