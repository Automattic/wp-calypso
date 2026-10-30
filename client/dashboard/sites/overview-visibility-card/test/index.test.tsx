/**
 * @jest-environment jsdom
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

	test( 'a preview site offers its preview link instead of setup', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/wow-funnel/pending' )
			.query( true )
			.reply( 200, {
				pending: false,
				preview_sites: [ { blog_id: preview.ID, site_slug: preview.slug } ],
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ preview.ID }/preview-links` )
			.query( true )
			.reply( 200, [ { code: 'abc', created_at: '2026-10-29', is_expired: false } ] );

		const { findByText, queryByText } = render( <VisibilityCard site={ preview } /> );

		expect( await findByText( 'Anyone with the preview link can view it.' ) ).toBeInTheDocument();
		expect( queryByText( 'Finish setting up your site.' ) ).not.toBeInTheDocument();
	} );
} );
