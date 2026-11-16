/**
 * @vitest-environment jsdom
 */
import nock from 'nock';
import { render } from '../../../test-utils';
import VisibilityCard from '../index';
import type { Site } from '@automattic/api-core';

const preview = {
	ID: 77,
	slug: 'test.wordpress.com',
	launch_status: 'unlaunched',
	is_coming_soon: true,
	is_wpcom_atomic: true,
	plan: { is_free: true },
	capabilities: { manage_options: true },
	options: {},
} as Site;

describe( '<VisibilityCard>', () => {
	afterEach( () => nock.cleanAll() );

	test.each( [
		{ shareUrl: 'https://test.wordpress.com/?share=abc', description: /Share this link/ },
		{ shareUrl: undefined, description: /Share it with a preview link/ },
	] )(
		'a preview site offers the share link the server gives it ($shareUrl)',
		async ( { shareUrl, description } ) => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/wow-funnel/pending' )
				.query( true )
				.reply( 200, {
					pending: false,
					preview_sites: [ { blog_id: preview.ID, site_slug: preview.slug, share_url: shareUrl } ],
				} );

			const { findByText, queryByDisplayValue, queryByText } = render(
				<VisibilityCard site={ preview } />
			);

			expect( await findByText( description ) ).toBeInTheDocument();
			expect( !! queryByDisplayValue( 'https://test.wordpress.com/?share=abc' ) ).toBe(
				!! shareUrl
			);
			expect( queryByText( 'Finish setting up your site.' ) ).not.toBeInTheDocument();
		}
	);
} );
