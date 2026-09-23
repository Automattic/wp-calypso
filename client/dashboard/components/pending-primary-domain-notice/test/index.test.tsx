/**
 * @jest-environment jsdom
 */
import { DomainSubtype } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PendingPrimaryDomainNotice from '../index';

function mockDomainQuery( domainName: string, overrides = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.reply( 200, {
			domain: domainName,
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			can_set_as_primary: true,
			primary_domain: false,
			set_primary_domain_pending: true,
			...overrides,
		} );
}

describe( '<PendingPrimaryDomainNotice>', () => {
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

	test( 'renders nothing when the backend does not report the domain as pending', async () => {
		mockDomainQuery( 'example.com', { set_primary_domain_pending: false } );
		const { container } = render( <PendingPrimaryDomainNotice domainName="example.com" /> );

		await waitFor( () => {
			expect( nock.isDone() ).toBe( true );
		} );
		expect( screen.queryByText( 'Setting up your custom domain' ) ).not.toBeInTheDocument();
		expect( container ).toBeEmptyDOMElement();
	} );
} );
