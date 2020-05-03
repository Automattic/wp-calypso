/* eslint jest/expect-expect: [ "error", { "assertFunctionNames": [ "expect", "chaiExpect" ] } ] */

/**
 * External dependencies
 */
import { expect as chaiExpect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getSite,
	getSiteCollisions,
	isSiteConflicting,
	isSingleUserSite,
	isJetpackSite,
	isJetpackModuleActive,
	isJetpackMinimumVersion,
	getSiteSlug,
	getSiteDomain,
	getSiteTitle,
	getSiteThemeShowcasePath,
	isSitePreviewable,
	getSiteOption,
	isRequestingSites,
	isRequestingSite,
	getSeoTitleFormats,
	getSeoTitle,
	getSiteBySlug,
	getSiteByUrl,
	getSitePlan,
	getSitePlanSlug,
	isCurrentSitePlan,
	isCurrentPlanPaid,
	getSiteFrontPage,
	getSitePostsPage,
	getSiteFrontPageType,
	hasStaticFrontPage,
	canCurrentUserUseAds,
	canCurrentUserUseCustomerHome,
	canCurrentUserUseStore,
	canJetpackSiteUpdateFiles,
	canJetpackSiteAutoUpdateFiles,
	canJetpackSiteAutoUpdateCore,
	hasJetpackSiteJetpackThemes,
	hasJetpackSiteJetpackThemesExtendedFeatures,
	isJetpackSiteMultiSite,
	isJetpackSiteSecondaryNetworkSite,
	verifyJetpackModulesActive,
	hasJetpackSiteCustomDomain,
	getJetpackSiteUpdateFilesDisabledReasons,
	isJetpackSiteMainNetworkSite,
	getSiteAdminUrl,
	getCustomizerUrl,
	getJetpackComputedAttributes,
	hasDefaultSiteTitle,
	getSiteComputedAttributes,
} from '../selectors';
import config from 'config';
import { userState } from 'state/selectors/test/fixtures/user-state';

