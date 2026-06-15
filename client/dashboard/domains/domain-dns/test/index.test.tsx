/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain, type DnsRecord } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainDns from '../index';

const domainName = 'example.com';

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

const mockDnsApiRequest = ( records: DnsRecord[], { delayMs = 0 }: { delayMs?: number } = {} ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/domains/${ domainName }/dns` )
		.delay( delayMs )
		.reply( 200, { records } );

afterEach( () => nock.cleanAll() );

describe( 'DomainDns', () => {
	test( 'shows EmailSetup when domain has WordPress.com nameservers', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: true } ) );

		render( <DomainDns /> );

		expect( await screen.findByText( 'Email setup' ) ).toBeInTheDocument();
	} );

	test( 'hides EmailSetup when domain does not have WordPress.com nameservers', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: false } ) );

		render( <DomainDns /> );

		expect( await screen.findByText( 'Add record' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Email setup' ) ).not.toBeInTheDocument();
	} );

	test( 'does not flash the WWW CNAME warning while DNS records are still loading', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: true } ) );
		// The domain already has the default WWW CNAME record, so the warning must
		// never appear — not even during the window where the DNS query is loading.
		mockDnsApiRequest( [ defaultCnameRecord ], { delayMs: 200 } );

		render( <DomainDns /> );

		// The page chrome renders once the domain (suspense) query resolves, but the
		// DNS query is still in flight at this point.
		await screen.findByText( 'Add record' );
		expect( screen.queryByText( CNAME_WARNING ) ).not.toBeInTheDocument();

		// Once the DNS records load, the warning still must not appear.
		expect( await screen.findByText( 'CNAME' ) ).toBeInTheDocument();
		expect( screen.queryByText( CNAME_WARNING ) ).not.toBeInTheDocument();
	} );

	test( 'shows the WWW CNAME warning when the default record is missing', async () => {
		mockDomainApiRequest( getDefaultDomainData( { has_wpcom_nameservers: true } ) );
		// No default WWW CNAME record present, so the warning is expected after load.
		mockDnsApiRequest( [ { type: 'A', name: domainName, data: '192.0.2.1' } ] );

		render( <DomainDns /> );

		expect( await screen.findByText( CNAME_WARNING ) ).toBeInTheDocument();
	} );
} );
