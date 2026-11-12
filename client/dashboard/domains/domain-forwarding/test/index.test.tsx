/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain, type DomainForwarding } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainForwardingList from '../index';

const domainName = 'example.com';

const mockHasEnTranslation = jest.fn( () => true );
jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	useHasEnTranslation: () => mockHasEnTranslation,
} ) );

jest.mock( '../../../app/router/domains', () => ( {
	...jest.requireActual( '../../../app/router/domains' ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

afterEach( () => mockHasEnTranslation.mockReturnValue( true ) );

const mockApiRequests = ( forwardings: DomainForwarding[] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }/` )
		.reply( 200, {
			domain: domainName,
			has_wpcom_nameservers: true,
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		} as Domain );
	nock( 'https://public-api.wordpress.com' )
		.get( /\/sites\/all\/domain\/example\.com\/redirects/ )
		.query( true )
		.reply( 200, forwardings );
};

test( 'describes each forward in plain words under its destination', async () => {
	mockApiRequests( [
		{
			domain_redirect_id: 1,
			domain: domainName,
			subdomain: 'news',
			fqdn: `news.${ domainName }`,
			target_host: 'news.example.org',
			is_secure: true,
			is_permanent: true,
			forward_paths: true,
		},
		{
			domain_redirect_id: 2,
			domain: domainName,
			subdomain: 'shop',
			fqdn: `shop.${ domainName }`,
			target_host: 'shop.example.org',
			is_secure: true,
			is_permanent: false,
			forward_paths: false,
		},
	] as DomainForwarding[] );

	render( <DomainForwardingList /> );

	expect( await screen.findByText( 'https://news.example.org' ) ).toBeVisible();
	expect(
		screen.getByText( 'Permanent forward. Visitors land on the matching page.' )
	).toBeVisible();
	expect( screen.getByText( 'https://shop.example.org' ) ).toBeVisible();
	expect(
		screen.getByText( 'Temporary forward. Everyone lands on the same address.' )
	).toBeVisible();
} );

test.each( [
	[ true, 'Add domain forwarding' ],
	[ false, 'Add forwarding' ],
] )(
	'labels the add button, falling back to the old copy until translated (translated: %s)',
	async ( hasTranslation, label ) => {
		mockHasEnTranslation.mockReturnValue( hasTranslation );
		mockApiRequests( [] );

		render( <DomainForwardingList /> );

		expect( await screen.findByRole( 'link', { name: label } ) ).toBeVisible();
	}
);
