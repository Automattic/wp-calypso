/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { domainQuery, mailboxAccountsQuery, siteByIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import Actions from '../actions';
import FeaturedCardEmails from '../featured-card-emails';
import FeaturedCardPrivacy from '../featured-card-privacy';
import FeaturedCardRenew from '../featured-card-renew';
import FeaturedCardSite from '../featured-card-site';
import DomainOverviewSettings from '../settings';

jest.mock( '../../../app/router/domains', () => ( {
	...jest.requireActual( '../../../app/router/domains' ),
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
	privacy_available: true,
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
	test.each( [
		[ 'site', FeaturedCardSite, /My site/ ],
		[ 'emails', FeaturedCardEmails, /Add mailbox/ ],
		[ 'renew', FeaturedCardRenew, /Expires/ ],
		[ 'privacy', FeaturedCardPrivacy, /WHOIS Privacy/ ],
	] )( 'tracks a click on the %s card', async ( item, Card, name ) => {
		const { recordTracksEvent } = renderSeeded( <Card domain={ domain } /> );

		await userEvent.click( await screen.findByRole( 'link', { name } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( ...eventFor( item ) );
	} );

	test( 'leaves a privacy card without a link static', async () => {
		renderSeeded( <FeaturedCardPrivacy domain={ domain } isDisabled /> );

		expect( await screen.findByText( 'WHOIS Privacy' ) ).toBeVisible();
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'tracks a settings row activated with the keyboard', async () => {
		const { recordTracksEvent } = renderSeeded(
			<DomainOverviewSettings domain={ domain } domainDiagnostics={ undefined } />
		);

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
