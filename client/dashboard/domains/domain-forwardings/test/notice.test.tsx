/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';

const domainName = 'example.com';

afterEach( () => nock.cleanAll() );

test( 'shows warning notice when domain uses external name servers', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.query( true )
		.reply( 200, {
			domain: domainName,
			has_wpcom_nameservers: false, // External name servers
			primary_domain: false,
			is_domain_only_site: true,
		} );

	const TestWrapper = () => {
		const { DomainForwardingNotice } = require( '../notice' );
		return <DomainForwardingNotice domainName={ domainName } />;
	};

	render( <TestWrapper /> );

	await waitFor( () => {
		expect(
			screen.getAllByText( /your domain is using external name servers/i ).length
		).toBeGreaterThan( 0 );
		expect( screen.getAllByText( /update your name servers now/i ).length ).toBeGreaterThan( 0 );
	} );

	// Should be a warning notice
	expect( document.querySelector( '.components-notice' ) ).toHaveClass( 'is-warning' );
} );

test( 'shows info notice when domain is primary domain on non-domain-only site', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.query( true )
		.reply( 200, {
			domain: domainName,
			has_wpcom_nameservers: true, // Uses WordPress.com name servers
			primary_domain: true, // Is primary domain
			is_domain_only_site: false, // Not domain-only site
			site_slug: 'test-site',
		} );

	const TestWrapper = () => {
		const { DomainForwardingNotice } = require( '../notice' );
		return <DomainForwardingNotice domainName={ domainName } />;
	};

	render( <TestWrapper /> );

	await waitFor( () => {
		expect(
			screen.getAllByText( /this domain is your site's main address/i ).length
		).toBeGreaterThan( 0 );
		expect( screen.getAllByText( /set a new primary site address/i ).length ).toBeGreaterThan( 0 );
	} );

	// Should be an info notice
	expect( document.querySelector( '.components-notice' ) ).toHaveClass( 'is-info' );
} );

test( 'shows no notice when domain uses WordPress.com nameservers and is not primary', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.query( true )
		.reply( 200, {
			domain: domainName,
			has_wpcom_nameservers: true, // Uses WordPress.com name servers
			primary_domain: false, // Not primary domain
			is_domain_only_site: true,
		} );

	const TestWrapper = () => {
		const { DomainForwardingNotice } = require( '../notice' );
		return <DomainForwardingNotice domainName={ domainName } />;
	};

	const { container } = render( <TestWrapper /> );

	await waitFor( () => {
		// Component should render but be empty (returns null)
		expect( container.firstChild ).toBeNull();
	} );

	// Should not have any notice elements
	expect( document.querySelector( '.components-notice' ) ).not.toBeInTheDocument();
} );
