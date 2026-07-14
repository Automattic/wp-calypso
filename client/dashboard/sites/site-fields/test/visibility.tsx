/**
 * @jest-environment jsdom
 */
import { siteBySlugQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
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
	test( 'for unlaunched sites, it renders "Coming soon" with a "Finish setup" link', () => {
		const { container, getByRole } = render(
			<Visibility
				siteSlug="test.wordpress.com"
				visibility="private"
				status={ null }
				isLaunched={ false }
			/>
		);
		expect( container ).toHaveTextContent( 'Finish setup↗' );
		expect( getByRole( 'link', { name: /Finish setup/ } ) ).toHaveAttribute(
			'href',
			wpcomLink( '/home/test.wordpress.com' )
		);
	} );

	test( 'for unlaunched sites with an active AI Launchpad, "Finish setup" links to the wp-admin site setup page', () => {
		const { getByRole } = render(
			<Visibility
				siteSlug="test.wordpress.com"
				visibility="private"
				status={ null }
				isLaunched={ false }
			/>,
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
			<Visibility
				siteSlug="test.wordpress.com"
				visibility="private"
				status={ null }
				isLaunched={ false }
			/>,
			{ queryClient: createQueryClientWithSite( completedSite ) }
		);
		expect( queryByRole( 'link', { name: /Finish setup/ } ) ).not.toBeInTheDocument();
	} );

	test( 'for coming soon sites, it renders "Coming soon"', () => {
		const { container } = render(
			<Visibility
				siteSlug="test.wordpress.com"
				visibility="coming_soon"
				status={ null }
				isLaunched
			/>
		);
		expect( container.textContent ).toBe( 'Coming soon' );
	} );

	test( 'for private sites, it renders "Private"', () => {
		const { container } = render(
			<Visibility siteSlug="test.wordpress.com" visibility="private" status={ null } isLaunched />
		);
		expect( container.textContent ).toBe( 'Private' );
	} );

	test( 'for public sites, it renders "Public"', () => {
		const { container } = render(
			<Visibility siteSlug="test.wordpress.com" visibility="public" status={ null } isLaunched />
		);
		expect( container.textContent ).toBe( 'Public' );
	} );
} );
