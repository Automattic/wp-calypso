/**
 * @jest-environment jsdom
 */
import { siteBySlugQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { wpcomLink } from '../../../utils/link';
import { Visibility } from '../index';
import type { Site } from '@automattic/api-core';

function createQueryClientWithSite( site: Site ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );
	queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, site );
	return queryClient;
}

const site = { ID: 1, slug: 'test.wordpress.com' } as Site;

const aiLaunchpadSite = {
	ID: 1,
	slug: 'test.wordpress.com',
	capabilities: { manage_options: true },
	options: {
		admin_url: 'https://test.wordpress.com/wp-admin/',
		wpcom_ai_launchpad_enabled: true,
	},
} as Site;

describe( '<Visibility>', () => {
	afterEach( () => {
		window.localStorage.clear();
	} );

	test( 'for unlaunched sites, it renders "Coming soon" with a "Finish setup" link', () => {
		const { container, getByRole } = render(
			<Visibility site={ site } visibility="private" status={ null } isLaunched={ false } />
		);
		expect( container ).toHaveTextContent( 'Finish setup↗' );
		expect( getByRole( 'link', { name: /Finish setup/ } ) ).toHaveAttribute(
			'href',
			wpcomLink( '/home/test.wordpress.com' )
		);
	} );

	test( 'for unlaunched sites with an active AI Launchpad, "Finish setup" links to the wp-admin site setup page', () => {
		const { getByRole } = render(
			<Visibility site={ site } visibility="private" status={ null } isLaunched={ false } />,
			{ queryClient: createQueryClientWithSite( aiLaunchpadSite ) }
		);
		expect( getByRole( 'link', { name: /Finish setup/ } ) ).toHaveAttribute(
			'href',
			'https://test.wordpress.com/wp-admin/admin.php?page=site-setup-wp-admin'
		);
	} );

	test( 'for unlaunched sites with a completed AI Launchpad, it hides the "Finish setup" link', () => {
		const completedSite = {
			...aiLaunchpadSite,
			options: { ...aiLaunchpadSite.options, wpcom_ai_launchpad_completed: true },
		} as Site;
		const { queryByRole } = render(
			<Visibility site={ site } visibility="private" status={ null } isLaunched={ false } />,
			{ queryClient: createQueryClientWithSite( completedSite ) }
		);
		expect( queryByRole( 'link', { name: /Finish setup/ } ) ).not.toBeInTheDocument();
	} );

	test( 'for no-guidance sites, it hides the "Finish setup" link', async () => {
		const noGuidanceSite = {
			...aiLaunchpadSite,
			options: { ...aiLaunchpadSite.options, wpcom_ai_launchpad_no_guidance: true },
		} as Site;
		const { queryByRole } = render(
			<Visibility site={ site } visibility="private" status={ null } isLaunched={ false } />,
			{ queryClient: createQueryClientWithSite( noGuidanceSite ) }
		);
		await waitFor( () =>
			expect( queryByRole( 'link', { name: /Finish setup/ } ) ).not.toBeInTheDocument()
		);
	} );

	test( 'for coming soon sites, it renders "Coming soon"', () => {
		const { container } = render(
			<Visibility site={ site } visibility="coming_soon" status={ null } isLaunched />
		);
		expect( container.textContent ).toBe( 'Coming soon' );
	} );

	test( 'for private sites, it renders "Private"', () => {
		const { container } = render(
			<Visibility site={ site } visibility="private" status={ null } isLaunched />
		);
		expect( container.textContent ).toBe( 'Private' );
	} );

	test( 'for public sites, it renders "Public"', () => {
		const { container } = render(
			<Visibility site={ site } visibility="public" status={ null } isLaunched />
		);
		expect( container.textContent ).toBe( 'Public' );
	} );

	test( 'for a preview site, it hides the "Finish setup" link', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/wow-funnel/pending' )
			.query( true )
			.reply( 200, {
				pending: false,
				preview_sites: [ { blog_id: 1, site_slug: 'test.wordpress.com' } ],
			} );
		const preview = { ...site, is_wpcom_atomic: true, plan: { is_free: true } } as Site;

		const { queryByRole } = render(
			<Visibility site={ preview } visibility="coming_soon" status={ null } isLaunched={ false } />
		);

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( queryByRole( 'link', { name: /Finish setup/ } ) ).not.toBeInTheDocument()
		);
	} );
} );
