/**
 * @vitest-environment jsdom
 */
import { queryClient, siteWordPressMigrationCancellationQuery } from '@automattic/api-queries';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { MigrationCancellation } from '../cancellation';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 42,
	slug: 'example.wordpress.com',
	URL: 'https://example.wordpress.com',
} as Site;
const cancelPath = '/wpcom/v2/sites/42/wordpress-migration/cancel';
const mockApi = () => nock( 'https://public-api.wordpress.com' );

const openConfirmation = async ( requiresReset = false ) => {
	mockApi().get( cancelPath ).query( true ).reply( 200, {
		status: 'ready',
		requires_reset: requiresReset,
	} );
	render( <MigrationCancellation site={ site } />, { queryClient } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Cancel this migration' } ) );
	await screen.findByText(
		requiresReset ? /This migration may have changed/ : /Cancel this migration and return/
	);
	return within( screen.getByRole( 'dialog' ) );
};

afterEach( () => queryClient.clear() );

test( 'lets the customer dismiss cancellation and explicitly confirm it', async () => {
	let modal = await openConfirmation();
	await userEvent.click( modal.getByRole( 'button', { name: 'Keep migrating' } ) );
	expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

	mockApi()
		.get( cancelPath )
		.query( true )
		.reply( 200, { status: 'ready', requires_reset: false } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Cancel this migration' } ) );
	modal = within( await screen.findByRole( 'dialog' ) );
	const cancel = mockApi().post( cancelPath, { reset: false } ).reply( 200, {
		status: 'cancelled',
		requires_reset: false,
	} );
	await waitFor( () =>
		expect( modal.getByRole( 'button', { name: 'Cancel migration' } ) ).toBeEnabled()
	);
	await userEvent.click( modal.getByRole( 'button', { name: 'Cancel migration' } ) );
	await waitFor( () => expect( cancel.isDone() ).toBe( true ) );
} );

test( 'requires the destination domain before requesting a destructive reset', async () => {
	const modal = await openConfirmation( true );
	expect(
		modal.getByText( /including anything that was there before the migration/ )
	).toBeVisible();
	const resetButton = modal.getByRole( 'button', { name: /^Reset site$/ } );
	expect( resetButton ).toBeDisabled();
	await userEvent.type(
		modal.getByRole( 'textbox', { name: 'Type the site domain to confirm' } ),
		'wrong.example'
	);
	expect( resetButton ).toBeDisabled();
	await userEvent.clear(
		modal.getByRole( 'textbox', { name: 'Type the site domain to confirm' } )
	);
	await userEvent.type(
		modal.getByRole( 'textbox', { name: 'Type the site domain to confirm' } ),
		site.slug
	);
	const reset = mockApi().post( cancelPath, { reset: true, domain: site.slug } ).reply( 200, {
		status: 'resetting',
		requires_reset: true,
	} );
	await userEvent.click( resetButton );
	await waitFor( () => expect( reset.isDone() ).toBe( true ) );
	expect( await modal.findByText( /We’re resetting your site/ ) ).toBeVisible();
} );

test( 'keeps the confirmation usable after a refused cancellation', async () => {
	const modal = await openConfirmation();
	mockApi().post( cancelPath ).reply( 409, {
		error: 'site_migration_already_in_progress',
		message: 'Migration still running.',
	} );
	mockApi()
		.get( cancelPath )
		.query( true )
		.reply( 200, { status: 'ready', requires_reset: false } );
	await userEvent.click( modal.getByRole( 'button', { name: 'Cancel migration' } ) );
	expect( await modal.findByText( /We couldn’t cancel the migration/ ) ).toBeVisible();
	await waitFor( () =>
		expect( modal.getByRole( 'button', { name: 'Cancel migration' } ) ).toBeEnabled()
	);
} );

test( 'offers reset recovery after a reload and keeps a rollback on the migration screen', async () => {
	mockApi()
		.get( cancelPath )
		.query( true )
		.reply( 200, { status: 'resetting', requires_reset: true } );
	render( <MigrationCancellation site={ site } recovering />, { queryClient } );
	expect( await screen.findByText( 'Resetting your site' ) ).toBeVisible();
	await waitFor( () =>
		expect(
			queryClient.getQueryData( siteWordPressMigrationCancellationQuery( site.ID ).queryKey )
		).toMatchObject( { status: 'resetting' } )
	);
	mockApi().get( cancelPath ).query( true ).reply( 200, {
		status: 'failed',
		requires_reset: true,
		error: 'The replacement was not activated.',
	} );
	await act( async () => {
		await queryClient.invalidateQueries( siteWordPressMigrationCancellationQuery( site.ID ) );
	} );
	expect( await screen.findByText( 'The site reset failed' ) ).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Try resetting again' } ) ).toBeEnabled();
} );

test( 'does not offer confirmation when the backend cannot establish readiness', async () => {
	mockApi()
		.get( cancelPath )
		.query( true )
		.reply( 409, { error: 'site_migration_already_in_progress', message: 'Still working.' } );
	render( <MigrationCancellation site={ site } />, { queryClient } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Cancel this migration' } ) );
	const modal = within( await screen.findByRole( 'dialog' ) );
	expect( await modal.findByText( /We couldn’t cancel the migration/ ) ).toBeVisible();
	expect( modal.queryByRole( 'button', { name: 'Cancel migration' } ) ).not.toBeInTheDocument();
	expect( modal.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
} );
