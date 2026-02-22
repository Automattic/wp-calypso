/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainDns from '../index';

const domainName = 'example.com';

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
} );
