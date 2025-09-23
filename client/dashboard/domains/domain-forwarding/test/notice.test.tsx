/**
 * @jest-environment jsdom
 */
import { Domain } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';

const domainName = 'example.com';

const getMockedDomainData = ( customProps: Partial< Domain > = {} ) => {
	return {
		domain: domainName,
		aftermarket_auction: false,
		auto_renewing: false,
		blog_id: 123,
		blog_name: 'Test Blog',
		can_manage_dns_records: true,
		can_update_contact_info: true,
		can_set_as_primary: true,
		current_user_can_create_site_from_domain_only: false,
		current_user_can_manage: true,
		current_user_is_owner: true,
		domain_status: { status: 'active' },
		expired: false,
		expiry: false,
		has_registration: true,
		is_dnssec_enabled: false,
		is_dnssec_supported: true,
		is_eligible_for_inbound_transfer: false,
		is_hundred_year_domain: false,
		is_gravatar_domain: false,
		move_to_new_site_pending: false,
		can_manage_name_servers: true,
		cannot_manage_name_servers_reason: null,
		is_redeemable: false,
		is_renewable: true,
		is_wpcom_staging_domain: false,
		pending_registration: false,
		pending_registration_at_registry: false,
		pending_renewal: false,
		pending_transfer: false,
		points_to_wpcom: false,
		registration_date: '2023-01-01',
		subscription_id: 'sub123',
		transfer_status: null,
		type: 'wpcom',
		wpcom_domain: true,
		...customProps,
	};
};

test( 'shows warning notice when domain uses external name servers', () => {
	const domainData = getMockedDomainData( {
		has_wpcom_nameservers: false, // External name servers
		primary_domain: false,
		is_domain_only_site: true,
	} );

	const TestWrapper = () => {
		const { DomainForwardingNotice } = require( '../notice' );
		return <DomainForwardingNotice domainName={ domainName } domainData={ domainData } />;
	};

	render( <TestWrapper /> );

	expect(
		screen.getAllByText( /your domain is using external name servers/i ).length
	).toBeGreaterThan( 0 );
	expect( screen.getAllByText( /update your name servers now/i ).length ).toBeGreaterThan( 0 );

	// Should be a warning notice
	expect( document.querySelector( '.dashboard-notice' ) ).toHaveClass( 'is-warning' );
} );

test( 'shows info notice when domain is primary domain on non-domain-only site', () => {
	const domainData = getMockedDomainData( {
		has_wpcom_nameservers: true, // Uses WordPress.com name servers
		primary_domain: true, // Is primary domain
		is_domain_only_site: false, // Not domain-only site
		site_slug: 'test-site',
		// Add other required properties from DomainSummary
	} );

	const TestWrapper = () => {
		const { DomainForwardingNotice } = require( '../notice' );
		return <DomainForwardingNotice domainName={ domainName } domainData={ domainData } />;
	};

	render( <TestWrapper /> );

	expect(
		screen.getAllByText( /this domain is your site’s main address/i ).length
	).toBeGreaterThan( 0 );
	expect( screen.getAllByText( /set a new primary site address/i ).length ).toBeGreaterThan( 0 );

	// Should be an info notice
	expect( document.querySelector( '.dashboard-notice' ) ).toHaveClass( 'is-info' );
} );

test( 'shows no notice when domain uses WordPress.com nameservers and is not primary', () => {
	const domainData = getMockedDomainData( {
		has_wpcom_nameservers: true, // Uses WordPress.com name servers
		primary_domain: false, // Not primary domain
		is_domain_only_site: true,
		site_slug: 'test-site',
	} );

	const TestWrapper = () => {
		const { DomainForwardingNotice } = require( '../notice' );
		return <DomainForwardingNotice domainName={ domainName } domainData={ domainData } />;
	};

	const { container } = render( <TestWrapper /> );

	// Component should render but be empty (returns null)
	expect( container.firstChild ).toBeNull();

	// Should not have any notice elements
	expect( document.querySelector( '.dashboard-notice' ) ).not.toBeInTheDocument();
} );
