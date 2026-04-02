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
} );
