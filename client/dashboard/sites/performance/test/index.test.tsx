/**
 * @jest-environment jsdom
 */
import { HostingFeatures } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import Notice from '../../../components/notice';
import { useSiteExpiryNoticeCandidate } from '../../../components/site-expiry-notice';
import { render } from '../../../test-utils';
import { SitePerformanceContent } from '../index';
import type { Site } from '@automattic/api-core';

jest.mock( '../../../app/router/sites', () => ( {
	siteRoute: { useParams: () => ( { siteSlug: 'test-site' } ) },
} ) );

// The candidate reads the leaf route match, which the test router does not
// have; the arbiter's own tests cover the real hook.
jest.mock( '../../../components/site-expiry-notice', () => ( {
	useSiteExpiryNoticeCandidate: jest.fn( () => null ),
} ) );
const mockCandidate = jest.mocked( useSiteExpiryNoticeCandidate );

const site = {
	ID: 1,
	slug: 'test-site',
	is_coming_soon: true,
	plan: { features: { active: [ HostingFeatures.PERFORMANCE ] } },
} as Site;

beforeEach( () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );
} );
afterEach( () => {
	mockCandidate.mockReturnValue( null );
	window.localStorage.clear();
} );

describe( '<SitePerformanceContent>', () => {
	test( 'keeps the launch message when an urgent notice takes the slot', async () => {
		mockCandidate.mockReturnValue( { node: <Notice>Plan expired</Notice>, isUrgent: true } );

		render( <SitePerformanceContent siteSlug={ site.slug } /> );

		expect( await screen.findByText( 'Plan expired' ) ).toBeVisible();
		expect( screen.getByText( 'Launch your site to start measuring performance' ) ).toBeVisible();
	} );

	test( 'says "Publish" in the copy experiment treatment', async () => {
		// ExPlat reads a cached assignment from localStorage before asking the server.
		window.localStorage.setItem(
			'explat-experiment--calypso_site_launch_publish_copy_202610_v1',
			JSON.stringify( {
				experimentName: 'calypso_site_launch_publish_copy_202610_v1',
				variationName: 'treatment',
				retrievedTimestamp: Date.now(),
				ttl: 3600,
			} )
		);
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.slug }` )
			.query( true )
			.reply( 200, {
				...site,
				launch_status: 'unlaunched',
				capabilities: { manage_options: true },
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [] } );

		render( <SitePerformanceContent siteSlug={ site.slug } /> );

		expect(
			await screen.findByText( 'Publish your site to start measuring performance' )
		).toBeVisible();
		expect( await screen.findByRole( 'link', { name: 'Publish your site' } ) ).toBeVisible();
	} );
} );