describe( 'selectors', () => {
	const createStateWithItems = ( items ) =>
		deepFreeze( {
			sites: { items },
		} );

	const siteId = 77203074;
	const nonExistingSiteId = 123;
	const stateWithNoItems = createStateWithItems( {} );

	beforeEach( () => {
		getSite.clearCache();
		getSiteCollisions.memoizedSelector.cache.clear();
		getSiteBySlug.memoizedSelector.cache.clear();
	} );

	describe( '#getSite()', () => {
		test( 'should return null if the site is not known', () => {
			const site = getSite(
				{
					...userState,
					sites: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( site ).to.be.null;
		} );

		test( 'should return a normalized site with computed attributes', () => {
			const state = {
				...userState,
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.com',
							jetpack: true,
							options: {
								jetpack_version: '8.0',
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					},
				},
				siteSettings: {
					items: {},
				},
			};

			const expectedSite = {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				URL: 'https://example.com',
				title: 'WordPress.com Example Blog',
				domain: 'example.com',
				slug: 'example.com',
				hasConflict: false,
				is_customizable: false,
				is_previewable: true,
				jetpack: true,
				canAutoupdateFiles: true,
				canUpdateFiles: true,
				isMainNetworkSite: false,
				isSecondaryNetworkSite: false,
				isSiteUpgradeable: null,
				options: {
					jetpack_version: '8.0',
					unmapped_url: 'https://example.wordpress.com',
				},
			};

			const site = getSite( state, 2916284 );
			expect( site ).toEqual( expectedSite );

			// Verify that getting by slug returns the object memoized when previously getting by ID
			const memoizedSlugSite = getSite( state, 'example.com' );
			chaiExpect( memoizedSlugSite ).to.equal( site );

			// Clear the memo cache and verify computed attributes are computed when getting by slug
			getSite.clearCache();
			const nonMemoizedSlugSite = getSite( state, 'example.com' );
			chaiExpect( nonMemoizedSlugSite ).to.not.equal( memoizedSlugSite );
			chaiExpect( nonMemoizedSlugSite ).to.eql( expectedSite );
		} );

		test( 'should return a normalized site with correct slug when sites with collisions are passed in attributes', () => {
			const site = getSite(
				{
					...userState,
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'https://example.com',
								jetpack: false,
								options: {
									unmapped_url: 'https://example.wordpress.com',
								},
							},
							3916284: {
								ID: 3916284,
								name: 'Jetpack Example Blog',
								URL: 'https://example.com',
								jetpack: true,
								options: {
									unmapped_url: 'https://example.com',
								},
							},
						},
					},
					siteSettings: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( site ).to.eql( {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				URL: 'https://example.wordpress.com',
				title: 'WordPress.com Example Blog',
				domain: 'example.wordpress.com',
				slug: 'example.wordpress.com',
				hasConflict: true,
				jetpack: false,
				is_customizable: false,
				is_previewable: true,
				options: {
					unmapped_url: 'https://example.wordpress.com',
				},
			} );
		} );

		test( 'should return an identical memoized site object when called for second time', () => {
			const site = {
				ID: 123,
				name: 'Example Blog',
				URL: 'https://example.wordpress.com',
			};
			const state = {
				...userState,
				sites: {
					items: {
						[ site.ID ]: site,
					},
				},
			};

			// Calling the selector two times on the same state should return identical value
			const firstSite = getSite( state, 123 );
			const secondSite = getSite( state, 123 );
			chaiExpect( firstSite ).to.be.ok;
			chaiExpect( secondSite ).to.be.ok;
			chaiExpect( firstSite ).to.equal( secondSite );

			// Construct an updated state with new items, but the first site object itself is unmodified
			const altSite = {
				ID: 456,
				name: 'Alternative Blog',
				URL: 'https://alt.wordpress.com',
			};
			const updatedState = {
				...userState,
				sites: {
					items: {
						[ site.ID ]: site,
						[ altSite.ID ]: altSite,
					},
				},
			};
			// Check that the new site is returned
			const altGotSite = getSite( updatedState, 456 );
			chaiExpect( altGotSite ).to.have.property( 'ID', 456 );

			// And that the old one was memoized and identical site object is returned
			const thirdSite = getSite( updatedState, 123 );
			chaiExpect( thirdSite ).to.equal( firstSite );
		} );
	} );

	describe( '#getSiteCollisions', () => {
		test( 'should not consider distinct URLs as conflicting', () => {
			const collisions = getSiteCollisions( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true },
					},
				},
			} );

			chaiExpect( collisions ).to.eql( [] );
		} );

		test( 'should return an array of conflicting site IDs', () => {
			const collisions = getSiteCollisions( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true },
					},
				},
			} );

			chaiExpect( collisions ).to.eql( [ 77203199 ] );
		} );

		test( 'should ignore URL protocol in considering conflict', () => {
			const collisions = getSiteCollisions( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'http://example.com', jetpack: true },
					},
				},
			} );

			chaiExpect( collisions ).to.eql( [ 77203199 ] );
		} );
	} );

	describe( '#isSiteConflicting()', () => {
		test( 'it should return false if the specified site ID is not included in conflicting set', () => {
			const isConflicting = isSiteConflicting(
				{
					sites: {
						items: {
							77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
							77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true },
						},
					},
				},
				77203199
			);

			chaiExpect( isConflicting ).to.be.false;
		} );

		test( 'should return true if the specified site ID is included in the conflicting set', () => {
			const isConflicting = isSiteConflicting(
				{
					sites: {
						items: {
							77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
							77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true },
						},
					},
				},
				77203199
			);

			chaiExpect( isConflicting ).to.be.true;
		} );
	} );

	describe( '#isSingleUserSite()', () => {
		test( 'should return null if the site is not known', () => {
			const singleUserSite = isSingleUserSite(
				{
					...userState,
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( singleUserSite ).to.be.null;
		} );

		test( 'it should return true if the site is a single user site', () => {
			const singleUserSite = isSingleUserSite(
				{
					...userState,
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.wordpress.com',
								single_user_site: true,
							},
						},
					},
					siteSettings: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( singleUserSite ).to.be.true;
		} );

		test( 'it should return false if the site is not a single user site', () => {
			const singleUserSite = isSingleUserSite(
				{
					...userState,
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.wordpress.com',
								single_user_site: false,
							},
						},
					},
					siteSettings: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( singleUserSite ).to.be.false;
		} );
	} );

	describe( '#isJetpackSite()', () => {
		test( 'should return null if the site is not known', () => {
			const jetpackSite = isJetpackSite(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( jetpackSite ).to.be.null;
		} );

		test( 'it should return true if the site is a jetpack site', () => {
			const jetpackSite = isJetpackSite(
				{
					sites: {
						items: {
							77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true },
						},
					},
				},
				77203074
			);

			chaiExpect( jetpackSite ).to.be.true;
		} );

		test( 'it should return false if the site is not a jetpack site', () => {
			const jetpackSite = isJetpackSite(
				{
					sites: {
						items: {
							77203074: { ID: 77203074, URL: 'https://example.worpdress.com', jetpack: false },
						},
					},
				},
				77203074
			);

			chaiExpect( jetpackSite ).to.be.false;
		} );
	} );

	describe( 'isJetpackModuleActive()', () => {
		test( 'should return null if the site is not known', () => {
			const isActive = isJetpackModuleActive(
				{
					sites: {
						items: {},
					},
				},
				77203074,
				'custom-content-types'
			);

			chaiExpect( isActive ).to.be.null;
		} );

		test( 'should return null if the site is known and not a Jetpack site', () => {
			const isActive = isJetpackModuleActive(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.wordpress.com',
								jetpack: false,
								options: {},
							},
						},
					},
				},
				77203074,
				'custom-content-types'
			);

			chaiExpect( isActive ).to.be.null;
		} );

		test( 'should return false if the site is a Jetpack site without the module active', () => {
			const isActive = isJetpackModuleActive(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									active_modules: [],
								},
							},
						},
					},
				},
				77203074,
				'custom-content-types'
			);

			chaiExpect( isActive ).to.be.false;
		} );

		test( 'should return true if the site is a Jetpack site and the module is active', () => {
			const isActive = isJetpackModuleActive(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									active_modules: [ 'custom-content-types' ],
								},
							},
						},
					},
				},
				77203074,
				'custom-content-types'
			);

			chaiExpect( isActive ).to.be.true;
		} );
	} );

	describe( 'isJetpackMinimumVersion()', () => {
		test( 'should return null if the site is not known', () => {
			const isMeetingMinimum = isJetpackMinimumVersion(
				{
					sites: {
						items: {},
					},
				},
				77203074,
				'4.1.0'
			);

			chaiExpect( isMeetingMinimum ).to.be.null;
		} );

		test( 'should return null if the site is not a Jetpack site', () => {
			const isMeetingMinimum = isJetpackMinimumVersion(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.wordpress.com',
								jetpack: false,
							},
						},
					},
				},
				77203074,
				'4.1.0'
			);

			chaiExpect( isMeetingMinimum ).to.be.null;
		} );

		test( 'should return null if the site option is not known', () => {
			const isMeetingMinimum = isJetpackMinimumVersion(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.com',
								jetpack: true,
							},
						},
					},
				},
				77203074,
				'4.1.0'
			);

			chaiExpect( isMeetingMinimum ).to.be.null;
		} );

		test( 'should return true if meeting the minimum version', () => {
			const isMeetingMinimum = isJetpackMinimumVersion(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									jetpack_version: '4.1.0',
								},
							},
						},
					},
				},
				77203074,
				'4.1.0'
			);

			chaiExpect( isMeetingMinimum ).to.be.true;
		} );

		test( 'should return false if not meeting the minimum version', () => {
			const isMeetingMinimum = isJetpackMinimumVersion(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									jetpack_version: '4.0.1',
								},
							},
						},
					},
				},
				77203074,
				'4.1.0'
			);

			chaiExpect( isMeetingMinimum ).to.be.false;
		} );
	} );

	describe( '#getSiteSlug()', () => {
		test( 'should return null if the site is not known', () => {
			const slug = getSiteSlug(
				{
					sites: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( slug ).to.be.null;
		} );

		test( 'should return the unmapped hostname for a redirect site', () => {
			const slug = getSiteSlug(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://testonesite2014.wordpress.com',
								options: {
									is_redirect: true,
									unmapped_url: 'https://example.wordpress.com',
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( slug ).to.equal( 'example.wordpress.com' );
		} );

		test( 'should return the unmapped hostname for a conflicting site', () => {
			const slug = getSiteSlug(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: false,
								options: {
									is_redirect: false,
									unmapped_url: 'https://testtwosites2014.wordpress.com',
								},
							},
							77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true },
						},
					},
				},
				77203199
			);

			chaiExpect( slug ).to.equal( 'testtwosites2014.wordpress.com' );
		} );

		test( 'should return the URL with scheme removed and paths separated', () => {
			const slug = getSiteSlug(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://testtwosites2014.wordpress.com/path/to/site',
							},
						},
					},
				},
				77203199
			);

			chaiExpect( slug ).to.equal( 'testtwosites2014.wordpress.com::path::to::site' );
		} );
	} );

	describe( '#getSiteDomain()', () => {
		test( 'should return null if the site is not known', () => {
			const domain = getSiteDomain(
				{
					sites: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( domain ).to.be.null;
		} );

		test( 'should strip the protocol off', () => {
			const domain = getSiteDomain(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.com',
							},
						},
					},
				},
				77203074
			);

			chaiExpect( domain ).to.equal( 'example.com' );
		} );

		test( 'should return the unmapped slug for a redirect site', () => {
			const domain = getSiteDomain(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://testonesite2014.wordpress.com',
								options: {
									is_redirect: true,
									unmapped_url: 'https://example.wordpress.com',
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( domain ).to.equal( 'example.wordpress.com' );
		} );

		test( 'should return the site slug for a conflicting site', () => {
			const domain = getSiteDomain(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: false,
								options: {
									is_redirect: false,
									unmapped_url: 'https://testtwosites2014.wordpress.com',
								},
							},
							77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true },
						},
					},
				},
				77203199
			);

			chaiExpect( domain ).to.equal( 'testtwosites2014.wordpress.com' );
		} );
	} );

	describe( 'getSiteTitle()', () => {
		test( 'should return null if the site is not known', () => {
			const title = getSiteTitle(
				{
					sites: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( title ).to.be.null;
		} );

		test( 'should return the trimmed name of the site', () => {
			const title = getSiteTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: '  Example Site  ',
								URL: 'https://example.com',
							},
						},
					},
				},
				2916284
			);

			chaiExpect( title ).to.equal( 'Example Site' );
		} );

		test( 'should fall back to the domain if the site name is empty', () => {
			const title = getSiteTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: '',
								URL: 'https://example.com',
							},
						},
					},
				},
				2916284
			);

			chaiExpect( title ).to.equal( 'example.com' );
		} );
	} );

	describe( 'isSitePreviewable()', () => {
		test( 'should return null if the site is not known', () => {
			const isPreviewable = isSitePreviewable(
				{
					sites: {
						items: {},
					},
				},
				77203199
			);

			chaiExpect( isPreviewable ).to.be.null;
		} );

		test( 'should return false if the site is VIP', () => {
			const isPreviewable = isSitePreviewable(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								is_vip: true,
								options: {
									unmapped_url: 'https://example.wordpress.com',
								},
							},
						},
					},
				},
				77203199
			);

			chaiExpect( isPreviewable ).to.be.false;
		} );

		test( 'should return false if the site unmapped URL is unknown', () => {
			const isPreviewable = isSitePreviewable(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
							},
						},
					},
				},
				77203199
			);

			chaiExpect( isPreviewable ).to.be.false;
		} );

		test( 'should return false if the site unmapped URL is non-HTTPS', () => {
			const isPreviewable = isSitePreviewable(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'http://example.com',
								options: {
									unmapped_url: 'http://example.com',
								},
							},
						},
					},
				},
				77203199
			);

			chaiExpect( isPreviewable ).to.be.false;
		} );

		test( 'should return true if the site unmapped URL is HTTPS', () => {
			const isPreviewable = isSitePreviewable(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									unmapped_url: 'https://example.wordpress.com',
								},
							},
						},
					},
				},
				77203199
			);

			chaiExpect( isPreviewable ).to.be.true;
		} );
	} );

	describe( 'getSiteOption()', () => {
		test( 'should return null if site is not known', () => {
			const siteOption = getSiteOption(
				{
					sites: {
						items: {},
					},
				},
				77203199,
				'example_option'
			);

			chaiExpect( siteOption ).to.be.null;
		} );

		test( 'should return null if the options are not known for that site', () => {
			const siteOption = getSiteOption(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
							},
						},
					},
				},
				77203199,
				'example_option'
			);

			chaiExpect( siteOption ).to.be.null;
		} );

		test( 'should return null if the option is not known for that site', () => {
			const siteOption = getSiteOption(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									unmapped_url: 'https://example.wordpress.com',
								},
							},
						},
					},
				},
				77203199,
				'example_option'
			);

			chaiExpect( siteOption ).to.be.null;
		} );

		test( 'should return the option value if the option is known for that site', () => {
			const siteOption = getSiteOption(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									example_option: 'example value',
								},
							},
						},
					},
				},
				77203199,
				'example_option'
			);

			chaiExpect( siteOption ).to.eql( 'example value' );
		} );
	} );

	describe( '#isRequestingSites()', () => {
		test( 'should return false if a request is not in progress', () => {
			const isRequesting = isRequestingSites( {
				sites: {
					requestingAll: false,
				},
			} );

			chaiExpect( isRequesting ).to.be.false;
		} );

		test( 'should return true if a request is in progress', () => {
			const isRequesting = isRequestingSites( {
				sites: {
					requestingAll: true,
				},
			} );

			chaiExpect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isRequestingSite()', () => {
		test( 'should return false if no requests have been triggered', () => {
			const isRequesting = isRequestingSite(
				{
					sites: {
						requesting: {},
					},
				},
				2916284
			);

			chaiExpect( isRequesting ).to.be.false;
		} );

		test( 'should return true if a request is in progress', () => {
			const isRequesting = isRequestingSite(
				{
					sites: {
						requesting: {
							2916284: true,
						},
					},
				},
				2916284
			);

			chaiExpect( isRequesting ).to.be.true;
		} );

		test( 'should return false after a request has completed', () => {
			const isRequesting = isRequestingSite(
				{
					sites: {
						requesting: {
							2916284: false,
						},
					},
				},
				2916284
			);

			chaiExpect( isRequesting ).to.be.false;
		} );
	} );

	describe( 'getSeoTitleFormats()', () => {
		test( 'should return an empty object for an unknown site', () => {
			const seoTitleFormats = getSeoTitleFormats(
				{
					sites: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( seoTitleFormats ).to.eql( {} );
		} );

		test( 'should return an empty object when unavailable for a known site', () => {
			const seoTitleFormats = getSeoTitleFormats(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {},
								},
							},
						},
					},
				},
				2916284
			);

			chaiExpect( seoTitleFormats ).to.eql( {} );
		} );

		test( 'should return seo title formats by type if available', () => {
			const seoTitleFormats = getSeoTitleFormats(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										archives: [],
										front_page: [
											{
												type: 'string',
												value: 'Site Title',
											},
										],
										groups: [],
										pages: [],
										posts: [],
									},
								},
							},
						},
					},
				},
				2916284
			);

			chaiExpect( seoTitleFormats ).to.eql( {
				archives: [],
				frontPage: [
					{
						type: 'string',
						value: 'Site Title',
					},
				],
				groups: [],
				pages: [],
				posts: [],
			} );
		} );
	} );

	describe( 'getSeoTitle()', () => {
		test( 'should return an empty string when there is no site ID in data', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {},
					},
				},
				'frontPage',
				{}
			);

			chaiExpect( seoTitle ).to.eql( '' );
		} );

		test( 'should convert site name and tagline for front page title type', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										front_page: [
											{
												value: 'siteName',
											},
											{
												type: 'string',
												value: ' | ',
											},
											{
												value: 'tagline',
											},
										],
									},
								},
							},
						},
					},
				},
				'frontPage',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Site Title | Site Tagline' );
		} );

		test( 'should default to site name for front page title type if no other title is set', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										front_page: [],
									},
								},
							},
						},
					},
				},
				'frontPage',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Site Title' );
		} );

		test( 'should convert site name, tagline and post title for posts title type', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										posts: [
											{
												value: 'siteName',
											},
											{
												type: 'string',
												value: ' | ',
											},
											{
												value: 'tagline',
											},
											{
												type: 'string',
												value: ' > ',
											},
											{
												value: 'postTitle',
											},
										],
									},
								},
							},
						},
					},
				},
				'posts',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					post: {
						title: 'Post Title',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Site Title | Site Tagline > Post Title' );
		} );

		test( 'should default to post title for posts title type if no other title is set', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										posts: [],
									},
								},
							},
						},
					},
				},
				'posts',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					post: {
						title: 'Post Title',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Post Title' );
		} );

		test( 'should return empty string as post title for posts title type if post title is missing', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										posts: [],
									},
								},
							},
						},
					},
				},
				'posts',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					post: {},
				}
			);

			chaiExpect( seoTitle ).to.eql( '' );
		} );

		test( 'should convert site name, tagline and page title for pages title type', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										pages: [
											{
												value: 'siteName',
											},
											{
												type: 'string',
												value: ' | ',
											},
											{
												value: 'tagline',
											},
											{
												type: 'string',
												value: ' > ',
											},
											{
												value: 'pageTitle',
											},
										],
									},
								},
							},
						},
					},
				},
				'pages',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					post: {
						title: 'Page Title',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Site Title | Site Tagline > Page Title' );
		} );

		test( 'should default to empty string for pages title type if no other title is set', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										pages: [],
									},
								},
							},
						},
					},
				},
				'pages',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					post: {
						title: 'Page Title',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( '' );
		} );

		test( 'should return empty string as page title for pages title type if page title is missing', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										pages: [],
									},
								},
							},
						},
					},
				},
				'pages',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					post: {},
				}
			);

			chaiExpect( seoTitle ).to.eql( '' );
		} );

		test( 'should convert site name, tagline and group name for groups title type', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										groups: [
											{
												value: 'siteName',
											},
											{
												type: 'string',
												value: ' | ',
											},
											{
												value: 'tagline',
											},
											{
												type: 'string',
												value: ' > ',
											},
											{
												value: 'groupTitle',
											},
										],
									},
								},
							},
						},
					},
				},
				'groups',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					tag: 'Tag Name',
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Site Title | Site Tagline > Tag Name' );
		} );

		test( 'should default to empty string for groups title type if no other title is set', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										groups: [],
									},
								},
							},
						},
					},
				},
				'groups',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( '' );
		} );

		test( 'should convert site name, tagline and date for archives title type', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										archives: [
											{
												value: 'siteName',
											},
											{
												type: 'string',
												value: ' | ',
											},
											{
												value: 'tagline',
											},
											{
												type: 'string',
												value: ' > ',
											},
											{
												value: 'date',
											},
										],
									},
								},
							},
						},
					},
				},
				'archives',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					date: 'January 2000',
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Site Title | Site Tagline > January 2000' );
		} );

		test( 'should default to empty string for archives title type if no other title is set', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {
										archives: [],
									},
								},
							},
						},
					},
				},
				'archives',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( '' );
		} );

		test( 'should default to post title for a misc title type', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {},
								},
							},
						},
					},
				},
				'exampleType',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
					post: {
						title: 'Post Title',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Post Title' );
		} );

		test( 'should default to site name for a misc title type if post title is missing', () => {
			const seoTitle = getSeoTitle(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								options: {
									advanced_seo_title_formats: {},
								},
							},
						},
					},
				},
				'exampleType',
				{
					site: {
						ID: 2916284,
						name: 'Site Title',
						description: 'Site Tagline',
					},
				}
			);

			chaiExpect( seoTitle ).to.eql( 'Site Title' );
		} );
	} );

	describe( '#getSiteBySlug()', () => {
		test( 'should return null if a site cannot be found', () => {
			const site = getSiteBySlug(
				{
					sites: {
						items: {},
					},
				},
				'testtwosites2014.wordpress.com'
			);

			chaiExpect( site ).to.be.null;
		} );

		test( 'should return a matched site', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com',
						},
					},
				},
			};
			const site = getSiteBySlug( state, 'testtwosites2014.wordpress.com' );

			chaiExpect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );

		test( 'should return a matched site with nested path', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,

							URL: 'https://testtwosites2014.wordpress.com/path/to/site',
						},
					},
				},
			};
			const site = getSiteBySlug( state, 'testtwosites2014.wordpress.com::path::to::site' );

			chaiExpect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );

		test( 'should return a matched site jetpack site when the sites conflict', () => {
			const state = {
				sites: {
					items: {
						1: {
							ID: 1,
							URL: 'https://example.com',
							jetpack: false,
							option: {
								unmapped_url: 'https://abc.wordpress.com',
								is_redirect: false,
							},
						},
						2: {
							ID: 2,
							jetpack: true,
							URL: 'https://example.com',
						},
					},
				},
			};
			const site = getSiteBySlug( state, 'example.com' );
			chaiExpect( site ).to.equal( state.sites.items[ 2 ] );
		} );
	} );

	describe( '#getSiteByUrl()', () => {
		test( 'should return null if a site cannot be found', () => {
			const site = getSiteByUrl(
				{
					sites: {
						items: {},
					},
				},
				'https://testtwosites2014.wordpress.com'
			);

			chaiExpect( site ).to.be.null;
		} );

		test( 'should return a matched site', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com',
						},
					},
				},
			};
			const site = getSiteByUrl( state, 'https://testtwosites2014.wordpress.com' );

			chaiExpect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );

		test( 'should return a matched site with nested path', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com/path/to/site',
						},
					},
				},
			};
			const site = getSiteByUrl( state, 'https://testtwosites2014.wordpress.com/path/to/site' );

			chaiExpect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );
	} );

	describe( '#getSitePlan()', () => {
		test( 'should return null if the site is not known', () => {
			const sitePlan = getSitePlan(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( sitePlan ).to.be.null;
		} );

		test( "it should return site's plan object.", () => {
			const sitePlan = getSitePlan(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1008,
									product_slug: 'business-bundle',
									product_name_short: 'Business',
									free_trial: false,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( sitePlan ).to.eql( {
				product_id: 1008,
				product_slug: 'business-bundle',
				product_name_short: 'Business',
				free_trial: false,
			} );
		} );

		test( 'it should return free plan if expired', () => {
			const sitePlan = getSitePlan(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1008,
									product_slug: 'business-bundle',
									product_name_short: 'Business',
									free_trial: false,
									expired: true,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( sitePlan ).to.eql( {
				product_id: 1,
				product_slug: 'free_plan',
				product_name_short: 'Free',
				free_trial: false,
				expired: false,
			} );
		} );

		test( 'it should return jetpack free plan if expired', () => {
			const sitePlan = getSitePlan(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								jetpack: true,
								plan: {
									product_id: 1234,
									product_slug: 'fake-plan',
									product_name_short: 'Fake Plan',
									free_trial: false,
									expired: true,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( sitePlan ).to.eql( {
				product_id: 2002,
				product_slug: 'jetpack_free',
				product_name_short: 'Free',
				free_trial: false,
				expired: false,
			} );
		} );
	} );

	describe( '#getSitePlanSlug()', () => {
		test( 'should return undefined if the plan slug is not known', () => {
			const planSlug = getSitePlanSlug(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( planSlug ).to.be.undefined;
		} );

		test( 'should return the plan slug if it is known', () => {
			const planSlug = getSitePlanSlug(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1234,
									product_slug: 'fake-plan',
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( planSlug ).to.eql( 'fake-plan' );
		} );
	} );

	describe( '#isCurrentSitePlan()', () => {
		test( 'should return null if the site is not known', () => {
			const isCurrent = isCurrentSitePlan(
				{
					sites: {
						items: {},
					},
				},
				77203074,
				1008
			);

			chaiExpect( isCurrent ).to.be.null;
		} );

		test( 'should return null if the planProductId is not supplied', () => {
			const isCurrent = isCurrentSitePlan(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1008,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( isCurrent ).to.be.null;
		} );

		test( "it should return true if the site's plan matches supplied planProductId", () => {
			const isCurrent = isCurrentSitePlan(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1008,
								},
							},
						},
					},
				},
				77203074,
				1008
			);

			chaiExpect( isCurrent ).to.be.true;
		} );

		test( "it should return false if the site's plan doesn't match supplied planProductId", () => {
			const isCurrent = isCurrentSitePlan(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1008,
								},
							},
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( isCurrent ).to.be.false;
		} );
	} );

	describe( '#isCurrentPlanPaid()', () => {
		test( 'it should return true if not free plan', () => {
			const isPaid = isCurrentPlanPaid(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1008,
								},
							},
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( isPaid ).to.equal( true );
		} );
		test( 'it should return false if free plan', () => {
			const isPaid = isCurrentPlanPaid(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								plan: {
									product_id: 1,
								},
							},
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( isPaid ).to.equal( false );
		} );

		test( 'it should return null if plan is missing', () => {
			const isPaid = isCurrentPlanPaid(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
							},
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( isPaid ).to.equal( null );
		} );
	} );

	describe( 'getSiteThemeShowcasePath()', () => {
		test( 'it should return null if site is not tracked', () => {
			const showcasePath = getSiteThemeShowcasePath(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( showcasePath ).to.be.null;
		} );

		test( 'it should return null if site is jetpack', () => {
			const showcasePath = getSiteThemeShowcasePath(
				{
					sites: {
						items: {
							77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true },
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( showcasePath ).to.be.null;
		} );

		test( 'it should return null if theme_slug is not pub or premium', () => {
			const showcasePath = getSiteThemeShowcasePath(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								options: {
									theme_slug: 'a8c/ribs',
								},
							},
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( showcasePath ).to.be.null;
		} );

		test( 'it should return the theme showcase path on non-premium themes', () => {
			const showcasePath = getSiteThemeShowcasePath(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://testonesite2014.wordpress.com',
								options: {
									theme_slug: 'pub/motif',
								},
							},
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( showcasePath ).to.eql( '/theme/motif/testonesite2014.wordpress.com' );
		} );

		test( 'it should return the theme setup path on premium themes', () => {
			const showcasePath = getSiteThemeShowcasePath(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://testonesite2014.wordpress.com',
								options: {
									theme_slug: 'premium/journalistic',
								},
							},
						},
					},
				},
				77203074,
				1003
			);

			chaiExpect( showcasePath ).to.eql(
				'/theme/journalistic/setup/testonesite2014.wordpress.com'
			);
		} );
	} );

	describe( 'getSiteFrontPage()', () => {
		test( 'should return falsey if the site does not have a static page set as the front page', () => {
			const frontPage = getSiteFrontPage(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'posts',
									page_on_front: 0,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( frontPage ).to.be.not.ok;
		} );

		test( 'should return falsey if the site is not known', () => {
			const frontPage = getSiteFrontPage(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( frontPage ).to.be.not.ok;
		} );

		test( 'should return the page ID if the site has a static page set as the front page', () => {
			const frontPage = getSiteFrontPage(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'page',
									page_on_front: 1,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( frontPage ).to.eql( 1 );
		} );
	} );

	describe( 'hasStaticFrontPage()', () => {
		test( 'should return false if the site does not have a static page set as the front page', () => {
			const hasFrontPage = hasStaticFrontPage(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'posts',
									page_on_front: 0,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( hasFrontPage ).to.eql( false );
		} );

		test( 'should return false if the site does not have a `page_on_front` value', () => {
			const hasFrontPage = hasStaticFrontPage(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'posts',
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( hasFrontPage ).to.eql( false );
		} );

		test( 'should return false if the site is not known', () => {
			const hasFrontPage = hasStaticFrontPage(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( hasFrontPage ).to.eql( false );
		} );

		test( 'should return true if the site has a static page set as the front page', () => {
			const hasFrontPage = hasStaticFrontPage(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'page',
									page_on_front: 42,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( hasFrontPage ).to.eql( true );
		} );
	} );

	describe( 'getSitePostsPage()', () => {
		test( 'should return falsey if the site does not have a static page set as the posts page', () => {
			const postsPage = getSitePostsPage(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'posts',
									page_on_front: 0,
									page_for_posts: 0,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( postsPage ).to.be.not.ok;
		} );

		test( 'should return falsey if the site is not known', () => {
			const postsPage = getSitePostsPage(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( postsPage ).to.be.not.ok;
		} );

		test( 'should return the page ID if the site has a static page set as the posts page', () => {
			const postsPage = getSitePostsPage(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'page',
									page_on_front: 1,
									page_for_posts: 2,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( postsPage ).to.eql( 2 );
		} );
	} );

	describe( 'getSiteFrontPageType()', () => {
		test( 'should return falsey if the site is not known', () => {
			const frontPageType = getSiteFrontPageType(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( frontPageType ).to.be.not.ok;
		} );

		test( "should return the site's front page type", () => {
			const frontPageType = getSiteFrontPageType(
				{
					sites: {
						items: {
							77203074: {
								options: {
									show_on_front: 'page',
									page_on_front: 1,
									page_for_posts: 2,
								},
							},
						},
					},
				},
				77203074
			);

			chaiExpect( frontPageType ).to.eql( 'page' );
		} );
	} );

	describe( '#canJetpackSiteUpdateFiles()', () => {
		test( 'should return `null` for a non-existing site', () => {
			const canUpdateFiles = canJetpackSiteUpdateFiles( stateWithNoItems, nonExistingSiteId );
			chaiExpect( canUpdateFiles ).to.equal( null );
		} );

		test( 'it should return `false` for a non jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: false,
				},
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			chaiExpect( canUpdateFiles ).to.equal( null );
		} );

		test( 'it should return `false` if is a multi-network site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					is_multisite: true,
					options: {
						is_multi_network: true,
						jetpack_version: '3.4',
					},
				},
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			chaiExpect( canUpdateFiles ).to.equal( false );
		} );

		test( "it should return `false` if is not a main network site (urls don't match)", () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					options: {
						is_multi_network: false,
						jetpack_version: '3.4',
						unmapped_url: 'https://example.wordpress.com',
						main_network_site: 'https://anotherexample.wordpress.com',
					},
				},
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			chaiExpect( canUpdateFiles ).to.equal( false );
		} );

		test( 'it should return `false` if `disallow_file_mods` is disabled', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					options: {
						is_multi_network: false,
						jetpack_version: '3.4',
						unmapped_url: 'https://example.wordpress.com',
						main_network_site: 'https://example.wordpress.com',
						file_mod_disabled: [ 'disallow_file_mods' ],
					},
				},
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			chaiExpect( canUpdateFiles ).to.equal( false );
		} );

		test( 'it should return `false` if `has_no_file_system_write_access` is disabled', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					options: {
						is_multi_network: false,
						jetpack_version: '3.4',
						unmapped_url: 'https://example.wordpress.com',
						main_network_site: 'https://example.wordpress.com',
						file_mod_disabled: [ 'has_no_file_system_write_access' ],
					},
				},
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			chaiExpect( canUpdateFiles ).to.equal( false );
		} );

		test( 'it should return `true` for the site right configurations', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					options: {
						is_multi_network: false,
						jetpack_version: '3.4',
						unmapped_url: 'https://example.wordpress.com',
						main_network_site: 'https://example.wordpress.com',
						file_mod_disabled: [],
					},
				},
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			chaiExpect( canUpdateFiles ).to.equal( true );
		} );
	} );

	describe( '#canJetpackSiteAutoUpdateFiles()', () => {
		test( 'it should return `true` if the `file_mod_disabled` option does not contain `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: false,
					jetpack: true,
					options: {
						file_mod_disabled: [],
						jetpack_version: '3.4',
					},
				},
			} );

			const canAutoUpdateFiles = canJetpackSiteAutoUpdateFiles( state, siteId );
			chaiExpect( canAutoUpdateFiles ).to.equal( true );
		} );

		test( 'it should return `false` if the `file_mod_disabled` option contains `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: false,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'automatic_updater_disabled' ],
						jetpack_version: '3.4',
					},
				},
			} );

			const canAutoUpdateFiles = canJetpackSiteAutoUpdateFiles( state, siteId );
			chaiExpect( canAutoUpdateFiles ).to.equal( false );
		} );
	} );

	describe( '#canJetpackSiteAutoUpdateCore()', () => {
		test( 'it should return `true` if the `file_mod_disabled` option does not contain `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: false,
					jetpack: true,
					options: {
						file_mod_disabled: [],
						jetpack_version: '3.4',
					},
				},
			} );

			const canAutoUpdateCore = canJetpackSiteAutoUpdateCore( state, siteId );
			chaiExpect( canAutoUpdateCore ).to.equal( true );
		} );

		test( 'it should return `false` if the `file_mod_disabled` option contains `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: false,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'automatic_updater_disabled' ],
						jetpack_version: '3.4',
					},
				},
			} );

			const canAutoUpdateCore = canJetpackSiteAutoUpdateCore( state, siteId );
			chaiExpect( canAutoUpdateCore ).to.equal( false );
		} );
	} );

	describe( '#hasJetpackSiteJetpackThemes()', () => {
		test( 'it should return `false` if jetpack version is smaller than 3.7-beta', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '3.7-alpha',
					},
				},
			} );

			const hasThemes = hasJetpackSiteJetpackThemes( state, siteId );
			chaiExpect( hasThemes ).to.equal( false );
		} );

		test( 'it should return `true` if jetpack version is greater or equal to 3.7-beta', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '3.7',
					},
				},
			} );

			const hasThemes = hasJetpackSiteJetpackThemes( state, siteId );
			chaiExpect( hasThemes ).to.equal( true );
		} );
	} );

	describe( '#hasJetpackSiteJetpackThemesExtendedFeatures()', () => {
		test( 'it should return `null` if the given site is not a Jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
				},
			} );

			const hasThemesExtendedFeatures = hasJetpackSiteJetpackThemesExtendedFeatures(
				state,
				siteId
			);
			chaiExpect( hasThemesExtendedFeatures ).to.be.null;
		} );

		test( 'it should return `false` if jetpack version is smaller than 4.7', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '4.4.1',
					},
				},
			} );

			const hasThemesExtendedFeatures = hasJetpackSiteJetpackThemesExtendedFeatures(
				state,
				siteId
			);
			chaiExpect( hasThemesExtendedFeatures ).to.be.false;
		} );

		test( 'it should return `true` if jetpack version is greater or equal to 4.7', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '4.7',
					},
				},
			} );

			const hasThemesExtendedFeatures = hasJetpackSiteJetpackThemesExtendedFeatures(
				state,
				siteId
			);
			chaiExpect( hasThemesExtendedFeatures ).to.be.true;
		} );
	} );

	describe( 'isJetpackSiteMultiSite()', () => {
		test( 'should return null if the site is not known', () => {
			const isMultisite = isJetpackSiteMultiSite(
				{
					sites: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( isMultisite ).to.be.null;
		} );

		test( 'should return null if the site is not a Jetpack site', () => {
			const isMultisite = isJetpackSiteMultiSite(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								jetpack: false,
								is_multisite: true,
							},
						},
					},
				},
				2916284
			);

			chaiExpect( isMultisite ).to.be.null;
		} );

		test( 'should return true if the site is a Jetpack multisite', () => {
			const isMultisite = isJetpackSiteMultiSite(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								jetpack: true,
								is_multisite: true,
							},
						},
					},
				},
				2916284
			);

			chaiExpect( isMultisite ).to.be.true;
		} );

		test( 'should return false if the site is a Jetpack single site', () => {
			const isMultisite = isJetpackSiteMultiSite(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								jetpack: true,
								is_multisite: false,
							},
						},
					},
				},
				2916284
			);

			chaiExpect( isMultisite ).to.be.false;
		} );
	} );

	describe( '#isJetpackSiteSecondaryNetworkSite()', () => {
		test( 'should return `null` for a non-existing site', () => {
			const isSecondary = isJetpackSiteSecondaryNetworkSite( stateWithNoItems, nonExistingSiteId );
			chaiExpect( isSecondary ).to.equal( null );
		} );

		test( 'it should return `false` for non multisite site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: false,
				},
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			chaiExpect( isSecondary ).to.equal( false );
		} );

		test( 'it should return `false` for non-multisite/non-multinetwork sites', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						is_multi_network: false,
					},
				},
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			chaiExpect( isSecondary ).to.equal( false );
		} );

		test( 'it should return `false` for multisite sites without unmapped url', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: true,
					options: {
						is_multi_network: false,
						main_network_site: 'https://example.wordpress.com',
					},
				},
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			chaiExpect( isSecondary ).to.equal( false );
		} );

		test( 'it should return `false` for multisite sites without main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: true,
					options: {
						is_multi_network: false,
						unmapped_url: 'https://example.wordpress.com',
					},
				},
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			chaiExpect( isSecondary ).to.equal( false );
		} );

		test( 'it should return `true` for multisite sites which unmapped_url does not match their main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: true,
					options: {
						unmapped_url: 'https://secondary.wordpress.com',
						main_network_site: 'https://example.wordpress.com',
					},
				},
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			chaiExpect( isSecondary ).to.equal( true );
		} );
	} );

	describe( '#verifyJetpackModulesActive()', () => {
		test( 'should return `null` for a non-existing site', () => {
			const modulesActive = verifyJetpackModulesActive( stateWithNoItems, nonExistingSiteId, [
				'manage',
			] );
			chaiExpect( modulesActive ).to.equal( null );
		} );

		test( 'it should return `null` for a non jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: false,
					options: {},
				},
			} );

			const modulesActive = verifyJetpackModulesActive( state, siteId, [ 'manage' ] );
			chaiExpect( modulesActive ).to.equal( null );
		} );

		test( 'it should return `true` if all given modules are active for a site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'manage', 'sso', 'photon', 'omnisearch' ],
					},
				},
			} );

			const modulesActive = verifyJetpackModulesActive( state, siteId, [
				'omnisearch',
				'sso',
				'photon',
			] );
			chaiExpect( modulesActive ).to.equal( true );
		} );

		test( 'it should return `false` if not all given modules are active for a site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'manage', 'sso', 'photon', 'omnisearch' ],
					},
				},
			} );

			const modulesActive = verifyJetpackModulesActive( state, siteId, [
				'contact-form',
				'manage',
			] );
			chaiExpect( modulesActive ).to.equal( false );
		} );
	} );

	describe( '#hasJetpackSiteCustomDomain()', () => {
		test( 'should return `null` for a non-existing site', () => {
			const hasCustomDomain = hasJetpackSiteCustomDomain( stateWithNoItems, nonExistingSiteId );
			chaiExpect( hasCustomDomain ).to.equal( null );
		} );

		test( 'it should return `true` if `URL` and `unmapped_url` have different domains', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						unmapped_url: 'https://jetpack.co',
					},
				},
			} );

			const hasCustomDomain = hasJetpackSiteCustomDomain( state, siteId );
			chaiExpect( hasCustomDomain ).to.equal( true );
		} );

		test( 'it should return `false` if `URL` and `unmapped_url` have the same domain', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						unmapped_url: 'https://jetpacksite.me',
					},
				},
			} );

			const hasCustomDomain = hasJetpackSiteCustomDomain( state, siteId );
			chaiExpect( hasCustomDomain ).to.equal( false );
		} );
	} );

	describe( '#getJetpackSiteUpdateFilesDisabledReasons()', () => {
		test( 'it should have the correct reason for the clue `has_no_file_system_write_access`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'has_no_file_system_write_access' ],
					},
				},
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId );
			chaiExpect( reason ).to.deep.equal( [
				'The file permissions on this host prevent editing files.',
			] );
		} );

		test( 'it should have the correct reason for the clue `disallow_file_mods`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'disallow_file_mods' ],
					},
				},
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId );
			chaiExpect( reason ).to.deep.equal( [
				'File modifications are explicitly disabled by a site administrator.',
			] );
		} );

		test( 'it should have the correct reason for the clue `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'automatic_updater_disabled' ],
					},
				},
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId, 'autoupdateCore' );
			chaiExpect( reason ).to.deep.equal( [
				'Any autoupdates are explicitly disabled by a site administrator.',
			] );
		} );

		test( 'it should have the correct reason for the clue `wp_auto_update_core_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'wp_auto_update_core_disabled' ],
					},
				},
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId, 'autoupdateCore' );
			chaiExpect( reason ).to.deep.equal( [
				'Core autoupdates are explicitly disabled by a site administrator.',
			] );
		} );
	} );

	describe( '#isJetpackSiteMainNetworkSite()', () => {
		test( 'should return `null` for a non-existing site', () => {
			const isMainNetwork = isJetpackSiteMainNetworkSite( stateWithNoItems, nonExistingSiteId );
			chaiExpect( isMainNetwork ).to.equal( null );
		} );

		test( 'it should return `false` for non multisite site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: false,
				},
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			chaiExpect( isMainNetwork ).to.equal( false );
		} );

		test( 'it should return `false` for multisite sites without unmapped url', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					jetpack: true,
					options: {
						is_multi_network: false,
						main_network_site: 'https://example.wordpress.com',
					},
				},
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			chaiExpect( isMainNetwork ).to.equal( false );
		} );

		test( 'it should return `false` for multisite sites without main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					jetpack: true,
					options: {
						is_multi_network: false,
						unmapped_url: 'https://example.wordpress.com',
					},
				},
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			chaiExpect( isMainNetwork ).to.equal( false );
		} );

		test( 'it should return `true` for multisite sites and unmapped_url matches with main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					jetpack: true,
					options: {
						is_multi_network: false,
						unmapped_url: 'https://example.wordpress.com',
						main_network_site: 'https://example.wordpress.com',
					},
				},
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			chaiExpect( isMainNetwork ).to.equal( true );
		} );
	} );

	describe( 'getSiteAdminUrl()', () => {
		test( 'should return null if the admin URL is not known', () => {
			const adminUrl = getSiteAdminUrl(
				{
					sites: {
						items: {},
					},
				},
				2916284
			);

			chaiExpect( adminUrl ).to.be.null;
		} );

		test( 'should return the root admin url if no path specified', () => {
			const adminUrl = getSiteAdminUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									admin_url: 'https://example.wordpress.com/wp-admin/',
								},
							},
						},
					},
				},
				77203199
			);

			chaiExpect( adminUrl ).to.equal( 'https://example.wordpress.com/wp-admin/' );
		} );

		test( 'should return the admin url concatenated with path', () => {
			const adminUrl = getSiteAdminUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									admin_url: 'https://example.wordpress.com/wp-admin/',
								},
							},
						},
					},
				},
				77203199,
				'customize.php'
			);

			chaiExpect( adminUrl ).to.equal( 'https://example.wordpress.com/wp-admin/customize.php' );
		} );

		test( 'should return the admin url with path left slash trimmed automatically', () => {
			const adminUrl = getSiteAdminUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									admin_url: 'https://example.wordpress.com/wp-admin/',
								},
							},
						},
					},
				},
				77203199,
				'/customize.php'
			);

			chaiExpect( adminUrl ).to.equal( 'https://example.wordpress.com/wp-admin/customize.php' );
		} );
	} );

	describe( 'getCustomizerUrl()', () => {
		test( 'should return root path if slug for WordPress.com site is not known', () => {
			const customizerUrl = getCustomizerUrl(
				{
					sites: {
						items: {},
					},
				},
				77203199
			);

			chaiExpect( customizerUrl ).to.equal( '/customize' );
		} );

		test( 'should return customizer URL for WordPress.com site', () => {
			const customizerUrl = getCustomizerUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: false,
							},
						},
					},
				},
				77203199
			);

			chaiExpect( customizerUrl ).to.equal( '/customize/example.com' );
		} );

		test( 'should return null if admin URL for Jetpack site is not known', () => {
			const customizerUrl = getCustomizerUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: true,
							},
						},
					},
				},
				77203199
			);

			chaiExpect( customizerUrl ).to.be.null;
		} );

		test( 'should return customizer URL for Jetpack site', () => {
			const customizerUrl = getCustomizerUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									admin_url: 'https://example.com/wp-admin/',
								},
							},
						},
					},
				},
				77203199
			);

			chaiExpect( customizerUrl ).to.equal( 'https://example.com/wp-admin/customize.php' );
		} );

		test( 'should prepend panel path parameter for WordPress.com site', () => {
			const customizerUrl = getCustomizerUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: false,
							},
						},
					},
				},
				77203199,
				'identity'
			);

			chaiExpect( customizerUrl ).to.equal( '/customize/identity/example.com' );
		} );

		test( 'should prepend panel path parameter for Jetpack site', () => {
			const customizerUrl = getCustomizerUrl(
				{
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									admin_url: 'https://example.com/wp-admin/',
								},
							},
						},
					},
				},
				77203199,
				'identity'
			);

			chaiExpect( customizerUrl ).to.equal(
				'https://example.com/wp-admin/customize.php?autofocus%5Bsection%5D=title_tagline'
			);
		} );

		describe( 'browser', () => {
			beforeAll( () => {
				global.window = {
					location: {
						href: 'https://wordpress.com',
					},
				};
			} );

			afterAll( () => {
				global.window = undefined;
			} );

			test( 'should return customizer URL for Jetpack site', () => {
				const customizerUrl = getCustomizerUrl(
					{
						sites: {
							items: {
								77203199: {
									ID: 77203199,
									URL: 'https://example.com',
									jetpack: true,
									options: {
										admin_url: 'https://example.com/wp-admin/',
									},
								},
							},
						},
					},
					77203199
				);

				chaiExpect( customizerUrl ).to.equal(
					'https://example.com/wp-admin/customize.php?return=https%3A%2F%2Fwordpress.com'
				);
			} );
		} );

		describe( 'node', () => {
			test( 'should return customizer URL for Jetpack site', () => {
				const customizerUrl = getCustomizerUrl(
					{
						sites: {
							items: {
								77203199: {
									ID: 77203199,
									URL: 'https://example.com',
									jetpack: true,
									options: {
										admin_url: 'https://example.com/wp-admin/',
									},
								},
							},
						},
					},
					77203199
				);

				chaiExpect( customizerUrl ).to.equal( 'https://example.com/wp-admin/customize.php' );
			} );
		} );
	} );

	describe( 'hasDefaultSiteTitle()', () => {
		test( 'should return null if the site is not known', () => {
			const hasDefaultTitle = hasDefaultSiteTitle(
				{
					sites: {
						items: {},
					},
				},
				77203074
			);

			chaiExpect( hasDefaultTitle ).to.be.null;
		} );

		test( 'should return true if the site title is "Site Title"', () => {
			const hasDefaultTitle = hasDefaultSiteTitle(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'example.wordpress.com',
								name: 'Site Title',
							},
						},
					},
				},
				77203074
			);

			chaiExpect( hasDefaultTitle ).to.be.true;
		} );

		test( 'should return true if the site title is equal to the site slug', () => {
			const hasDefaultTitle = hasDefaultSiteTitle(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'example.wordpress.com',
								name: 'example.wordpress.com',
							},
						},
					},
				},
				77203074
			);

			chaiExpect( hasDefaultTitle ).to.be.true;
		} );

		test( 'should return false if the site title is any other title', () => {
			const hasDefaultTitle = hasDefaultSiteTitle(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'example.wordpress.com',
								name: 'Example Site Name',
							},
						},
					},
				},
				77203074
			);

			chaiExpect( hasDefaultTitle ).to.be.false;
		} );
	} );

	describe( 'getJetpackComputedAttributes()', () => {
		test( 'should return undefined attributes if a site is not Jetpack', () => {
			const state = {
				currentUser: {
					id: 73705554,
					capabilities: {
						77203074: {
							manage_options: false,
						},
					},
				},
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							jetpack: false,
						},
					},
				},
			};

			const noNewAttributes = getJetpackComputedAttributes( state, 77203074 );
			chaiExpect( noNewAttributes.canAutoupdateFiles ).to.equal( undefined );
			chaiExpect( noNewAttributes.canUpdateFiles ).to.equal( undefined );
			chaiExpect( noNewAttributes.isMainNetworkSite ).to.equal( undefined );
			chaiExpect( noNewAttributes.isSecondaryNetworkSite ).to.equal( undefined );
			chaiExpect( noNewAttributes.isSiteUpgradeable ).to.equal( undefined );
		} );

		test( 'should return exists for attributes if a site is Jetpack', () => {
			const state = {
				currentUser: {
					id: 73705554,
					capabilities: {
						77203074: {
							manage_options: false,
						},
					},
				},
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							jetpack: true,
						},
					},
				},
			};
			const noNewAttributes = getJetpackComputedAttributes( state, 77203074 );
			chaiExpect( noNewAttributes.canAutoupdateFiles ).to.have.property;
			chaiExpect( noNewAttributes.canUpdateFiles ).to.have.property;
			chaiExpect( noNewAttributes.isMainNetworkSite ).to.have.property;
			chaiExpect( noNewAttributes.isSecondaryNetworkSite ).to.have.property;
			chaiExpect( noNewAttributes.isSiteUpgradeable ).to.have.property;
		} );
	} );
	describe( 'getSiteComputedAttributes()', () => {
		test( 'should return null if site is not found', () => {
			const state = {
				...userState,
				sites: {
					items: {},
				},
			};
			const computedAttributes = getSiteComputedAttributes( state, 2916288 );
			expect( computedAttributes ).toBeNull();
		} );

		test( 'should return the "mandatory" attributes', () => {
			const state = {
				...userState,
				sites: {
					items: {
						2916288: {
							ID: 2916288,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.wordpress.com',
							jetpack: false,
						},
					},
				},
			};

			const computedAttributes = getSiteComputedAttributes( state, 2916288 );
			expect( computedAttributes ).toEqual( {
				title: 'WordPress.com Example Blog',
				is_previewable: false,
				is_customizable: false,
				hasConflict: false,
				domain: 'example.wordpress.com',
				slug: 'example.wordpress.com',
				options: {},
			} );
		} );

		test( 'should return the "mandatory" and optional attributes if conditions for those are met', () => {
			const options = {
				default_post_format: 'test',
				is_mapped_domain: true,
				unmapped_url: 'https://unmapped-url.wordpress.com',
				is_redirect: true,
			};
			const state = {
				...userState,
				sites: {
					items: {
						2916288: {
							ID: 2916288,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.wordpress.com',
							jetpack: false,
							options,
						},
						2916289: {
							ID: 2916289,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.wordpress.com',
							jetpack: true,
						},
					},
				},
			};

			const computedAttributes = getSiteComputedAttributes( state, 2916288 );
			expect( computedAttributes ).toEqual( {
				title: 'WordPress.com Example Blog',
				is_previewable: true,
				is_customizable: false,
				hasConflict: true,
				domain: 'unmapped-url.wordpress.com',
				slug: 'unmapped-url.wordpress.com',
				options,
				wpcom_url: 'unmapped-url.wordpress.com',
				URL: 'https://unmapped-url.wordpress.com',
			} );
		} );
	} );

	describe( 'canCurrentUserUseStore()', () => {
		const createState = (
			manage_options,
			is_automated_transfer,
			has_pending_automated_transfer
		) => ( {
			ui: {
				selectedSiteId: 1,
			},
			currentUser: {
				capabilities: {
					1: {
						manage_options,
					},
				},
			},
			sites: {
				items: {
					1: {
						options: {
							is_automated_transfer,
							has_pending_automated_transfer,
						},
					},
				},
			},
		} );

		test( 'should return true if site is AT and user can manage it', () => {
			expect( canCurrentUserUseStore( createState( true, true, false ) ) ).toBe( true );
		} );

		test( 'should return false if site is not AT and user can manage it', () => {
			expect( canCurrentUserUseStore( createState( true, false, false ) ) ).toBe( false );
		} );

		test( "should return false if site is AT and user can't manage it", () => {
			expect( canCurrentUserUseStore( createState( false, true, false ) ) ).toBe( false );
		} );

		test( "should return true if user can't manage a site, but it has background transfer and atomic store flow is enabled", () => {
			const oldEnabled = config.isEnabled;
			config.isEnabled = () => true;
			expect( canCurrentUserUseStore( createState( false, false, true ) ) ).toBe( true );
			config.isEnabled = oldEnabled;
		} );

		test( "should return false if user can't manage a site, but it has background transfer and atomic store flow is disabled", () => {
			expect( canCurrentUserUseStore( createState( false, false, true ) ) ).toBe( false );
		} );
	} );

	describe( 'canCurrentUserUseAds()', () => {
		const createState = ( manage_options, wordads, product_slug, activate_wordads = false ) => ( {
			ui: {
				selectedSiteId: 1,
			},
			currentUser: {
				capabilities: {
					1: {
						manage_options,
						activate_wordads: false,
					},
				},
			},
			sites: {
				items: {
					1: {
						plan: {
							product_slug,
						},
						options: {
							wordads,
						},
						capabilities: {
							manage_options,
							activate_wordads,
						},
					},
				},
			},
		} );

		test( 'should return true if site has WordAds user can manage it', () => {
			expect( canCurrentUserUseAds( createState( true, true, 'free_plan' ) ) ).toBe( true );
		} );

		test( 'should return true if site does not have WordAds, but is premium and user can activate them', () => {
			expect( canCurrentUserUseAds( createState( true, false, 'value_bundle', true ) ) ).toBe(
				true
			);
		} );

		test( 'should return false if site does not have WordAds, is free, but user can activate them', () => {
			expect( canCurrentUserUseAds( createState( true, false, 'free_plan', true ) ) ).toBe( false );
		} );

		test( "should return false if site doesn't have WordAds and user can manage it", () => {
			expect( canCurrentUserUseAds( createState( true, false, 'free_plan' ) ) ).toBe( false );
		} );

		test( 'should return false if site has WordAds user can not manage it', () => {
			expect( canCurrentUserUseAds( createState( false, true, 'free_plan' ) ) ).toBe( false );
		} );

		test( "should return false if site doesn't have WordAds and user can not manage it", () => {
			expect( canCurrentUserUseAds( createState( false, false, 'free_plan' ) ) ).toBe( false );
		} );
	} );

	describe( 'canCurrentUserUseCustomerHome()', () => {
		const createState = ( {
			created_at,
			manage_options = true,
			jetpack = false,
			vip = false,
			atomic = false,
		} = {} ) => ( {
			ui: {
				selectedSiteId: 1,
			},
			currentUser: {
				capabilities: {
					1: {
						manage_options,
					},
				},
			},
			sites: {
				items: {
					1: {
						jetpack,
						...( vip ? { is_vip: true } : {} ),
						options: { is_automated_transfer: atomic, created_at },
					},
				},
			},
		} );

		test( "should return false if user can't manage site options", () => {
			expect(
				canCurrentUserUseCustomerHome(
					createState( { created_at: '2020-01-01', manage_options: false } )
				)
			).toBe( false );
		} );

		test( 'should return false for Jetpack site', () => {
			expect(
				canCurrentUserUseCustomerHome( createState( { created_at: '2020-01-01', jetpack: true } ) )
			).toBe( false );
		} );

		test( 'should return false for VIP site', () => {
			expect(
				canCurrentUserUseCustomerHome( createState( { created_at: '2020-01-01', vip: true } ) )
			).toBe( false );
		} );

		test( 'should return true for Atomic site', () => {
			expect(
				canCurrentUserUseCustomerHome(
					createState( { created_at: '2020-01-01', jetpack: true, atomic: true } )
				)
			).toBe( true );
		} );
	} );
} );
