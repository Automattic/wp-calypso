/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import JetpackSiteDisconnect from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 123,
	slug: 'my-jetpack-site.example.com',
	name: 'My Jetpack Site',
	URL: 'https://my-jetpack-site.example.com',
	jetpack: true,
	jetpack_connection: true,
	is_wpcom_atomic: false,
} as Site;

function mockPurchases( purchases: object[] = [] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: site.ID } )
		.reply( 200, purchases );
}

function mockDisconnect() {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.1/jetpack-blogs/${ site.ID }/mine/delete` )
		.reply( 200, {} );
}

const renderContent = ( onClose = jest.fn() ) =>
	render( <JetpackSiteDisconnect site={ site } onClose={ onClose } /> );

describe( '<JetpackSiteDisconnect>', () => {
	test( 'disconnect button is disabled until the correct domain is typed', async () => {
		const user = userEvent.setup();
		mockPurchases();
		renderContent();

		const button = await screen.findByRole( 'button', { name: 'Disconnect site' } );
		expect( button ).toBeDisabled();

		await user.type(
			screen.getByRole( 'textbox', { name: 'Type the site domain to confirm' } ),
			'wrong-domain.com'
		);
		expect( button ).toBeDisabled();

		await user.clear( screen.getByRole( 'textbox', { name: 'Type the site domain to confirm' } ) );
		await user.type(
			screen.getByRole( 'textbox', { name: 'Type the site domain to confirm' } ),
			'my-jetpack-site.example.com'
		);
		expect( button ).toBeEnabled();
	} );

	test( 'shows purchase warning when site has Jetpack purchases', async () => {
		mockPurchases( [
			{
				ID: 1,
				is_jetpack_plan_or_product: true,
				subscription_status: 'active',
			},
		] );
		renderContent();

		expect(
			await screen.findByText( /active Jetpack subscription that will continue to be billed/ )
		).toBeVisible();
	} );

	test( 'does not show purchase warning when site has no Jetpack purchases', async () => {
		mockPurchases();
		renderContent();

		await screen.findByRole( 'button', { name: 'Disconnect site' } );
		expect( screen.queryByText( /active Jetpack subscription/ ) ).not.toBeInTheDocument();
	} );

	test( 'calls the disconnect endpoint and closes the modal on success', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		mockPurchases();
		const scope = mockDisconnect();

		renderContent( onClose );

		await screen.findByRole( 'button', { name: 'Disconnect site' } );
		await user.type(
			screen.getByRole( 'textbox', { name: 'Type the site domain to confirm' } ),
			'my-jetpack-site.example.com'
		);
		await user.click( screen.getByRole( 'button', { name: 'Disconnect site' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );

		await waitFor( () => {
			expect( onClose ).toHaveBeenCalled();
		} );
	} );
} );
