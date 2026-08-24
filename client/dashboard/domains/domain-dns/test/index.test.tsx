/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain, type DnsRecord } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainDns from '../index';

const domainName = 'example.com';

const dnsQueryKey = [ 'domains', domainName, 'dns' ];

const CNAME_WARNING = 'Your domain is not using the default WWW CNAME record';

const defaultCnameRecord: DnsRecord = {
	type: 'CNAME',
	name: 'www',
	data: `${ domainName }.`,
};

jest.mock( '../../../app/router/domains', () => ( {
	...jest.requireActual( '../../../app/router/domains' ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

const getDefaultDomainData = ( customProps: Partial< Domain > = {} ): Domain =>
	( {
		domain: domainName,
		has_wpcom_nameservers: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} ) as Domain;

const mockDomainApiRequest = ( domainData: Domain ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.reply( 200, domainData );

const mockDnsApiRequest = ( records: DnsRecord[] ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/domains/${ domainName }/dns` )
		.reply( 200, { records } );

// Mocks the DNS request but holds the response pending until the returned
// `release` callback is invoked, letting tests assert on the in-flight state
// without relying on `nock.delay()` (which leaves open handles).
const mockDnsApiRequestPending = ( records: DnsRecord[] ) => {
	let release!: () => void;
	const pending = new Promise< void >( ( resolve ) => {
		release = resolve;
	} );
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/domains/${ domainName }/dns` )
		.reply( 200, () => pending.then( () => ( { records } ) ) );
	return release;
};

describe( 'DomainDns', () => {
	test( 'shows EmailSetup when domain has WordPress.com nameservers', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: true } ) );

		render( <DomainDns /> );

		expect( await screen.findByText( 'Email setup' ) ).toBeVisible();
	} );

	test( 'hides EmailSetup when domain does not have WordPress.com nameservers', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: false } ) );

		render( <DomainDns /> );

		expect( await screen.findByText( 'Add record' ) ).toBeVisible();
		expect( screen.queryByText( 'Email setup' ) ).not.toBeInTheDocument();
	} );

	test( 'does not flash the WWW CNAME warning while DNS records are still loading', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: true } ) );
		// The domain already has the default WWW CNAME record, so the warning must
		// never appear — not even during the window where the DNS query is loading.
		const release = mockDnsApiRequestPending( [ defaultCnameRecord ] );

		render( <DomainDns /> );

		// The page chrome renders once the domain (suspense) query resolves, but the
		// DNS query is still in flight at this point.
		await screen.findByText( 'Add record' );
		expect( screen.queryByText( CNAME_WARNING ) ).not.toBeInTheDocument();

		// Once the DNS records load, the warning still must not appear.
		release();
		expect( await screen.findByText( 'CNAME' ) ).toBeVisible();
		expect( screen.queryByText( CNAME_WARNING ) ).not.toBeInTheDocument();
	} );

	test( 'does not flash the WWW CNAME warning when the route loader seeded stale records', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: true } ) );

		// In production the route loader prefetches the DNS query via
		// `ensureQueryData`, so the cache already holds records (possibly stale) when
		// the component mounts and `isLoading` is false. With `staleTime: 0` a
		// background refetch then runs. Seed the cache with stale records that lack
		// the default WWW CNAME record to mirror that scenario.
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false, staleTime: 0 } },
		} );
		queryClient.setQueryData( dnsQueryKey, { records: [] } );

		// The server actually has the default WWW CNAME record, so the warning must
		// never appear — not even while the background refetch is in flight over the
		// stale records.
		const release = mockDnsApiRequestPending( [ defaultCnameRecord ] );

		render( <DomainDns />, { queryClient } );

		await screen.findByText( 'Add record' );
		expect( screen.queryByText( CNAME_WARNING ) ).not.toBeInTheDocument();

		release();
		expect( await screen.findByText( 'CNAME' ) ).toBeVisible();
		expect( screen.queryByText( CNAME_WARNING ) ).not.toBeInTheDocument();
	} );

	test( 'shows the WWW CNAME warning when the default record is missing', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: true } ) );
		// No default WWW CNAME record present, so the warning is expected after load.
		mockDnsApiRequest( [ { type: 'A', name: domainName, data: '192.0.2.1' } ] );

		render( <DomainDns /> );

		expect( await screen.findByText( CNAME_WARNING ) ).toBeVisible();
	} );
} );
