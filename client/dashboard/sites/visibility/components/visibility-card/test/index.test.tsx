/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../../test-utils';
import VisibilityCard from '../index';
import type { Site } from '@automattic/api-core';

const preview = {
	ID: 77,
	slug: 'test.wordpress.com',
	is_wpcom_atomic: true,
	plan: { is_free: true },
} as unknown as Site;

const shareUrl = 'https://test.wordpress.com/?share=abc';

function mockPreview() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/wow-funnel/pending' )
		.query( true )
		.reply( 200, {
			preview_sites: [ { blog_id: preview.ID, site_slug: preview.slug, share_url: shareUrl } ],
		} );
}

describe( '<VisibilityCard>', () => {
	test( 'links a built preview site to its visibility settings', async () => {
		mockPreview();

		render( <VisibilityCard site={ preview } /> );

		await screen.findByRole( 'button', { name: 'Copy share link' } );

		expect( screen.getByRole( 'link', { name: /Coming soon/ } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( 'site-visibility' )
		);
	} );

	test( 'copies the preview’s share link', async () => {
		mockPreview();
		const user = userEvent.setup();
		const writeText = vi.spyOn( navigator.clipboard, 'writeText' );

		render( <VisibilityCard site={ preview } /> );

		await user.click( await screen.findByRole( 'button', { name: 'Copy share link' } ) );

		expect( writeText ).toHaveBeenCalledWith( shareUrl );
	} );
} );
