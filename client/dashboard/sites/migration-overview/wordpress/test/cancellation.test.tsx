/**
 * @vitest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { MigrationCancellation } from '../cancellation';
import type { Site, WordPressMigrationCancellation } from '@automattic/api-core';

const site = { ID: 42 } as Site;
const cancelPath = '/wpcom/v2/sites/42/wordpress-migration/cancel';
const mockApi = () => nock( 'https://public-api.wordpress.com' );

const openConfirmation = async ( status: WordPressMigrationCancellation[ 'status' ] ) => {
	mockApi().get( cancelPath ).query( true ).reply( 200, { status } );
	render( <MigrationCancellation site={ site } />, { queryClient } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Cancel this migration' } ) );
	return within( await screen.findByRole( 'dialog' ) );
};

afterEach( () => queryClient.clear() );

test( 'only cancels a clean migration after explicit confirmation', async () => {
	let modal = await openConfirmation( 'ready' );
	await userEvent.click( await modal.findByRole( 'button', { name: 'Keep migrating' } ) );
	expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

	mockApi().get( cancelPath ).query( true ).reply( 200, { status: 'ready' } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Cancel this migration' } ) );
	modal = within( await screen.findByRole( 'dialog' ) );
	const cancel = mockApi().post( cancelPath ).reply( 200, { status: 'cancelled' } );
	await waitFor( () =>
		expect( modal.getByRole( 'button', { name: 'Cancel migration' } ) ).toBeEnabled()
	);
	await userEvent.click( modal.getByRole( 'button', { name: 'Cancel migration' } ) );
	expect( await modal.findByText( 'Your migration has been cancelled.' ) ).toBeVisible();
	expect( cancel.isDone() ).toBe( true );
} );

test( 'offers support for a possibly modified site', async () => {
	const modal = await openConfirmation( 'support' );
	expect( await modal.findByText( /may have changed your destination/ ) ).toBeVisible();
	expect( modal.getByRole( 'button', { name: 'Contact us' } ) ).toBeVisible();
	expect( modal.queryByRole( 'button', { name: 'Cancel migration' } ) ).not.toBeInTheDocument();
} );

test( 'keeps the site locked when work resumes between the check and confirmation', async () => {
	const modal = await openConfirmation( 'ready' );
	mockApi().post( cancelPath ).reply( 200, { status: 'wait' } );
	await userEvent.click( await modal.findByRole( 'button', { name: 'Cancel migration' } ) );
	expect( await modal.findByText( /Migration work is still in progress/ ) ).toBeVisible();
	expect( modal.queryByRole( 'button', { name: 'Cancel migration' } ) ).not.toBeInTheDocument();

	mockApi().get( cancelPath ).query( true ).reply( 200, { status: 'ready' } );
	await userEvent.click( modal.getByRole( 'button', { name: 'Try again' } ) );
	expect( await modal.findByRole( 'button', { name: 'Cancel migration' } ) ).toBeEnabled();
} );

test( 'withholds confirmation when the readiness check fails', async () => {
	mockApi().get( cancelPath ).query( true ).reply( 503 );
	render( <MigrationCancellation site={ site } />, { queryClient } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Cancel this migration' } ) );
	const modal = within( await screen.findByRole( 'dialog' ) );
	expect( await modal.findByText( /We couldn’t check/ ) ).toBeVisible();
	expect( modal.queryByRole( 'button', { name: 'Cancel migration' } ) ).not.toBeInTheDocument();
	expect( modal.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
} );
