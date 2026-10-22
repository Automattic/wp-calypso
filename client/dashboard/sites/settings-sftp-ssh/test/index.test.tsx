/**
 * @jest-environment jsdom
 */

import { DotcomFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import SftpSshSettings from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'broken.wpcomstaging.com',
	jetpack: true,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	plan: {
		product_slug: 'personal-bundle',
		product_name_short: 'Personal',
		is_free: false,
		features: {
			active: [ DotcomFeatures.ATOMIC ],
		},
	},
	__inaccessible_jetpack_error: new Error( 'The site is unreachable.' ),
} as Site;

describe( '<SftpSshSettings>', () => {
	test( 'renders upsell for an unreachable site whose plan does not include SFTP', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false, staleTime: Infinity } },
		} );
		queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, site );

		render( <SftpSshSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'SFTP/SSH' } );

		expect( screen.getByText( /Direct access to your site/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Create credentials' } )
		).not.toBeInTheDocument();
	} );
} );
