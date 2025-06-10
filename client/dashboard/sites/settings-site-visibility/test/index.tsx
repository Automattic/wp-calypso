/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router';
import { render as testingLibraryRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import SiteVisibilitySettings from '../index';

function render( ui: React.ReactElement ) {
	const queryClient = new QueryClient();
	const router = createRouter( {
		routeTree: createRootRoute( { component: () => ui } ),
	} );
	return testingLibraryRender(
		<QueryClientProvider client={ queryClient }>
			<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
		</QueryClientProvider>
	);
}

interface TestSiteOptions {
	blog_public: 0 | 1 | -1;
	wpcom_public_coming_soon: 0 | 1;
	wpcom_data_sharing_opt_out: boolean;
}

// Only mocks site and settings fields that are necessary for the tests.
// Feel free to add more fields as they are needed.
function mockTestSite( slug: string, options: TestSiteOptions ) {
	const site = {
		slug,
		launch_status: 'launched',
	};

	const settings = {
		settings: {
			blog_public: options.blog_public,
			wpcom_public_coming_soon: options.wpcom_public_coming_soon,
			wpcom_data_sharing_opt_out: options.wpcom_data_sharing_opt_out,
		},
	};

	const scope = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site )
		.get( `/rest/v1.4/sites/${ site.slug }/settings` )
		.query( true )
		.reply( 200, settings );

	return { site, settings, scope };
}

