/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { ShareSiteForm } from '../share-site-form';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 77,
	slug: 'test.wpcomstaging.com',
	URL: 'https://test.wpcomstaging.com',
	launch_status: 'unlaunched',
	is_coming_soon: true,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	options: {},
} as unknown as Site;

describe( '<ShareSiteForm>', () => {
	// A free preview has no preview-links plan feature: its link is the one the server reports for it.
	test.each( [
		{ isPreview: true, features: [], hasToggle: false },
		{ isPreview: false, features: [ 'site-preview-links' ], hasToggle: true },
	] )(
		'shows the share link, with a toggle unless the site is a preview ($isPreview)',
		async ( { isPreview, features, hasToggle } ) => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/wow-funnel/pending' )
				.query( true )
				.reply( 200, {
					pending: false,
					preview_sites: isPreview
						? [ { blog_id: site.ID, site_slug: site.slug, share_url: `${ site.URL }/?share=abc` } ]
						: [],
				} );
			nock( 'https://public-api.wordpress.com' )
				.get( `/wpcom/v2/sites/${ site.ID }/preview-links` )
				.query( true )
				.reply( 200, [ { code: 'abc', created_at: '2026-11-12', is_expired: false } ] );

			render(
				<ShareSiteForm
					site={ { ...site, plan: { is_free: true, features: { active: features } } } as Site }
				/>
			);

			expect( await screen.findByDisplayValue( /share=abc/ ) ).toBeVisible();
			expect( !! screen.queryByRole( 'checkbox', { name: 'Enable preview link' } ) ).toBe(
				hasToggle
			);
		}
	);
} );
