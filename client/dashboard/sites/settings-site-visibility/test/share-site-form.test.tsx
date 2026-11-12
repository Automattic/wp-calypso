/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { ShareSiteForm } from '../share-site-form';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 77,
	slug: 'test.wordpress.com',
	URL: 'https://test.wordpress.com',
	launch_status: 'unlaunched',
	is_coming_soon: true,
	is_wpcom_atomic: true,
	plan: { is_free: true, features: { active: [ 'site-preview-links' ] } },
	capabilities: { manage_options: true },
	options: {},
} as unknown as Site;

describe( '<ShareSiteForm>', () => {
	afterEach( () => nock.cleanAll() );

	test.each( [
		{ isPreview: true, hasToggle: false },
		{ isPreview: false, hasToggle: true },
	] )(
		'shows the share link, with a toggle unless the site is a preview ($isPreview)',
		async ( { isPreview, hasToggle } ) => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/wow-funnel/pending' )
				.query( true )
				.reply( 200, {
					pending: false,
					preview_sites: isPreview ? [ { blog_id: site.ID, site_slug: site.slug } ] : [],
				} );
			nock( 'https://public-api.wordpress.com' )
				.get( `/wpcom/v2/sites/${ site.ID }/preview-links` )
				.query( true )
				.reply( 200, [ { code: 'abc', created_at: '2026-11-12', is_expired: false } ] );

			render( <ShareSiteForm site={ site } /> );

			expect( await screen.findByDisplayValue( /share=abc/ ) ).toBeInTheDocument();
			expect( !! screen.queryByRole( 'checkbox', { name: 'Enable preview link' } ) ).toBe(
				hasToggle
			);
			expect( !! screen.queryByText( /Visitors to your site see a Coming Soon page/ ) ).toBe(
				isPreview
			);
		}
	);
} );
