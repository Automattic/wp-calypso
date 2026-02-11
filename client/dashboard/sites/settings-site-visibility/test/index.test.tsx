/**
 * @jest-environment jsdom
 */

import { DomainSubtype } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteVisibilitySettings from '../index';
import type { Site, SiteSettings } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	launch_status: 'launched',
} as Site;

function mockSite(
	mockedSite: Site,
	{
		domains = [ mockedSite.slug ],
		primary_domain = domains[ 0 ] || mockedSite.slug,
	}: {
		domains?: string[];
		primary_domain?: string;
	} = {}
) {
	const domainObjects = domains.map( ( domain ) => {
		return {
			domain,
			blog_id: mockedSite.ID,
			subtype: {
				id:
					domain.endsWith( '.wordpress.com' ) || domain.endsWith( '.wpcomstaging.com' )
						? DomainSubtype.DEFAULT_ADDRESS
						: DomainSubtype.DOMAIN_REGISTRATION,
				label: 'Does not matter',
			},
			tags: domain.endsWith( '.wpcomstaging.com' ) ? [ 'wpcom_staging' ] : [],
			primary_domain: domain === primary_domain,
		};
	} );

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains: domainObjects } );
}

function mockSettings( settings: SiteSettings ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.4/sites/${ site.ID }/settings` )
		.query( true )
		.reply( 200, { settings } );
}

function mockSettingsSaved( settings: SiteSettings ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.4/sites/${ site.ID }/settings`, ( body ) => {
			expect( body ).toEqual( settings );
			return true;
		} )
		.reply( 200 );
}

describe( '<SiteVisibilitySettings>', () => {
	describe( 'Launched site', () => {
		test( 'hides search engine and 3rd party checkboxes when private', async () => {
			mockSite( site );
			mockSettings( {
				blog_public: -1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
			} );

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Private' } ) ).toBeChecked();
			} );

			expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		} );

		test( 'hides search engine and 3rd party checkboxes when coming soon', async () => {
			mockSite( site );
			mockSettings( {
				blog_public: 0,
				wpcom_public_coming_soon: 1,
				wpcom_data_sharing_opt_out: false,
			} );

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Coming soon' } ) ).toBeChecked();
			} );

			expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		} );

		test( 'data sharing opt-out is disabled and force checked when site is not crawlable', async () => {
			const user = userEvent.setup();

			mockSite( site );
			mockSettings( {
				blog_public: 0,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
			} );

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

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

			mockSite( site );
			mockSettings( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: true,
			} );

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

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

			mockSite( site );
			mockSettings( {
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

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
			} );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			await user.click( screen.getByRole( 'radio', { name: 'Private' } ) );
			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a public site coming soon', async () => {
			const user = userEvent.setup();

			mockSite( site );
			mockSettings( {
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

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

			await waitFor( () => {
				expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
			} );

			await user.click( screen.getByRole( 'radio', { name: 'Coming soon' } ) );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );

			await user.click( saveButton );

			expect( saveButton ).toBeDisabled();

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a coming soon site public (crawlable, allow data sharing)', async () => {
			const user = userEvent.setup();

			mockSite( site );
			mockSettings( {
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

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

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
				expect( scope.isDone() ).toBe( true );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a private site public (not crawlable, prevent data sharing)', async () => {
			const user = userEvent.setup();

			mockSite( site );
			mockSettings( {
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

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

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
				expect( scope.isDone() ).toBe( true );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'save site settings to make a public site crawlable but prevent data sharing', async () => {
			const user = userEvent.setup();

			mockSite( site );
			mockSettings( {
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

			render( <SiteVisibilitySettings siteSlug={ site.slug } /> );

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
				expect( scope.isDone() ).toBe( true );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		test( 'wpcomstaging warning shows "Add new domain" button when the site has no other domains', async () => {
			mockSite( { ...site, slug: 'site.wpcomstaging.com' } as Site );
			mockSettings( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
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
			mockSite( { ...site, slug: 'site.wpcomstaging.com' } as Site, {
				domains: [ 'site.wpcomstaging.com', 'example.com' ],
				primary_domain: 'site.wpcomstaging.com',
			} );
			mockSettings( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
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
			mockSite(
				{
					...site,
					slug: 'staging-site.wpcomstaging.com',
					is_wpcom_staging_site: true,
				} as Site,
				{
					domains: [ 'site.wpcomstaging.com' ],
					primary_domain: 'site.wpcomstaging.com',
				}
			);
			mockSettings( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
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
			mockSite( { ...site, slug: 'site.wpcomstaging.com' } as Site, {
				domains: [ 'site.wpcomstaging.com' ],
			} );
			mockSettings( {
				blog_public: 1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
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

			mockSite( { ...site, slug: 'site.wpcomstaging.com' } as Site, {
				domains: [ 'site.wpcomstaging.com' ],
				primary_domain: 'site.wpcomstaging.com',
			} );
			mockSettings( {
				blog_public: -1,
				wpcom_public_coming_soon: 0,
				wpcom_data_sharing_opt_out: false,
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
				expect( scope.isDone() ).toBe( true );
				expect( saveButton ).toBeEnabled();
			} );
		} );
	} );
} );
