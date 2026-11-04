/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataViews } from '@wordpress/dataviews';
import { render } from '../../../test-utils';
import { DomainCardsLayout } from '../domain-cards';
import type { DomainSummary } from '@automattic/api-core';
import type { Action, Field, View } from '@wordpress/dataviews';

const domain = {
	domain: 'example.com',
	blog_id: 1,
	blog_name: 'Test site',
	expiry: '2030-01-01',
	subscription_id: 'sub-1',
	subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
	domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
} as unknown as DomainSummary;

const fields: Field< DomainSummary >[] = [
	{ id: 'domain', label: 'Domain name', enableHiding: false },
	{ id: 'blog_name', label: 'Site', render: ( { item } ) => <span>{ item.blog_name }</span> },
	{ id: 'expiry', label: 'Paid until', render: ( { item } ) => <span>{ item.expiry }</span> },
	{ id: 'hidden', label: 'Hidden field', render: () => <span>Hidden value</span> },
	{ id: 'empty', label: 'Empty field', render: () => null },
];

const view: View = {
	type: 'grid',
	titleField: 'domain',
	fields: [ 'expiry', 'blog_name', 'empty' ],
};

function renderCards( actions: Action< DomainSummary >[], data = [ domain ] ) {
	const queryClient = new QueryClient();
	queryClient.setQueryData( sslDetailsQuery( domain.domain ).queryKey, {
		certificate_provisioned: true,
	} as never );

	return render(
		<DataViews< DomainSummary >
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ jest.fn() }
			paginationInfo={ { totalItems: data.length, totalPages: 1 } }
			defaultLayouts={ { table: {}, grid: {} } }
			getItemId={ ( item ) => item.domain }
		>
			<DomainCardsLayout
				data={ data }
				fields={ fields }
				actions={ actions }
				view={ view }
				empty={ <p>Nothing found</p> }
			/>
		</DataViews>,
		{ queryClient }
	);
}

