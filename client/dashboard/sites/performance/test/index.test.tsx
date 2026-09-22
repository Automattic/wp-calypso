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
afterEach( () => mockCandidate.mockReturnValue( null ) );

describe( '<SitePerformanceContent>', () => {
	test( 'keeps the launch message when an urgent notice takes the slot', async () => {
		mockCandidate.mockReturnValue( { node: <Notice>Plan expired</Notice>, isUrgent: true } );

		render( <SitePerformanceContent siteSlug={ site.slug } /> );

		expect( await screen.findByText( 'Plan expired' ) ).toBeVisible();
		expect( screen.getByText( 'Launch your site to start measuring performance' ) ).toBeVisible();
	} );
} );
