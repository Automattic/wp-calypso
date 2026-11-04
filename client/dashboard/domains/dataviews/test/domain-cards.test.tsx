/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
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

	test( 'shows renewal inline when the domain is close to lapsing and the rest in a menu', async () => {
		const expiringDomain = {
			...domain,
			domain_status: { id: DomainStatus.EXPIRING_SOON, label: 'Expiring soon', type: 'warning' },
		} as DomainSummary;
		const renew = jest.fn();
		const dns = jest.fn();
		renderCards(
			[
				{ id: 'renew', isPrimary: true, label: 'Renew', callback: renew },
				{ id: 'manage-domain', isPrimary: true, label: () => 'View settings', callback: jest.fn() },
				{ id: 'manage-dns-settings', label: 'Manage DNS', callback: dns },
				{ id: 'ineligible', label: 'Ineligible', callback: jest.fn(), isEligible: () => false },
			],
			[ expiringDomain ]
		);
		const user = userEvent.setup();

		await user.click( await screen.findByRole( 'button', { name: 'Renew' } ) );
		expect( renew ).toHaveBeenCalledWith( [ expiringDomain ], expect.anything() );

		await user.click( screen.getByRole( 'button', { name: 'Actions' } ) );
		const menu = await screen.findByRole( 'menu' );
		expect( within( menu ).getByRole( 'menuitem', { name: 'View settings' } ) ).toBeInTheDocument();
		expect( within( menu ).queryByRole( 'menuitem', { name: 'Renew' } ) ).not.toBeInTheDocument();
		expect(
			within( menu ).queryByRole( 'menuitem', { name: 'Ineligible' } )
		).not.toBeInTheDocument();

		await user.click( within( menu ).getByRole( 'menuitem', { name: 'Manage DNS' } ) );
		expect( dns ).toHaveBeenCalledWith( [ expiringDomain ], expect.anything() );
	} );

	test( 'keeps renewal in the menu for a domain that is not close to lapsing', async () => {
		renderCards( [ { id: 'renew', isPrimary: true, label: 'Renew', callback: jest.fn() } ] );
		const user = userEvent.setup();

		await user.click( await screen.findByRole( 'button', { name: 'Actions' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Renew' } ) ).toBeInTheDocument();
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
	} );

	test( 'hides the menu when no actions are left for it', async () => {
		const expiringDomain = {
			...domain,
			domain_status: { id: DomainStatus.EXPIRED, label: 'Expired', type: 'error' },
		} as DomainSummary;
		renderCards(
			[ { id: 'renew', isPrimary: true, label: 'Renew', callback: jest.fn() } ],
			[ expiringDomain ]
		);

		await screen.findByRole( 'button', { name: 'Renew' } );
		expect( screen.queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders the empty state when there are no domains', async () => {
		renderCards( [], [] );

		expect( await screen.findByText( 'Nothing found' ) ).toBeVisible();
	} );
} );
