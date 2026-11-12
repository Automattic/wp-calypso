/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { select } from '@wordpress/data';
import { DataViews } from '@wordpress/dataviews';
import { store as noticesStore } from '@wordpress/notices';
import { render } from '../../../test-utils';
import { DomainCardsLayout } from '../domain-cards';
import type { DomainSummary } from '@automattic/api-core';
import type { Action, Field, ViewGrid } from '@wordpress/dataviews';

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
];

const view: ViewGrid = {
	type: 'grid',
	titleField: 'domain',
	fields: [ 'expiry', 'blog_name' ],
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
			empty={ <p>Nothing found</p> }
		>
			<DomainCardsLayout data={ data } fields={ fields } actions={ actions } view={ view } />
		</DataViews>,
		{ queryClient }
	);
}

const getFooterLabels = () =>
	within( screen.getByRole( 'group', { name: 'example.com' } ) )
		.getAllByRole( 'button' )
		.flatMap( ( button ) => button.textContent || [] );

describe( '<DomainCardsLayout>', () => {
	test( 'shows only the fields in the view, in the view’s order', async () => {
		renderCards( [] );

		await screen.findByText( 'Paid until' );
		const labels = screen.getAllByRole( 'term' ).map( ( term ) => term.textContent );
		expect( labels ).toEqual( [ 'Paid until', 'Site' ] );
		expect( screen.queryByText( 'Hidden value' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the domain name as a heading rather than a link', async () => {
		renderCards( [] );

		expect( await screen.findByRole( 'heading', { name: 'example.com', level: 3 } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'example.com' } ) ).not.toBeInTheDocument();
	} );

	test( 'names the card after its domain and ties its actions to it', async () => {
		renderCards( [ { id: 'manage-domain', label: () => 'Settings', callback: jest.fn() } ] );

		const card = await screen.findByRole( 'group', { name: 'example.com' } );

		expect(
			within( card ).getByRole( 'button', { name: 'Settings' } )
		).toHaveAccessibleDescription( 'example.com' );
	} );

	test( 'shows the domain’s type under the title', async () => {
		renderCards(
			[],
			[
				{
					...domain,
					subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'From the API' },
				} as DomainSummary,
			]
		);

		expect( await screen.findByText( 'Connected domain name' ) ).toBeVisible();
	} );

	test( 'adds "Change primary" to the footer when the domain can use it', async () => {
		const changePrimary = jest.fn();
		renderCards( [
			{ id: 'manage-domain', label: () => 'Settings', callback: jest.fn() },
			{ id: 'manage-dns-settings', label: 'Manage DNS', callback: jest.fn() },
			{
				id: 'change-primary-domain',
				isPrimary: true,
				label: 'Change primary',
				callback: changePrimary,
			},
		] );
		const user = userEvent.setup();

		await screen.findByRole( 'button', { name: 'Settings' } );
		expect( getFooterLabels() ).toEqual( [ 'Settings', 'DNS', 'Change primary' ] );
		expect( screen.queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Change primary' } ) );
		expect( changePrimary ).toHaveBeenCalledWith( [ domain ], expect.anything() );
	} );

	test( 'puts Settings and DNS in the footer of an active domain, in that order', async () => {
		const settings = jest.fn();
		const dns = jest.fn();
		renderCards( [
			{ id: 'renew', isPrimary: true, label: 'Renew', callback: jest.fn() },
			{ id: 'manage-domain', isPrimary: true, label: () => 'Settings', callback: settings },
			{ id: 'manage-dns-settings', label: 'Manage DNS', callback: dns },
			{ id: 'ineligible', label: 'Ineligible', callback: jest.fn(), isEligible: () => false },
		] );
		const user = userEvent.setup();

		const settingsButton = await screen.findByRole( 'button', { name: 'Settings' } );
		expect( getFooterLabels() ).toEqual( [ 'Settings', 'DNS' ] );
		expect( screen.queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();

		await user.click( settingsButton );
		await user.click( screen.getByRole( 'button', { name: 'DNS' } ) );
		expect( settings ).toHaveBeenCalledWith( [ domain ], expect.anything() );
		expect( dns ).toHaveBeenCalledWith( [ domain ], expect.anything() );
	} );

	test( 'swaps DNS for Renew in the footer of an expired domain', async () => {
		const expiredDomain = { ...domain, expired: true } as DomainSummary;
		const renew = jest.fn();
		renderCards(
			[
				{ id: 'renew', isPrimary: true, label: 'Renew', callback: renew },
				{ id: 'manage-domain', isPrimary: true, label: () => 'Settings', callback: jest.fn() },
				{ id: 'manage-dns-settings', label: 'Manage DNS', callback: jest.fn() },
			],
			[ expiredDomain ]
		);
		const user = userEvent.setup();

		const renewButton = await screen.findByRole( 'button', { name: 'Renew' } );
		expect( getFooterLabels() ).toEqual( [ 'Settings', 'Renew' ] );
		expect( screen.queryByRole( 'button', { name: 'DNS' } ) ).not.toBeInTheDocument();

		await user.click( renewButton );
		expect( renew ).toHaveBeenCalledWith( [ expiredDomain ], expect.anything() );
	} );

	test( 'leaves DNS out of the footer when the domain is not eligible for it', async () => {
		renderCards( [
			{ id: 'manage-domain', label: () => 'Settings', callback: jest.fn() },
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

	test( 'shows an error when an action throws', async () => {
		renderCards( [
			{
				id: 'manage-domain',
				label: () => 'Settings',
				callback: () => {
					throw new Error( 'Action failed' );
				},
			},
		] );
		const user = userEvent.setup();

		await user.click( await screen.findByRole( 'button', { name: 'Settings' } ) );

		expect( select( noticesStore ).getNotices() ).toEqual( [
			expect.objectContaining( {
				status: 'error',
				content: 'Something went wrong. Please try again.',
			} ),
		] );
	} );

	test( 'gives the title the full domain name, which can be truncated', async () => {
		renderCards( [] );

		expect( await screen.findByRole( 'heading', { name: 'example.com' } ) ).toHaveAttribute(
			'title',
			'example.com'
		);
	} );

	test( 'renders the empty state when there are no domains', async () => {
		renderCards( [], [] );

		expect( await screen.findByText( 'Nothing found' ) ).toBeVisible();
	} );
} );
