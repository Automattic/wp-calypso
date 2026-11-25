/**
 * @vitest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';
import wp from 'calypso/lib/wp';
import SiteMigrationSupportInstructions from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		req: {
			get: vi.fn(),
			post: vi.fn(),
		},
	} )
);

const render = () =>
	renderStep( <SiteMigrationSupportInstructions { ...mockStepProps() } />, {
		initialEntry:
			'/site-migration-support-instructions?siteSlug=example.wordpress.com&from=example.com',
		initialState: { currentUser: { id: 1, user: { ID: 1, email: 'customer@example.com' } } },
	} );

const tryAgainMessage =
	/We couldn’t send your migration request just now. Please try again in a few minutes./;

describe( 'SiteMigrationSupportInstructions', () => {
	beforeEach( () => vi.clearAllMocks() );

	it( 'lets the customer try again when the migration request could not be sent', async () => {
		vi.mocked( wp.req.post )
			.mockRejectedValueOnce( { code: 'internal_error' } )
			.mockResolvedValueOnce( { success: true } );

		render();

		expect( await screen.findByText( tryAgainMessage ) ).toBeVisible();

		const retry = screen.getByRole( 'button', { name: 'Try again' } );
		// The notice only gives buttons inside its text readable colors.
		expect( retry.closest( '.calypso-notice__text' ) ).not.toBeNull();

		// A keyboard user can retry too.
		retry.focus();
		await userEvent.keyboard( '{Enter}' );

		await waitFor( () => expect( screen.queryByText( tryAgainMessage ) ).not.toBeInTheDocument() );
		expect( wp.req.post ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not ask the customer to try again when wpcom refused the request', async () => {
		vi.mocked( wp.req.post ).mockRejectedValue( { code: 'migration_request_not_submitted' } );

		render();

		await waitFor( () => expect( wp.req.post ).toHaveBeenCalledTimes( 1 ) );
		// Let the rejected request settle, so a notice would have rendered by now.
		await act( () => new Promise( ( resolve ) => setTimeout( resolve, 50 ) ) );
		expect( screen.getByText( 'We’ll take it from here!' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();
	} );
} );
