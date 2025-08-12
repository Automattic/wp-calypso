/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteVisibilitySettings from '../index';

interface TestSiteOptions {
	blog_public: 0 | 1 | -1;
	wpcom_public_coming_soon: 0 | 1;
	wpcom_data_sharing_opt_out: boolean;
	is_wpcom_staging_site?: boolean;
	domains?: string[];
	primary_domain?: string;
}

const siteId = 123;
const siteSlug = 'test-site';

// Only mocks site and settings fields that are necessary for the tests.
// Feel free to add more fields as they are needed.
function mockTestSite( options: TestSiteOptions ) {
	const {
		blog_public,
		wpcom_public_coming_soon,
		wpcom_data_sharing_opt_out,
		is_wpcom_staging_site,
		domains = [ siteSlug ],
		primary_domain = options.domains?.[ 0 ] || siteSlug,
	} = options;

	const domainObjects = domains.map( ( domain ) => {
		return {
			domain,
			blog_id: siteId,
			wpcom_domain: domain.endsWith( '.wordpress.com' ) || domain.endsWith( '.wpcomstaging.com' ),
			is_wpcom_staging_domain: domain.endsWith( '.wpcomstaging.com' ),
			primary_domain: domain === primary_domain,
		};
	} );

	const site = {
		ID: siteId,
		slug: primary_domain,
		launch_status: 'launched',
		is_wpcom_staging_site,
	};

	const settings = {
		settings: {
			blog_public,
			wpcom_public_coming_soon,
			wpcom_data_sharing_opt_out,
		},
	};

	const scope = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site )
		.get( `/rest/v1.4/sites/${ site.ID }/settings` )
		.query( true )
		.reply( 200, settings )
		.get( `/rest/v1.2/sites/${ site.ID }/domains` )
		.query( true )
		.reply( 200, { domains: domainObjects } );

	return { site, settings, domains: domainObjects, scope };
}

function mockSettingsSaved( settings: nock.DataMatcherMap ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.4/sites/${ siteId }/settings`, ( body ) => {
			expect( body ).toEqual( settings );
			return true;
		} )
		.reply( 200 );
}

describe( '<SiteVisibilitySettings>', () => {
	describe( 'Launched site', () => {
		test( 'hides search engine and 3rd party checkboxes when private', async () => {
			mockTestSite( {
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
			mockTestSite( {
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

			mockTestSite( {
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

			mockTestSite( {
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

			mockTestSite( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );
			const scope = mockSettingsSaved( {
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

			mockTestSite( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );
			const scope = mockSettingsSaved( {
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

			mockTestSite( {
				blog_public: 0,
				wpcom_public_coming_soon: 1,
				wpcom_data_sharing_opt_out: false,
			} );
			const scope = mockSettingsSaved( {
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

			mockTestSite( {
				blog_public: -1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
			} );
			const scope = mockSettingsSaved( {
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

			mockTestSite( {
				blog_public: 0,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );
			const scope = mockSettingsSaved( {
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

		test( 'wpcomstaging warning shows "Add new domain" button when the site has no other domains', async () => {
			mockTestSite( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
				domains: [ 'site.wpcomstaging.com' ],
			} );

			render( <SiteVisibilitySettings siteSlug="site.wpcomstaging.com" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
				expect(
					screen.getByText( /This domain is intended for temporary use/ )
				).toBeInTheDocument();
			} );
			const domainButton = screen.getByRole( 'link', {
				name: 'Add new domain',
			} );

			expect( domainButton ).toHaveAttribute(
				'href',
				expect.stringMatching( /^\/domains\/add\/[^/]+.wpcomstaging.com/ )
			);
		} );

		test( 'wpcomstaging warning shows "Manage domains" button when the site has non dotcom domains they could switch to', async () => {
			mockTestSite( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
				domains: [ 'site.wpcomstaging.com', 'example.com' ],
				primary_domain: 'site.wpcomstaging.com',
			} );

			render( <SiteVisibilitySettings siteSlug="site.wpcomstaging.com" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
				expect(
					screen.getByText( /This domain is intended for temporary use/ )
				).toBeInTheDocument();
			} );
			const domainButton = screen.getByRole( 'link', {
				name: 'Manage domains',
			} );

			expect( domainButton ).toHaveAttribute(
				'href',
				expect.stringMatching( /^\/domains\/manage\/[^/]+.wpcomstaging.com/ )
			);
		} );

		test( 'staging site warning shows no domain management buttons', async () => {
			mockTestSite( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
				is_wpcom_staging_site: true,
				domains: [ 'staging-site.wpcomstaging.com' ],
				primary_domain: 'staging-site.wpcomstaging.com',
			} );

			render( <SiteVisibilitySettings siteSlug="staging-site.wpcomstaging.com" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
				expect(
					screen.getByText( /Staging sites are intended for testing purposes/ )
				).toBeInTheDocument();
			} );

			const domainButton = screen.queryByRole( 'link', {
				name: /domain/,
			} );

			expect( domainButton ).not.toBeInTheDocument();
		} );

		test( 'checkboxes disabled for wpcomstaging sites', async () => {
			mockTestSite( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
				domains: [ 'site.wpcomstaging.com' ],
			} );

			render( <SiteVisibilitySettings siteSlug="site.wpcomstaging.com" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
				expect(
					screen.getByText( /This domain is intended for temporary use/ )
				).toBeInTheDocument();
			} );

			const notCrawlableCheckbox = screen.getByRole( 'checkbox', {
				name: /Discourage search engines/,
			} );
			const preventThirdPartyCheckbox = screen.getByRole( 'checkbox', {
				name: /Prevent third-party/,
			} );

			expect( notCrawlableCheckbox ).toBeDisabled();
			expect( notCrawlableCheckbox ).toBeChecked();
			expect( preventThirdPartyCheckbox ).toBeDisabled();
			expect( preventThirdPartyCheckbox ).toBeChecked();
		} );

		test( 'make a wpcomstaging site public still sets blog_public=1 (even though under the hood it does not get indexed)', async () => {
			const user = userEvent.setup();

			mockTestSite( {
				blog_public: -1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
				domains: [ 'site.wpcomstaging.com' ],
			} );
			const scope = mockSettingsSaved( {
				blog_public: 1,
				wpcom_data_sharing_opt_out: false,
				wpcom_public_coming_soon: 0,
				wpcom_coming_soon: 0,
			} );

			render( <SiteVisibilitySettings siteSlug="site.wpcomstaging.com" /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Private' } ) ).toBeChecked();
			} );
			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			await user.click( screen.getByRole( 'radio', { name: 'Public' } ) );

			await waitFor( () => {
				expect(
					screen.getByText( /This domain is intended for temporary use/ )
				).toBeInTheDocument();
			} );

			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.pendingMocks() ).toHaveLength( 0 );
				expect( saveButton ).toBeEnabled();
			} );
		} );
	} );
} );
