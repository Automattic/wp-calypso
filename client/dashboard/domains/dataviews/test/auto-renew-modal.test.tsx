/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { AutoRenewModal } from '../auto-renew-modal';
import type { DomainSummary } from '@automattic/api-core';

const getMockedDomain = ( customProps: Partial< DomainSummary > = {} ): DomainSummary =>
	( {
		domain: 'example.com',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
		auto_renewing: false,
		expired: false,
		expiry: '2027-01-01',
		subscription_id: '100',
		is_domain_only_site: false,
		domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
		...customProps,
	} ) as DomainSummary;

const mockPurchases = ( purchases: { ID: number; is_rechargeable: boolean }[] ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases );

const mockBulkAction = ( expectedAutoRenew: boolean ) =>
	nock( 'https://public-api.wordpress.com' )
		.post( '/wpcom/v2/domains/bulk-actions/set-auto-renew', ( body ) => {
			expect( body ).toEqual( {
				domains: [ 'example.com', 'another.com' ],
				auto_renew: expectedAutoRenew,
			} );
			return true;
		} )
		.reply( 200, {} );

const domains = [
	getMockedDomain(),
	getMockedDomain( { domain: 'another.com', subscription_id: '200' } ),
];

describe( '<AutoRenewModal>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/domains/bulk-actions' )
			.query( true )
			.reply( 200, {} )
			.persist();
	} );

	test( 'enables auto-renew when every domain has a payment method', async () => {
		const user = userEvent.setup();
		mockPurchases( [
			{ ID: 100, is_rechargeable: true },
			{ ID: 200, is_rechargeable: true },
		] );
		const scope = mockBulkAction( true );
		const onSuccess = jest.fn();

		render( <AutoRenewModal items={ domains } onSuccess={ onSuccess } /> );

		await user.click( screen.getByRole( 'checkbox', { name: 'Auto-renew selected domains' } ) );

		const saveButton = screen.getByRole( 'button', { name: 'Save settings' } );
		await waitFor( () => expect( saveButton ).toBeEnabled() );
		expect( screen.queryByText( /no payment method on file/ ) ).not.toBeInTheDocument();

		await user.click( saveButton );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( onSuccess ).toHaveBeenCalled() );
	} );

	test( 'asks for a payment method before enabling auto-renew on a domain without one', async () => {
		const user = userEvent.setup();
		mockPurchases( [
			{ ID: 100, is_rechargeable: true },
			{ ID: 200, is_rechargeable: false },
		] );

		render( <AutoRenewModal items={ domains } onSuccess={ jest.fn() } /> );

		await user.click( screen.getByRole( 'checkbox', { name: 'Auto-renew selected domains' } ) );

		expect( await screen.findByText( 'This domain has no payment method on file' ) ).toBeVisible();
		expect( screen.getAllByText( 'another.com' ) ).toHaveLength( 2 );
		expect( screen.getAllByText( 'example.com' ) ).toHaveLength( 1 );

		expect( screen.getByRole( 'link', { name: 'Add a payment method' } ) ).toBeVisible();

		expect( screen.getByRole( 'button', { name: 'Save settings' } ) ).toBeDisabled();
	} );

	test( 'asks for a payment method when several domains have none', async () => {
		const user = userEvent.setup();
		mockPurchases( [
			{ ID: 100, is_rechargeable: false },
			{ ID: 200, is_rechargeable: false },
		] );

		render( <AutoRenewModal items={ domains } onSuccess={ jest.fn() } /> );

		await user.click( screen.getByRole( 'checkbox', { name: 'Auto-renew selected domains' } ) );

		expect(
			await screen.findByText( 'These domains have no payment method on file' )
		).toBeVisible();

		expect( screen.getByRole( 'link', { name: 'Add a payment method' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Save settings' } ) ).toBeDisabled();
	} );

	test( 'still allows disabling auto-renew on a domain without a payment method', async () => {
		const user = userEvent.setup();
		mockPurchases( [
			{ ID: 100, is_rechargeable: false },
			{ ID: 200, is_rechargeable: false },
		] );
		const scope = mockBulkAction( false );

		render(
			<AutoRenewModal
				items={ domains.map( ( domain ) => ( { ...domain, auto_renewing: true } ) ) }
				onSuccess={ jest.fn() }
			/>
		);

		expect(
			await screen.findByText( 'These domains have no payment method on file' )
		).toBeVisible();

		await user.click( screen.getByRole( 'checkbox', { name: 'Auto-renew selected domains' } ) );

		expect( screen.queryByText( /no payment method on file/ ) ).not.toBeInTheDocument();
		const saveButton = screen.getByRole( 'button', { name: 'Save settings' } );
		expect( saveButton ).toBeEnabled();

		await user.click( saveButton );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );
} );
