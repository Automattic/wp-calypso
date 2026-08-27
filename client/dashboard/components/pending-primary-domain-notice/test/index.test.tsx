/**
 * @jest-environment jsdom
 */
import { DomainSubtype } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PendingPrimaryDomainNotice from '../index';

function mockDomainQuery( domainName: string, overrides = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.reply( 200, {
			domain: domainName,
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			can_set_as_primary: true,
			primary_domain: false,
			expired: false,
			blog_id: 1,
			points_to_wpcom: false,
			ssl_status: 'newly_registered',
			registration_date: new Date().toISOString(),
			...overrides,
		} );
}

// The site's primary address is still its included one, so WordPress.com may
// still set a registered domain as primary on its own.
function mockSiteDomains( overrides = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, {
			domains: [
				{
					domain: 'example.com',
					blog_id: 1,
					subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
					primary_domain: false,
					...overrides,
				},
				{
					domain: 'example.wordpress.com',
					blog_id: 1,
					subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Default' },
					primary_domain: true,
				},
			],
		} );
}

describe( '<PendingPrimaryDomainNotice>', () => {
	beforeEach( () => {
		mockSiteDomains();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'renders the notice with the domain name', async () => {
		mockDomainQuery( 'example.com' );
		render( <PendingPrimaryDomainNotice domainName="example.com" /> );

		await waitFor( () => {
			expect( screen.getByText( 'Setting up your custom domain' ) ).toBeVisible();
		} );
		expect( screen.getByText( /example\.com/ ) ).toBeVisible();
		expect( screen.getByText( /primary address/ ) ).toBeVisible();
	} );

	test( 'does not render dismiss button', async () => {
		mockDomainQuery( 'example.com' );
		render( <PendingPrimaryDomainNotice domainName="example.com" /> );

		await waitFor( () => {
			expect( screen.getByText( 'Setting up your custom domain' ) ).toBeVisible();
		} );
		expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing for a non-primary domain that is already set up', async () => {
		const scope = mockDomainQuery( 'example.com', {
			points_to_wpcom: true,
			ssl_status: 'active',
		} );
		render( <PendingPrimaryDomainNotice domainName="example.com" /> );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
		expect( screen.queryByText( 'Setting up your custom domain' ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when the site already has a custom primary address', async () => {
		nock.cleanAll();
		mockSiteDomains( { primary_domain: true } );
		const scope = mockDomainQuery( 'example.com' );
		render( <PendingPrimaryDomainNotice domainName="example.com" /> );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
		expect( screen.queryByText( 'Setting up your custom domain' ) ).not.toBeInTheDocument();
	} );
} );
