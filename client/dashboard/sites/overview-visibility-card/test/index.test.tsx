/**
 * @vitest-environment jsdom
 */
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
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

	test( 'a built preview site links to its visibility settings and copies the share link the server gives it', async () => {
		const shareUrl = 'https://test.wordpress.com/?share=abc';
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/wow-funnel/pending' )
			.query( true )
			.reply( 200, {
				pending: false,
				preview_sites: [ { blog_id: preview.ID, site_slug: preview.slug, share_url: shareUrl } ],
			} );
		const user = userEvent.setup();
		const writeText = vi.spyOn( navigator.clipboard, 'writeText' );

		const { findByRole, getByRole, queryByText } = render( <VisibilityCard site={ preview } /> );

		await user.click( await findByRole( 'button', { name: 'Copy share link' } ) );
		expect( writeText ).toHaveBeenCalledWith( shareUrl );
		expect( getByRole( 'link' ) ).toHaveAttribute(
			'href',
			expect.stringContaining( 'site-visibility' )
		);
		expect( queryByText( 'Finish setting up your site.' ) ).not.toBeInTheDocument();
	} );
} );
