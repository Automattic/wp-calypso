/**
 * @jest-environment jsdom
 */
import { UserSitesResponse } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import SitesVisibilityCard from '../sites-visibility-card';

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: ( { siteId }: { siteId: number } ) => <span data-testid={ `site-icon-${ siteId }` } />,
} ) );

const mockSetSiteHidden = jest.fn();
const mockSetAllHidden = jest.fn();
let mockPendingSiteId: number | null = null;
let mockIsPending = false;
jest.mock( 'calypso/reader/data/user-profile/use-set-hidden-sites', () => ( {
	useSetHiddenSites: () => ( {
		setSiteHidden: mockSetSiteHidden,
		setAllHidden: mockSetAllHidden,
		pendingSiteId: mockPendingSiteId,
		isPending: mockIsPending,
	} ),
} ) );

function makeSite( id: number, name: string, isHidden = false ): UserSitesResponse[ 'sites' ][ 0 ] {
	return {
		ID: id,
		name,
		description: '',
		feed_ID: 100 + id,
		URL: `https://site${ id }.wordpress.com`,
		icon: {},
		is_following: false,
		last_published: '2024-01-01',
		posts_count: 10,
		subscribers_count: 100,
		is_hidden: isHidden,
	};
}

describe( 'SitesVisibilityCard', () => {
	const userId = 123;
	const sites: UserSitesResponse[ 'sites' ] = [
		{
			ID: 1,
			name: 'Visible Site',
			description: '',
			feed_ID: 101,
			URL: 'https://visible.wordpress.com',
			icon: {},
			is_following: false,
			last_published: '2024-01-01',
			posts_count: 10,
			subscribers_count: 100,
			is_hidden: false,
		},
		{
			ID: 2,
			name: 'Hidden Site',
			description: '',
			feed_ID: 102,
			URL: 'https://hidden.wordpress.com',
			icon: {},
			is_following: false,
			last_published: '2024-01-02',
			posts_count: 20,
			subscribers_count: 200,
			is_hidden: true,
		},
	];

	let queryClient: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
		mockPendingSiteId = null;
		mockIsPending = false;
		nock.disableNetConnect();
		queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		nockSitesAndPrefs( sites, [ 2 ] );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	function nockSitesAndPrefs( sitesList: UserSitesResponse[ 'sites' ], hiddenSiteIds: number[] ) {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/users/${ userId }/sites` )
			.query( true )
			.reply( 200, {
				sites: sitesList,
				total: sitesList.length,
				primary_site_id: sitesList[ 0 ]?.ID ?? 0,
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: { 'reader-profile-hidden-sites': hiddenSiteIds } } );
	}

	function renderWithClient( ui: React.ReactNode ) {
		return render( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
	}

	test( 'renders a toggle per site reflecting the hidden state', async () => {
		renderWithClient( <SitesVisibilityCard userId={ userId } sitesEnabled /> );

		expect( await screen.findByText( 'Visible Site' ) ).toBeVisible();
		expect( screen.getByText( 'Hidden Site' ) ).toBeVisible();

		await waitFor( () => {
			const toggles = screen.getAllByRole( 'checkbox' );
			expect( toggles ).toHaveLength( 2 );
			// Site 1 is visible (checked), site 2 is hidden (unchecked).
			expect( toggles[ 0 ] ).toBeChecked();
			expect( toggles[ 1 ] ).not.toBeChecked();
		} );
	} );

	test( 'toggling a site calls setSiteHidden with the inverse of visibility', async () => {
		const user = userEvent.setup();
		renderWithClient( <SitesVisibilityCard userId={ userId } sitesEnabled /> );

		await screen.findByText( 'Visible Site' );
		const toggles = await screen.findAllByRole( 'checkbox' );

		await user.click( toggles[ 0 ] );

		expect( mockSetSiteHidden ).toHaveBeenCalledWith( 1, true );
	} );

	test( 'disables toggles and shows a notice when the Sites tab is off', async () => {
		renderWithClient( <SitesVisibilityCard userId={ userId } sitesEnabled={ false } /> );

		const notices = await screen.findAllByText(
			'Turn on the Sites tab to choose which sites are visible.'
		);
		expect( notices[ 0 ] ).toBeVisible();

		const toggles = await screen.findAllByRole( 'checkbox' );
		toggles.forEach( ( toggle ) => expect( toggle ).toBeDisabled() );
	} );

	test( 'falls back to the site URL when a site has no title', async () => {
		const untitled = makeSite( 9, '' );
		untitled.URL = 'https://untitled.wordpress.com';
		nockSitesAndPrefs( [ untitled ], [] );

		renderWithClient( <SitesVisibilityCard userId={ userId } sitesEnabled /> );

		expect( await screen.findByText( 'untitled.wordpress.com' ) ).toBeVisible();
	} );

	test( 'shows "Deselect all" when sites are all visible and hides all on click', async () => {
		const user = userEvent.setup();
		const threeSites = [
			makeSite( 1, 'Site One' ),
			makeSite( 2, 'Site Two' ),
			makeSite( 3, 'Site Three' ),
		];
		nockSitesAndPrefs( threeSites, [] );

		renderWithClient( <SitesVisibilityCard userId={ userId } sitesEnabled /> );

		await screen.findByText( 'Site One' );
		const link = screen.getByRole( 'button', { name: 'Deselect all' } );
		await user.click( link );

		expect( mockSetAllHidden ).toHaveBeenCalledWith( true, [ 1, 2, 3 ] );
	} );

	test( 'shows "Select all" when not all sites are visible and shows all on click', async () => {
		const user = userEvent.setup();
		const threeSites = [
			makeSite( 1, 'Site One' ),
			makeSite( 2, 'Site Two', true ),
			makeSite( 3, 'Site Three' ),
		];
		nockSitesAndPrefs( threeSites, [ 2 ] );

		renderWithClient( <SitesVisibilityCard userId={ userId } sitesEnabled /> );

		await screen.findByText( 'Site One' );
		const link = await screen.findByRole( 'button', { name: 'Select all' } );
		await user.click( link );

		expect( mockSetAllHidden ).toHaveBeenCalledWith( false, [ 1, 2, 3 ] );
	} );

	test( 'disables the select/deselect all link when the Sites tab is off', async () => {
		const threeSites = [
			makeSite( 1, 'Site One' ),
			makeSite( 2, 'Site Two' ),
			makeSite( 3, 'Site Three' ),
		];
		nockSitesAndPrefs( threeSites, [] );

		renderWithClient( <SitesVisibilityCard userId={ userId } sitesEnabled={ false } /> );

		await screen.findByText( 'Site One' );
		expect( await screen.findByRole( 'button', { name: 'Deselect all' } ) ).toBeDisabled();
	} );
} );
