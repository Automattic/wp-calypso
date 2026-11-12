/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { domainQuery, mailboxAccountsQuery, siteByIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import Actions from '../actions';
import DomainOverviewRegistration from '../registration';
import DomainOverviewSettings from '../settings';

vi.mock( '../../../app/router/domains', async () => ( {
	...( await vi.importActual< typeof import( '../../../app/router/domains' ) >(
		'../../../app/router/domains'
	) ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

const domain = {
	domain: 'example.com',
	blog_id: 123,
	subscription_id: '456',
	expiry: '2030-01-01',
	subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
	can_manage_dns_records: true,
	current_user_can_manage: true,
	current_user_is_owner: true,
} as Domain;

function renderSeeded( ui: React.ReactElement ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( domainQuery( domain.domain ).queryKey, domain );
	queryClient.setQueryData( siteByIdQuery( domain.blog_id ).queryKey, {
		name: 'My site',
		slug: 'example.wordpress.com',
		site_migration: {},
	} as never );
	queryClient.setQueryData( mailboxAccountsQuery( domain.blog_id, domain.domain ).queryKey, [] );
	return render( ui, { queryClient } );
}

const eventFor = ( item: string ) => [
	'calypso_dashboard_domain_overview_item_click',
	{ item, subtype: DomainSubtype.DOMAIN_REGISTRATION, domain: domain.domain },
];

describe( 'domain overview item tracking', () => {
	const settings = <DomainOverviewSettings domain={ domain } domainDiagnostics={ undefined } />;
	const registration = <DomainOverviewRegistration domain={ domain } />;

	test.each( [
		[ 'emails', settings, /Professional email/ ],
		[ 'renew', registration, /Renewal & billing/ ],
		[ 'contact-details', registration, /Contact details & privacy/ ],
	] )( 'tracks a click on the %s row', async ( item, ui, name ) => {
		const { recordTracksEvent } = renderSeeded( ui );

		await userEvent.click( await screen.findByRole( 'link', { name } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( ...eventFor( item ) );
	} );

	test( 'tracks a settings row activated with the keyboard', async () => {
		const { recordTracksEvent } = renderSeeded( settings );

		( await screen.findByRole( 'link', { name: /DNS records/ } ) ).focus();
		await userEvent.keyboard( '{Enter}' );

		expect( recordTracksEvent ).toHaveBeenCalledWith( ...eventFor( 'dns' ) );
	} );

	test( 'tracks Detach and still opens its dialog', async () => {
		const { recordTracksEvent } = renderSeeded( <Actions /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Detach' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( ...eventFor( 'action-disconnect' ) );
		expect( await screen.findByRole( 'dialog' ) ).toBeVisible();
	} );

	test( 'tracks the Transfer action', async () => {
		const { recordTracksEvent } = renderSeeded( <Actions /> );

		await userEvent.click( await screen.findByRole( 'link', { name: 'Transfer' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( ...eventFor( 'action-transfer' ) );
	} );
} );