function mockSettingsSaved( siteSlug: string, settings: nock.DataMatcherMap ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.4/sites/${ siteSlug }/settings`, ( body ) => {
			expect( body ).toEqual( settings );
			return true;
		} )
		.reply( 200 );
}

describe( '<SiteVisibilitySettings>', () => {
	describe( 'Launched site', () => {
		test( 'hides search engine and 3rd party checkboxes when private', async () => {
			mockTestSite( 'test-site', {
				blog_public: -1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Private' } ) ).toBeChecked();
			} );

			expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		} );

		test( 'hides search engine and 3rd party checkboxes when coming soon', async () => {
			mockTestSite( 'test-site', {
				blog_public: 0,
				wpcom_public_coming_soon: 1,
				wpcom_data_sharing_opt_out: false,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Coming soon' } ) ).toBeChecked();
			} );

			expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		} );

		test( 'data sharing opt-out is disabled and force checked when site is not crawlable', async () => {
			const user = userEvent.setup();

			mockTestSite( 'test-site', {
				blog_public: 0,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
			} );
			const notCrawlable = screen.getByRole( 'checkbox', { name: /Discourage search engines/ } );
			const preventThirdParty = screen.getByRole( 'checkbox', { name: /Prevent third-party/ } );

			expect( notCrawlable ).toBeChecked();
			expect( preventThirdParty ).toBeChecked();
			expect( preventThirdParty ).toBeDisabled();

			await user.click( notCrawlable );

			expect( notCrawlable ).not.toBeChecked();
			expect( preventThirdParty ).toBeChecked();
			expect( preventThirdParty ).toBeEnabled();

			await user.click( preventThirdParty );
			await user.click( notCrawlable );

			expect( notCrawlable ).toBeChecked();
			expect( preventThirdParty ).toBeChecked();
			expect( preventThirdParty ).toBeDisabled();
		} );

		test( 'switching away from public resets data sharing and crawlable settings', async () => {
			const user = userEvent.setup();

			mockTestSite( 'test-site', {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
			} );

			const notCrawlable = screen.getByRole( 'checkbox', { name: /Discourage search engines/ } );
			const preventThirdParty = screen.getByRole( 'checkbox', { name: /Prevent third-party/ } );

			expect( notCrawlable ).not.toBeChecked();
			expect( preventThirdParty ).toBeChecked();

			await user.click( notCrawlable );

			expect( notCrawlable ).toBeChecked();
			expect( preventThirdParty ).toBeChecked();

			await user.click( screen.getByRole( 'radio', { name: 'Private' } ) );
			await user.click( screen.getByRole( 'radio', { name: 'Public' } ) );

			// Reselect checkbox elements because we expect them to have re-rendered.
			expect(
				screen.getByRole( 'checkbox', { name: /Discourage search engines/ } )
			).not.toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: /Prevent third-party/ } ) ).toBeChecked();
		} );

		test( 'save site settings to make a public site private', async () => {
			const user = userEvent.setup();

			mockTestSite( 'test-site', {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );
			const scope = mockSettingsSaved( 'test-site', {
				blog_public: -1,
				wpcom_data_sharing_opt_out: false,
				wpcom_public_coming_soon: 0,
				wpcom_coming_soon: 0,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
			} );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			await user.click( screen.getByRole( 'radio', { name: 'Private' } ) );
			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.pendingMocks() ).toHaveLength( 0 );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a public site coming soon', async () => {
			const user = userEvent.setup();

			mockTestSite( 'test-site', {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );
			const scope = mockSettingsSaved( 'test-site', {
				blog_public: 0,
				wpcom_data_sharing_opt_out: false,
				wpcom_public_coming_soon: 1,
				wpcom_coming_soon: 0, // Legacy coming soon should always be set to 0
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
			} );

			await user.click( screen.getByRole( 'radio', { name: 'Coming soon' } ) );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.pendingMocks() ).toHaveLength( 0 );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a coming soon site public (crawlable, allow data sharing)', async () => {
			const user = userEvent.setup();

			mockTestSite( 'test-site', {
				blog_public: 0,
				wpcom_public_coming_soon: 1,
				wpcom_data_sharing_opt_out: false,
			} );
			const scope = mockSettingsSaved( 'test-site', {
				blog_public: 1,
				wpcom_data_sharing_opt_out: false,
				wpcom_public_coming_soon: 0,
				wpcom_coming_soon: 0,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Coming soon' } ) ).toBeChecked();
			} );

			await user.click( screen.getByRole( 'radio', { name: 'Public' } ) );

			const notCrawlableCheckbox = screen.getByRole( 'checkbox', {
				name: /Discourage search engines/,
			} );
			const preventThirdPartyCheckbox = screen.getByRole( 'checkbox', {
				name: /Prevent third-party/,
			} );
			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			expect( notCrawlableCheckbox ).not.toBeChecked();
			expect( preventThirdPartyCheckbox ).not.toBeChecked();

			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.pendingMocks() ).toHaveLength( 0 );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a private site public (not crawlable, prevent data sharing)', async () => {
			const user = userEvent.setup();

			mockTestSite( 'test-site', {
				blog_public: -1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
			} );
			const scope = mockSettingsSaved( 'test-site', {
				blog_public: 0,
				wpcom_data_sharing_opt_out: true,
				wpcom_public_coming_soon: 0,
				wpcom_coming_soon: 0,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Private' } ) ).toBeChecked();
			} );

			await user.click( screen.getByRole( 'radio', { name: 'Public' } ) );

			const notCrawlableCheckbox = screen.getByRole( 'checkbox', {
				name: /Discourage search engines/,
			} );
			const preventThirdPartyCheckbox = screen.getByRole( 'checkbox', {
				name: /Prevent third-party/,
			} );
			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			expect( notCrawlableCheckbox ).not.toBeChecked();
			expect( preventThirdPartyCheckbox ).not.toBeChecked();

			await user.click( notCrawlableCheckbox );
			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.pendingMocks() ).toHaveLength( 0 );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a public site crawlable but prevent data sharing', async () => {
			const user = userEvent.setup();

			mockTestSite( 'test-site', {
				blog_public: 0,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );
			const scope = mockSettingsSaved( 'test-site', {
				blog_public: 1,
				wpcom_data_sharing_opt_out: true,
				wpcom_public_coming_soon: 0,
				wpcom_coming_soon: 0,
			} );

			render( <SiteVisibilitySettings siteSlug="test-site" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
			} );

			const notCrawlableCheckbox = screen.getByRole( 'checkbox', {
				name: /Discourage search engines/,
			} );
			const preventThirdPartyCheckbox = screen.getByRole( 'checkbox', {
				name: /Prevent third-party/,
			} );
			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			expect( notCrawlableCheckbox ).toBeChecked();
			expect( preventThirdPartyCheckbox ).toBeChecked();

			await user.click( notCrawlableCheckbox );
			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.pendingMocks() ).toHaveLength( 0 );
				expect( saveButton ).toBeEnabled();
			} );
		} );
	} );
} );