// Menu items exist before the popover has positioned itself, so these tests don't assert visibility.
describe( '<DomainCardsLayout>', () => {
	test( 'shows only the fields in the view, in the view’s order', async () => {
		renderCards( [] );

		await screen.findByText( 'Paid until' );
		const labels = screen.getAllByRole( 'term' ).map( ( term ) => term.textContent );
		expect( labels ).toEqual( [ 'Paid until', 'Site', 'Empty field' ] );
		expect( screen.queryByText( 'Hidden value' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the domain name as a heading rather than a link', async () => {
		renderCards( [] );

		expect( await screen.findByRole( 'heading', { name: 'example.com', level: 3 } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'example.com' } ) ).not.toBeInTheDocument();
	} );

	test( 'names the card after its domain and ties its actions to it', async () => {
		renderCards( [
			{ id: 'manage-domain', label: () => 'View settings', callback: jest.fn() },
			{ id: 'add-mailbox', label: 'Add mailbox', callback: jest.fn() },
		] );

		const card = await screen.findByRole( 'group', { name: 'example.com' } );

		expect(
			within( card ).getByRole( 'button', { name: 'Settings' } )
		).toHaveAccessibleDescription( 'example.com' );
		expect( within( card ).getByRole( 'button', { name: 'Actions' } ) ).toHaveAccessibleDescription(
			'example.com'
		);
	} );

	test( 'shows the subtype under the title of a domain that is not a registration', async () => {
		renderCards(
			[],
			[
				{
					...domain,
					subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain name connection' },
				} as DomainSummary,
			]
		);

		expect( await screen.findByText( 'Domain name connection' ) ).toBeVisible();
	} );

	test( 'puts Settings and DNS in the footer of an active domain, in that order', async () => {
		const settings = jest.fn();
		const dns = jest.fn();
		renderCards( [
			{ id: 'renew', isPrimary: true, label: 'Renew', callback: jest.fn() },
			{ id: 'manage-domain', isPrimary: true, label: () => 'View settings', callback: settings },
			{ id: 'manage-dns-settings', label: 'Manage DNS', callback: dns },
			{ id: 'add-mailbox', label: 'Add mailbox', callback: jest.fn() },
			{ id: 'ineligible', label: 'Ineligible', callback: jest.fn(), isEligible: () => false },
		] );
		const user = userEvent.setup();

		const settingsButton = await screen.findByRole( 'button', { name: 'Settings' } );
		const buttons = screen.getAllByRole( 'button' ).map( ( button ) => button.textContent );
		expect( buttons.slice( -2 ) ).toEqual( [ 'Settings', 'DNS' ] );

		await user.click( settingsButton );
		await user.click( screen.getByRole( 'button', { name: 'DNS' } ) );
		expect( settings ).toHaveBeenCalledWith( [ domain ], expect.anything() );
		expect( dns ).toHaveBeenCalledWith( [ domain ], expect.anything() );

		await user.click( screen.getByRole( 'button', { name: 'Actions' } ) );
		const menu = await screen.findByRole( 'menu' );
		expect( within( menu ).getByRole( 'menuitem', { name: 'Add mailbox' } ) ).toBeInTheDocument();
		expect( within( menu ).getByRole( 'menuitem', { name: 'Renew' } ) ).toBeInTheDocument();
		expect(
			within( menu ).queryByRole( 'menuitem', { name: 'Ineligible' } )
		).not.toBeInTheDocument();
	} );

	test( 'swaps DNS for Renew in the footer of an expired domain', async () => {
		const expiredDomain = { ...domain, expired: true } as DomainSummary;
		const renew = jest.fn();
		renderCards(
			[
				{ id: 'renew', isPrimary: true, label: 'Renew', callback: renew },
				{ id: 'manage-domain', isPrimary: true, label: () => 'View settings', callback: jest.fn() },
				{ id: 'manage-dns-settings', label: 'Manage DNS', callback: jest.fn() },
			],
			[ expiredDomain ]
		);
		const user = userEvent.setup();

		const renewButton = await screen.findByRole( 'button', { name: 'Renew' } );
		const buttons = screen.getAllByRole( 'button' ).map( ( button ) => button.textContent );
		expect( buttons.slice( -2 ) ).toEqual( [ 'Settings', 'Renew' ] );
		expect( screen.queryByRole( 'button', { name: 'DNS' } ) ).not.toBeInTheDocument();

		await user.click( renewButton );
		expect( renew ).toHaveBeenCalledWith( [ expiredDomain ], expect.anything() );

		await user.click( screen.getByRole( 'button', { name: 'Actions' } ) );
		const menu = await screen.findByRole( 'menu' );
		expect( within( menu ).getByRole( 'menuitem', { name: 'Manage DNS' } ) ).toBeInTheDocument();
	} );

	test( 'keeps Renew in the menu for a domain that has not expired', async () => {
		renderCards( [ { id: 'renew', isPrimary: true, label: 'Renew', callback: jest.fn() } ] );
		const user = userEvent.setup();

		const menuToggle = await screen.findByRole( 'button', { name: 'Actions' } );
		expect( screen.queryByRole( 'button', { name: 'Renew' } ) ).not.toBeInTheDocument();
		await user.click( menuToggle );

		expect( await screen.findByRole( 'menuitem', { name: 'Renew' } ) ).toBeInTheDocument();
	} );

	test( 'leaves DNS out of the footer when the domain is not eligible for it', async () => {
		renderCards( [
			{ id: 'manage-domain', label: () => 'View settings', callback: jest.fn() },
			{
				id: 'manage-dns-settings',
				label: 'Manage DNS',
				callback: jest.fn(),
				isEligible: () => false,
			},
		] );

		await screen.findByRole( 'button', { name: 'Settings' } );
		expect( screen.queryByRole( 'button', { name: 'DNS' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the action’s own label for a transfer, which does not go to its settings', async () => {
		renderCards(
			[ { id: 'manage-domain', label: () => 'View transfer', callback: jest.fn() } ],
			[
				{
					...domain,
					subtype: { id: DomainSubtype.DOMAIN_TRANSFER, label: 'Domain name transfer' },
				} as DomainSummary,
			]
		);

		expect( await screen.findByRole( 'button', { name: 'View transfer' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Settings' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps connection setup in the menu', async () => {
		renderCards( [ { id: 'setup', isPrimary: true, label: 'Set up', callback: jest.fn() } ] );
		const user = userEvent.setup();

		const menuToggle = await screen.findByRole( 'button', { name: 'Actions' } );
		expect( screen.queryByRole( 'button', { name: 'Set up' } ) ).not.toBeInTheDocument();
		await user.click( menuToggle );

		expect( await screen.findByRole( 'menuitem', { name: 'Set up' } ) ).toBeInTheDocument();
	} );

	test( 'opens modal actions in a modal', async () => {
		renderCards( [
			{
				id: 'manage-auto-renew',
				label: 'Manage auto-renew',
				RenderModal: () => <p>Modal content</p>,
			},
		] );
		const user = userEvent.setup();

		await user.click( await screen.findByRole( 'button', { name: 'Actions' } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Manage auto-renew' } ) );

		expect( await screen.findByText( 'Modal content' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		await waitFor( () => expect( screen.queryByText( 'Modal content' ) ).not.toBeInTheDocument() );
	} );

	test( 'does not run a disabled menu action', async () => {
		const callback = jest.fn();
		renderCards( [ { id: 'add-mailbox', label: 'Add mailbox', callback, disabled: true } ] );
		const user = userEvent.setup();

		await user.click( await screen.findByRole( 'button', { name: 'Actions' } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Add mailbox' } ) );

		expect( callback ).not.toHaveBeenCalled();
	} );

	test( 'hides the menu when no actions are left for it', async () => {
		renderCards( [ { id: 'manage-domain', label: () => 'View settings', callback: jest.fn() } ] );

		await screen.findByRole( 'button', { name: 'Settings' } );
		expect( screen.queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders the empty state when there are no domains', async () => {
		renderCards( [], [] );

		expect( await screen.findByText( 'Nothing found' ) ).toBeVisible();
	} );
} );
