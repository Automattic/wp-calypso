/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SitePreview from '../site-preview';

const BASE = 'https://public-api.wordpress.com';
const observer = globalThis.IntersectionObserver;
beforeEach( () => Reflect.deleteProperty( globalThis, 'IntersectionObserver' ) );
afterEach( () => {
	globalThis.IntersectionObserver = observer;
} );
const site = {
	id: 'customer-site.com',
	name: 'customer-site.com',
	url: 'https://customer-site.com',
	staging: false,
};

test( 'shows detected details, distinguishes a CDN from hosting, and loads DNS on demand', async () => {
	nock( BASE )
		.get( '/wpcom/v2/imports/analyze-url' )
		.query( { site_url: site.url } )
		.reply( 200, { url: site.url, platform: 'wordpress', meta: { title: 'Customer &amp; Co' } } );
	nock( BASE )
		.get( '/wpcom/v2/site-profiler/hosting-provider/customer-site.com' )
		.reply( 200, {
			domain: 'customer-site.com',
			hosting_provider: { slug: 'cloudflare', name: 'Cloudflare', is_cdn: true },
		} );
	const dns = nock( BASE )
		.get( '/wpcom/v2/site-profiler/customer-site.com' )
		.reply( 200, {
			domain: 'customer-site.com',
			dns: [
				{ type: 'NS', host: 'customer-site.com', target: 'ns1.example.net' },
				{ type: 'A', host: 'customer-site.com', ip: '192.0.2.10' },
			],
		} );
	render( <SitePreview site={ site } /> );
	expect( await screen.findByText( 'Customer & Co' ) ).toBeVisible();
	expect( await screen.findByText( 'Network: Cloudflare' ) ).toBeVisible();
	expect( dns.isDone() ).toBe( false );
	await userEvent.click( screen.getByText( 'Site details' ) );
	expect( await screen.findByText( 'ns1.example.net' ) ).toBeVisible();
	expect( screen.getByText( '192.0.2.10' ) ).toBeVisible();
	expect( screen.getByText( 'Unknown until connected' ) ).toBeVisible();
} );

test( 'an unavailable lookup keeps the entered URL without inventing site details', async () => {
	nock( BASE ).get( '/wpcom/v2/imports/analyze-url' ).query( true ).reply( 500 );
	nock( BASE ).get( '/wpcom/v2/site-profiler/hosting-provider/customer-site.com' ).reply( 500 );
	nock( BASE ).get( '/wpcom/v2/site-profiler/customer-site.com' ).reply( 500 );
	render( <SitePreview site={ site } /> );
	await userEvent.click( screen.getByText( 'Site details' ) );
	expect( await screen.findByText( 'Couldn’t identify the host' ) ).toBeVisible();
	expect( screen.getByText( 'customer-site.com' ) ).toBeVisible();
	expect( screen.getByText( 'Unknown until connected' ) ).toBeVisible();
	expect( screen.queryByText( 'Public' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'Private' ) ).not.toBeInTheDocument();
} );
