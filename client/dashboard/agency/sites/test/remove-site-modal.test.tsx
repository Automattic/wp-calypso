/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import RemoveSiteModal from '../remove-site-modal';
import type { AgencySite } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

const site = { blog_id: 1, a4a_site_id: 42, url: 'example.com', is_atomic: true } as AgencySite;

function mockAgency() {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 7 } ] );
}

function mockRemoval( status: number, body: unknown = { success: true } ) {
	return nock( `${ API }:443` ).delete( '/wpcom/v2/agency/7/sites/42' ).reply( status, body );
}

// The button waits for the active agency, whose id the request path needs.
async function findEnabledRemoveButton() {
	const button = await screen.findByRole( 'button', { name: 'Remove site' } );
	await waitFor( () => expect( button ).toBeEnabled() );
	return button;
}

describe( '<RemoveSiteModal>', () => {
	test( 'removes the site and closes', async () => {
		mockAgency();
		const removal = mockRemoval( 200 );
		const closeModal = jest.fn();

		render( <RemoveSiteModal site={ site } closeModal={ closeModal } /> );
		await userEvent.click( await findEnabledRemoveButton() );

		await waitFor( () => expect( closeModal ).toHaveBeenCalled() );
		expect( removal.isDone() ).toBe( true );
	} );

	test( 'stays open when the removal fails', async () => {
		mockAgency();
		const removal = mockRemoval( 403, { message: 'You are not allowed to do that.' } );
		const closeModal = jest.fn();

		render( <RemoveSiteModal site={ site } closeModal={ closeModal } /> );
		await userEvent.click( await findEnabledRemoveButton() );

		await waitFor( () => expect( removal.isDone() ).toBe( true ) );
		expect( closeModal ).not.toHaveBeenCalled();
		expect( await findEnabledRemoveButton() ).toBeVisible();
	} );

	test( 'cannot remove a site that is still being set up', async () => {
		mockAgency();

		render( <RemoveSiteModal site={ { ...site, a4a_site_id: undefined } } /> );

		expect(
			await screen.findByText(
				'example.com can’t be removed yet because it is still being set up.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Remove site' } ) ).toBeDisabled();
	} );
} );
