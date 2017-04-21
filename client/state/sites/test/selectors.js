/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import config from 'config';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	getSite,
	computeSiteOptions,
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
	isRequestingSites,
	isRequestingSite,
	getSiteBySlug,
	getSiteByUrl,
	getSitePlan,
	isCurrentSitePlan,
	isCurrentPlanPaid,
	getSiteFrontPage,
	getSitePostsPage,
	getSiteFrontPageType,
	hasStaticFrontPage,
	canJetpackSiteManage,
	canJetpackSiteUpdateFiles,
	canJetpackSiteAutoUpdateFiles,
	hasJetpackSiteJetpackThemes,
	hasJetpackSiteJetpackThemesExtendedFeatures,
	isJetpackSiteSecondaryNetworkSite,
	verifyJetpackModulesActive,
	getJetpackSiteRemoteManagementUrl,
	hasJetpackSiteCustomDomain,
	getJetpackSiteUpdateFilesDisabledReasons,
	siteHasMinimumJetpackVersion,
	isJetpackSiteMainNetworkSite,
	getSiteAdminUrl,
	getCustomizerUrl,
	getJetpackComputedAttributes,
	siteSupportsJetpackSettingsUi
} from '../selectors';

describe( 'selectors', () => {
	const createStateWithItems = items => deepFreeze( {
		sites: { items }
	} );

	const siteId = 77203074;
	const nonExistingSiteId = 123;
	const stateWithNoItems = createStateWithItems( {} );

	beforeEach( () => {
		getSite.memoizedSelector.cache.clear();
		getSiteCollisions.memoizedSelector.cache.clear();
	} );

	describe( '#getSite()', () => {
		useSandbox( ( sandbox ) => {
			sandbox.stub( config, 'isEnabled' ).withArgs( 'preview-layout' ).returns( true );
		} );

		it( 'should return null if the site is not known', () => {
			const site = getSite( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( site ).to.be.null;
		} );

		it( 'should return a normalized site with computed attributes', () => {
			const site = getSite( {
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.com',
							options: {
								unmapped_url: 'https://example.wordpress.com'
							}
						}
					}
				}
			}, 2916284 );

			expect( site ).to.eql( {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				URL: 'https://example.com',
				title: 'WordPress.com Example Blog',
				domain: 'example.com',
				slug: 'example.com',
				hasConflict: false,
				is_previewable: true,
				options: {
					default_post_format: 'standard',
					unmapped_url: 'https://example.wordpress.com'
				}
			} );
		} );
	} );

	describe( '#computeSiteOptions()', () => {
		it( 'should return null if the site is not known', () => {
			const siteOptions = computeSiteOptions( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( siteOptions ).to.be.null;
		} );

		it( 'should return a the site options along with the computed option wpcom_url', () => {
			const siteOptions = computeSiteOptions( {
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							URL: 'https://example.com',
							options: {
								unmapped_url: 'https://example.wordpress.com',
								is_mapped_domain: true
							}
						}
					}
				}
			}, 2916284 );

			expect( siteOptions ).to.eql( {
				default_post_format: 'standard',
				unmapped_url: 'https://example.wordpress.com',
				is_mapped_domain: true,
				wpcom_url: 'example.wordpress.com'
			} );
		} );

		it( 'should fix `default_post_format` if it is equal to \'0\'', () => {
			const siteOptions = computeSiteOptions( {
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							URL: 'https://example.com',
							options: {
								default_post_format: '0',
								unmapped_url: 'https://example.wordpress.com'
							}
						}
					}
				}
			}, 2916284 );

			expect( siteOptions ).to.eql( {
				default_post_format: 'standard',
				unmapped_url: 'https://example.wordpress.com'
			} );
		} );
	} );

	describe( '#getSiteCollisions', () => {
		it( 'should not consider distinct URLs as conflicting', () => {
			const collisions = getSiteCollisions( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true }
					}
				}
			} );

			expect( collisions ).to.eql( [] );
		} );

		it( 'should return an array of conflicting site IDs', () => {
			const collisions = getSiteCollisions( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true }
					}
				}
			} );

			expect( collisions ).to.eql( [ 77203199 ] );
		} );

		it( 'should ignore URL protocol in considering conflict', () => {
			const collisions = getSiteCollisions( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'http://example.com', jetpack: true }
					}
				}
			} );

			expect( collisions ).to.eql( [ 77203199 ] );
		} );
	} );

	describe( '#isSiteConflicting()', () => {
		it( 'it should return false if the specified site ID is not included in conflicting set', () => {
			const isConflicting = isSiteConflicting( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true }
					}
				}
			}, 77203199 );

			expect( isConflicting ).to.be.false;
		} );

		it( 'should return true if the specified site ID is included in the conflicting set', () => {
			const isConflicting = isSiteConflicting( {
				sites: {
					items: {
						77203199: { ID: 77203199, URL: 'https://example.com', jetpack: false },
						77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true }
					}
				}
			}, 77203199 );

			expect( isConflicting ).to.be.true;
		} );
	} );

	describe( '#isSingleUserSite()', () => {
		it( 'should return null if the site is not known', () => {
			const singleUserSite = isSingleUserSite( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( singleUserSite ).to.be.null;
		} );

		it( 'it should return true if the site is a single user site', () => {
			const singleUserSite = isSingleUserSite( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.wordpress.com', single_user_site: true }
					}
				}
			}, 77203074 );

			expect( singleUserSite ).to.be.true;
		} );

		it( 'it should return false if the site is not a single user site', () => {
			const singleUserSite = isSingleUserSite( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.wordpress.com', single_user_site: false }
					}
				}
			}, 77203074 );

			expect( singleUserSite ).to.be.false;
		} );
	} );

	describe( '#isJetpackSite()', () => {
		it( 'should return null if the site is not known', () => {
			const jetpackSite = isJetpackSite( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( jetpackSite ).to.be.null;
		} );

		it( 'it should return true if the site is a jetpack site', () => {
			const jetpackSite = isJetpackSite( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true }
					}
				}
			}, 77203074 );

			expect( jetpackSite ).to.be.true;
		} );

		it( 'it should return false if the site is not a jetpack site', () => {
			const jetpackSite = isJetpackSite( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.worpdress.com', jetpack: false }
					}
				}
			}, 77203074 );

			expect( jetpackSite ).to.be.false;
		} );
	} );

	describe( 'isJetpackModuleActive()', () => {
		it( 'should return null if the site is not known', () => {
			const isActive = isJetpackModuleActive( {
				sites: {
					items: {}
				}
			}, 77203074, 'custom-content-types' );

			expect( isActive ).to.be.null;
		} );

		it( 'should return null if the site is known and not a Jetpack site', () => {
			const isActive = isJetpackModuleActive( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.wordpress.com',
							jetpack: false,
							options: {}
						}
					}
				}
			}, 77203074, 'custom-content-types' );

			expect( isActive ).to.be.null;
		} );

		it( 'should return false if the site is a Jetpack site without the module active', () => {
			const isActive = isJetpackModuleActive( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								active_modules: []
							}
						}
					}
				}
			}, 77203074, 'custom-content-types' );

			expect( isActive ).to.be.false;
		} );

		it( 'should return true if the site is a Jetpack site and the module is active', () => {
			const isActive = isJetpackModuleActive( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								active_modules: [ 'custom-content-types' ]
							}
						}
					}
				}
			}, 77203074, 'custom-content-types' );

			expect( isActive ).to.be.true;
		} );
	} );

	describe( 'isJetpackMinimumVersion()', () => {
		it( 'should return null if the site is not known', () => {
			const isMeetingMinimum = isJetpackMinimumVersion( {
				sites: {
					items: {}
				}
			}, 77203074, '4.1.0' );

			expect( isMeetingMinimum ).to.be.null;
		} );

		it( 'should return null if the site is not a Jetpack site', () => {
			const isMeetingMinimum = isJetpackMinimumVersion( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.wordpress.com',
							jetpack: false
						}
					}
				}
			}, 77203074, '4.1.0' );

			expect( isMeetingMinimum ).to.be.null;
		} );

		it( 'should return null if the site option is not known', () => {
			const isMeetingMinimum = isJetpackMinimumVersion( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true
						}
					}
				}
			}, 77203074, '4.1.0' );

			expect( isMeetingMinimum ).to.be.null;
		} );

		it( 'should return true if meeting the minimum version', () => {
			const isMeetingMinimum = isJetpackMinimumVersion( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								jetpack_version: '4.1.0'
							}
						}
					}
				}
			}, 77203074, '4.1.0' );

			expect( isMeetingMinimum ).to.be.true;
		} );

		it( 'should return false if not meeting the minimum version', () => {
			const isMeetingMinimum = isJetpackMinimumVersion( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								jetpack_version: '4.0.1'
							}
						}
					}
				}
			}, 77203074, '4.1.0' );

			expect( isMeetingMinimum ).to.be.false;
		} );
	} );

	describe( '#getSiteSlug()', () => {
		it( 'should return null if the site is not known', () => {
			const slug = getSiteSlug( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( slug ).to.be.null;
		} );

		it( 'should return the unmapped hostname for a redirect site', () => {
			const slug = getSiteSlug( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								is_redirect: true,
								unmapped_url: 'https://example.wordpress.com'
							}
						}
					}
				}
			}, 77203074 );

			expect( slug ).to.equal( 'example.wordpress.com' );
		} );

		it( 'should return the unmapped hostname for a conflicting site', () => {
			const slug = getSiteSlug( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							jetpack: false,
							options: {
								is_redirect: false,
								unmapped_url: 'https://testtwosites2014.wordpress.com'
							}
						},
						77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true }
					}
				}
			}, 77203199 );

			expect( slug ).to.equal( 'testtwosites2014.wordpress.com' );
		} );

		it( 'should return the URL with scheme removed and paths separated', () => {
			const slug = getSiteSlug( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com/path/to/site'
						}
					}
				}
			}, 77203199 );

			expect( slug ).to.equal( 'testtwosites2014.wordpress.com::path::to::site' );
		} );
	} );

	describe( '#getSiteDomain()', () => {
		it( 'should return null if the site is not known', () => {
			const domain = getSiteDomain( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( domain ).to.be.null;
		} );

		it( 'should strip the protocol off', () => {
			const domain = getSiteDomain( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
						}
					}
				}
			}, 77203074 );

			expect( domain ).to.equal( 'example.com' );
		} );

		it( 'should return the unmapped slug for a redirect site', () => {
			const domain = getSiteDomain( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								is_redirect: true,
								unmapped_url: 'https://example.wordpress.com'
							}
						}
					}
				}
			}, 77203074 );

			expect( domain ).to.equal( 'example.wordpress.com' );
		} );

		it( 'should return the site slug for a conflicting site', () => {
			const domain = getSiteDomain( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							jetpack: false,
							options: {
								is_redirect: false,
								unmapped_url: 'https://testtwosites2014.wordpress.com'
							}
						},
						77203074: { ID: 77203074, URL: 'https://example.com', jetpack: true }
					}
				}
			}, 77203199 );

			expect( domain ).to.equal( 'testtwosites2014.wordpress.com' );
		} );
	} );

	describe( 'getSiteTitle()', () => {
		it( 'should return null if the site is not known', () => {
			const title = getSiteTitle( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( title ).to.be.null;
		} );

		it( 'should return the trimmed name of the site', () => {
			const title = getSiteTitle( {
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: '  Example Site  ',
							URL: 'https://example.com'
						}
					}
				}
			}, 2916284 );

			expect( title ).to.equal( 'Example Site' );
		} );

		it( 'should fall back to the domain if the site name is empty', () => {
			const title = getSiteTitle( {
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: '',
							URL: 'https://example.com'
						}
					}
				}
			}, 2916284 );

			expect( title ).to.equal( 'example.com' );
		} );
	} );

	describe( 'isSitePreviewable()', () => {
		context( 'config disabled', () => {
			useSandbox( ( sandbox ) => {
				sandbox.stub( config, 'isEnabled' ).withArgs( 'preview-layout' ).returns( false );
			} );

			it( 'should return false', () => {
				const isPreviewable = isSitePreviewable( {
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									unmapped_url: 'https://example.wordpress.com'
								}
							}
						}
					}
				}, 77203199 );

				expect( isPreviewable ).to.be.false;
			} );
		} );

		context( 'config enabled', () => {
			useSandbox( ( sandbox ) => {
				sandbox.stub( config, 'isEnabled' ).withArgs( 'preview-layout' ).returns( true );
			} );

			it( 'should return null if the site is not known', () => {
				const isPreviewable = isSitePreviewable( {
					sites: {
						items: {}
					}
				}, 77203199 );

				expect( isPreviewable ).to.be.null;
			} );

			it( 'should return false if the site is VIP', () => {
				const isPreviewable = isSitePreviewable( {
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								is_vip: true,
								options: {
									unmapped_url: 'https://example.wordpress.com'
								}
							}
						}
					}
				}, 77203199 );

				expect( isPreviewable ).to.be.false;
			} );

			it( 'should return false if the site unmapped URL is unknown', () => {
				const isPreviewable = isSitePreviewable( {
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com'
							}
						}
					}
				}, 77203199 );

				expect( isPreviewable ).to.be.false;
			} );

			it( 'should return false if the site unmapped URL is non-HTTPS', () => {
				const isPreviewable = isSitePreviewable( {
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'http://example.com',
								options: {
									unmapped_url: 'http://example.com'
								}
							}
						}
					}
				}, 77203199 );

				expect( isPreviewable ).to.be.false;
			} );

			it( 'should return true if the site unmapped URL is HTTPS', () => {
				const isPreviewable = isSitePreviewable( {
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								options: {
									unmapped_url: 'https://example.wordpress.com'
								}
							}
						}
					}
				}, 77203199 );

				expect( isPreviewable ).to.be.true;
			} );
		} );
	} );

	describe( '#isRequestingSites()', () => {
		it( 'should return false if a request is not in progress', () => {
			const isRequesting = isRequestingSites( {
				sites: {
					requestingAll: false
				}
			} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if a request is in progress', () => {
			const isRequesting = isRequestingSites( {
				sites: {
					requestingAll: true
				}
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isRequestingSite()', () => {
		it( 'should return false if no requests have been triggered', () => {
			const isRequesting = isRequestingSite( {
				sites: {
					requesting: {}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if a request is in progress', () => {
			const isRequesting = isRequestingSite( {
				sites: {
					requesting: {
						2916284: true
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false after a request has completed', () => {
			const isRequesting = isRequestingSite( {
				sites: {
					requesting: {
						2916284: false
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( '#getSiteBySlug()', () => {
		it( 'should return null if a site cannot be found', () => {
			const site = getSiteBySlug( {
				sites: {
					items: {}
				}
			}, 'testtwosites2014.wordpress.com' );

			expect( site ).to.be.null;
		} );

		it( 'should return a matched site', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com'
						}
					}
				}
			};
			const site = getSiteBySlug( state, 'testtwosites2014.wordpress.com' );

			expect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );

		it( 'should return a matched site with nested path', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com/path/to/site'
						}
					}
				}
			};
			const site = getSiteBySlug( state, 'testtwosites2014.wordpress.com::path::to::site' );

			expect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );
	} );

	describe( '#getSiteByUrl()', () => {
		it( 'should return null if a site cannot be found', () => {
			const site = getSiteByUrl( {
				sites: {
					items: {}
				}
			}, 'https://testtwosites2014.wordpress.com' );

			expect( site ).to.be.null;
		} );

		it( 'should return a matched site', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com'
						}
					}
				}
			};
			const site = getSiteByUrl( state, 'https://testtwosites2014.wordpress.com' );

			expect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );

		it( 'should return a matched site with nested path', () => {
			const state = {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://testtwosites2014.wordpress.com/path/to/site'
						}
					}
				}
			};
			const site = getSiteByUrl( state, 'https://testtwosites2014.wordpress.com/path/to/site' );

			expect( site ).to.equal( state.sites.items[ 77203199 ] );
		} );
	} );

	describe( '#getSitePlan()', () => {
		it( 'should return null if the site is not known', () => {
			const sitePlan = getSitePlan( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( sitePlan ).to.be.null;
		} );

		it( 'it should return site\'s plan object.', () => {
			const sitePlan = getSitePlan( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							plan: {
								product_id: 1008,
								product_slug: 'business-bundle',
								product_name_short: 'Business',
								free_trial: false
							}
						}
					}
				}
			}, 77203074 );

			expect( sitePlan ).to.eql( {
				product_id: 1008,
				product_slug: 'business-bundle',
				product_name_short: 'Business',
				free_trial: false
			} );
		} );

		it( 'it should return free plan if expired', () => {
			const sitePlan = getSitePlan( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							plan: {
								product_id: 1008,
								product_slug: 'business-bundle',
								product_name_short: 'Business',
								free_trial: false,
								expired: true
							}
						}
					}
				}
			}, 77203074 );

			expect( sitePlan ).to.eql( {
				product_id: 1,
				product_slug: 'free_plan',
				product_name_short: 'Free',
				free_trial: false,
				expired: false
			} );
		} );

		it( 'it should return jetpack free plan if expired', () => {
			const sitePlan = getSitePlan( {
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
								expired: true
							}
						}
					}
				}
			}, 77203074 );

			expect( sitePlan ).to.eql( {
				product_id: 2002,
				product_slug: 'jetpack_free',
				product_name_short: 'Free',
				free_trial: false,
				expired: false
			} );
		} );
	} );

	describe( '#isCurrentSitePlan()', () => {
		it( 'should return null if the site is not known', () => {
			const isCurrent = isCurrentSitePlan( {
				sites: {
					items: {}
				}
			}, 77203074, 1008 );

			expect( isCurrent ).to.be.null;
		} );

		it( 'should return null if the planProductId is not supplied', () => {
			const isCurrent = isCurrentSitePlan( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							plan: {
								product_id: 1008
							}
						}
					}
				}
			}, 77203074 );

			expect( isCurrent ).to.be.null;
		} );

		it( 'it should return true if the site\'s plan matches supplied planProductId', () => {
			const isCurrent = isCurrentSitePlan( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							plan: {
								product_id: 1008
							}
						}
					}
				}
			}, 77203074, 1008 );

			expect( isCurrent ).to.be.true;
		} );

		it( 'it should return false if the site\'s plan doesn\'t match supplied planProductId', () => {
			const isCurrent = isCurrentSitePlan( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							plan: {
								product_id: 1008
							}
						}
					}
				}
			}, 77203074, 1003 );

			expect( isCurrent ).to.be.false;
		} );
	} );

	describe( '#isCurrentPlanPaid()', () => {
		it( 'it should return true if not free plan', () => {
			const isPaid = isCurrentPlanPaid( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							plan: {
								product_id: 1008
							}
						}
					}
				}
			}, 77203074, 1003 );

			expect( isPaid ).to.equal( true );
		} );
		it( 'it should return false if free plan', () => {
			const isPaid = isCurrentPlanPaid( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							plan: {
								product_id: 1
							}
						}
					}
				}
			}, 77203074, 1003 );

			expect( isPaid ).to.equal( false );
		} );

		it( 'it should return null if plan is missing', () => {
			const isPaid = isCurrentPlanPaid( {
				sites: {
					items: {
						77203074: {
							ID: 77203074
						}
					}
				}
			}, 77203074, 1003 );

			expect( isPaid ).to.equal( null );
		} );
	} );

	describe( 'getSiteThemeShowcasePath()', () => {
		it( 'it should return null if site is not tracked', () => {
			const showcasePath = getSiteThemeShowcasePath( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( showcasePath ).to.be.null;
		} );

		it( 'it should return null if site is jetpack', () => {
			const showcasePath = getSiteThemeShowcasePath( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true }
					}
				}
			}, 77203074, 1003 );

			expect( showcasePath ).to.be.null;
		} );

		it( 'it should return null if theme_slug is not pub or premium', () => {
			const showcasePath = getSiteThemeShowcasePath( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.net',
							options: {
								theme_slug: 'a8c/ribs'
							}
						}
					}
				}
			}, 77203074, 1003 );

			expect( showcasePath ).to.be.null;
		} );

		it( 'it should return the theme showcase path on non-premium themes', () => {
			const showcasePath = getSiteThemeShowcasePath( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								theme_slug: 'pub/motif'
							}
						}
					}
				}
			}, 77203074, 1003 );

			expect( showcasePath ).to.eql( '/theme/motif/testonesite2014.wordpress.com' );
		} );

		it( 'it should return the theme setup path on premium themes', () => {
			const showcasePath = getSiteThemeShowcasePath( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								theme_slug: 'premium/journalistic'
							}
						}
					}
				}
			}, 77203074, 1003 );

			expect( showcasePath ).to.eql( '/theme/journalistic/setup/testonesite2014.wordpress.com' );
		} );
	} );

	describe( 'getSiteFrontPage()', () => {
		it( 'should return falsey if the site does not have a static page set as the front page', () => {
			const frontPage = getSiteFrontPage( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'posts',
								page_on_front: 0
							}
						}
					}
				}
			}, 77203074 );

			expect( frontPage ).to.be.not.ok;
		} );

		it( 'should return falsey if the site is not known', () => {
			const frontPage = getSiteFrontPage( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( frontPage ).to.be.not.ok;
		} );

		it( 'should return the page ID if the site has a static page set as the front page', () => {
			const frontPage = getSiteFrontPage( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'page',
								page_on_front: 1
							}
						}
					}
				}
			}, 77203074 );

			expect( frontPage ).to.eql( 1 );
		} );
	} );

	describe( 'hasStaticFrontPage()', () => {
		it( 'should return false if the site does not have a static page set as the front page', () => {
			const hasFrontPage = hasStaticFrontPage( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'posts',
								page_on_front: 0
							}
						}
					}
				}
			}, 77203074 );

			expect( hasFrontPage ).to.eql( false );
		} );

		it( 'should return false if the site does not have a `page_on_front` value', () => {
			const hasFrontPage = hasStaticFrontPage( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'posts',
							}
						}
					}
				}
			}, 77203074 );

			expect( hasFrontPage ).to.eql( false );
		} );

		it( 'should return false if the site is not known', () => {
			const hasFrontPage = hasStaticFrontPage( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( hasFrontPage ).to.eql( false );
		} );

		it( 'should return true if the site has a static page set as the front page', () => {
			const hasFrontPage = hasStaticFrontPage( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'page',
								page_on_front: 42
							}
						}
					}
				}
			}, 77203074 );

			expect( hasFrontPage ).to.eql( true );
		} );
	} );

	describe( 'getSitePostsPage()', () => {
		it( 'should return falsey if the site does not have a static page set as the posts page', () => {
			const postsPage = getSitePostsPage( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'posts',
								page_on_front: 0,
								page_for_posts: 0
							}
						}
					}
				}
			}, 77203074 );

			expect( postsPage ).to.be.not.ok;
		} );

		it( 'should return falsey if the site is not known', () => {
			const postsPage = getSitePostsPage( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( postsPage ).to.be.not.ok;
		} );

		it( 'should return the page ID if the site has a static page set as the posts page', () => {
			const postsPage = getSitePostsPage( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'page',
								page_on_front: 1,
								page_for_posts: 2
							}
						}
					}
				}
			}, 77203074 );

			expect( postsPage ).to.eql( 2 );
		} );
	} );

	describe( 'getSiteFrontPageType()', () => {
		it( 'should return falsey if the site is not known', () => {
			const frontPageType = getSiteFrontPageType( {
				sites: {
					items: {}
				}
			}, 77203074 );

			expect( frontPageType ).to.be.not.ok;
		} );

		it( 'should return the site\'s front page type', () => {
			const frontPageType = getSiteFrontPageType( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							options: {
								show_on_front: 'page',
								page_on_front: 1,
								page_for_posts: 2
							}
						}
					}
				}
			}, 77203074 );

			expect( frontPageType ).to.eql( 'page' );
		} );
	} );

	describe( '#canJetpackSiteManage()', () => {
		it( 'it should return `null` for a non-existing site', () => {
			const canManage = canJetpackSiteManage( stateWithNoItems, nonExistingSiteId );
			expect( canManage ).to.equal( null );
		} );

		it( 'it should return `null` for a non jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: false
				}
			} );

			const canManage = canJetpackSiteManage( state, siteId );
			expect( canManage ).to.equal( null );
		} );

		it( 'it should return `true` if jetpack version is strictly less than 3.4', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '3.3'
					}
				}
			} );

			const canManage = canJetpackSiteManage( state, siteId );
			expect( canManage ).to.equal( true );
		} );

		it( 'it should return `true` if the modules has not yet been fetched', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: null,
						jetpack_version: '3.4'
					}
				}
			} );

			const canManage = canJetpackSiteManage( state, siteId );
			expect( canManage ).to.equal( true );
		} );

		it( 'it should return `true` if jetpack version is greater or equal to 3.4 and the manage module is active', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'manage' ],
						jetpack_version: '3.4'
					}
				}
			} );

			const canManage = canJetpackSiteManage( state, siteId );
			expect( canManage ).to.equal( true );
		} );

		it( 'it should return `false` if jetpack version is greater or equal to 3.4 and the manage module is not active', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'sso' ],
						jetpack_version: '3.4'
					}
				}
			} );

			const canManage = canJetpackSiteManage( state, siteId );
			expect( canManage ).to.equal( false );
		} );
	} );

	describe( '#canJetpackSiteUpdateFiles()', () => {
		it( 'should return `null` for a non-existing site', () => {
			const canUpdateFiles = canJetpackSiteUpdateFiles( stateWithNoItems, nonExistingSiteId );
			expect( canUpdateFiles ).to.equal( null );
		} );

		it( 'it should return `false` for a non jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: false,
				}
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			expect( canUpdateFiles ).to.equal( null );
		} );

		it( 'it should return `false` if jetpack version is smaller than minimum version', () => {
			const smallerVersion = '3.2';
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						jetpack_version: smallerVersion
					}
				}
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			expect( canUpdateFiles ).to.equal( false );
		} );

		it( 'it should return `false` if is a multi-network site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					is_multisite: true,
					options: {
						is_multi_network: true,
						jetpack_version: '3.4',
					}
				}
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			expect( canUpdateFiles ).to.equal( false );
		} );

		it( 'it should return `false` if is not a main network site (urls don\'t match)', () => {
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
						main_network_site: 'https://anotherexample.wordpress.com'
					}
				}
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			expect( canUpdateFiles ).to.equal( false );
		} );

		it( 'it should return `false` if `disallow_file_mods` is disabled', () => {
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
						file_mod_disabled: [
							'disallow_file_mods',
						]
					}
				}
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			expect( canUpdateFiles ).to.equal( false );
		} );

		it( 'it should return `false` if `has_no_file_system_write_access` is disabled', () => {
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
						file_mod_disabled: [
							'has_no_file_system_write_access',
						]
					}
				}
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			expect( canUpdateFiles ).to.equal( false );
		} );

		it( 'it should return `true` for the site right configurations', () => {
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
						file_mod_disabled: []
					}
				}
			} );

			const canUpdateFiles = canJetpackSiteUpdateFiles( state, siteId );
			expect( canUpdateFiles ).to.equal( true );
		} );
	} );

	describe( '#canJetpackSiteAutoUpdateFiles()', () => {
		it( 'it should return `true` if the `file_mod_disabled` option does not contain `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: false,
					jetpack: true,
					options: {
						file_mod_disabled: [],
						jetpack_version: '3.4'
					}
				}
			} );

			const canAutoUpdateFiles = canJetpackSiteAutoUpdateFiles( state, siteId );
			expect( canAutoUpdateFiles ).to.equal( true );
		} );

		it( 'it should return `false` if the `file_mod_disabled` option contains `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: false,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'automatic_updater_disabled' ],
						jetpack_version: '3.4'
					}
				}
			} );

			const canAutoUpdateFiles = canJetpackSiteAutoUpdateFiles( state, siteId );
			expect( canAutoUpdateFiles ).to.equal( false );
		} );
	} );

	describe( '#siteHasMinimumJetpackVersion()', () => {
		it( 'it should return `null` for a non-existing site', () => {
			const hasMinimumVersion = siteHasMinimumJetpackVersion( stateWithNoItems, nonExistingSiteId );
			expect( hasMinimumVersion ).to.equal( null );
		} );

		it( 'it should return `null` for a non jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: false,
				}
			} );

			const hasMinimumVersion = siteHasMinimumJetpackVersion( state, siteId );
			expect( hasMinimumVersion ).to.equal( null );
		} );

		it( 'it should return `true` if jetpack version is greater that minimum version', () => {
			const greaterVersion = '3.5';
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						jetpack_version: greaterVersion
					}
				}
			} );

			const hasMinimumVersion = siteHasMinimumJetpackVersion( state, siteId );
			expect( hasMinimumVersion ).to.equal( true );
		} );

		it( 'it should return `true` if jetpack version is equal to minimum version', () => {
			const equalVersion = config( 'jetpack_min_version' );
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						jetpack_version: equalVersion
					}
				}
			} );

			const hasMinimumVersion = siteHasMinimumJetpackVersion( state, siteId );
			expect( hasMinimumVersion ).to.equal( true );
		} );

		it( 'it should return `false` if jetpack version is smaller than minimum version', () => {
			const smallerVersion = '3.2';
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						jetpack_version: smallerVersion
					}
				}
			} );

			const hasMinimumVersion = siteHasMinimumJetpackVersion( state, siteId );
			expect( hasMinimumVersion ).to.equal( false );
		} );
	} );

	describe( '#hasJetpackSiteJetpackThemes()', () => {
		it( 'it should return `false` if jetpack version is smaller than 3.7-beta', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '3.7-alpha'
					}
				}
			} );

			const hasThemes = hasJetpackSiteJetpackThemes( state, siteId );
			expect( hasThemes ).to.equal( false );
		} );

		it( 'it should return `true` if jetpack version is greater or equal to 3.7-beta', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '3.7'
					}
				}
			} );

			const hasThemes = hasJetpackSiteJetpackThemes( state, siteId );
			expect( hasThemes ).to.equal( true );
		} );
	} );

	describe( '#hasJetpackSiteJetpackThemesExtendedFeatures()', () => {
		it( 'it should return `null` if the given site is not a Jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me'
				}
			} );

			const hasThemesExtendedFeatures = hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId );
			expect( hasThemesExtendedFeatures ).to.be.null;
		} );

		it( 'it should return `false` if jetpack version is smaller than 4.7', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '4.4.1'
					}
				}
			} );

			const hasThemesExtendedFeatures = hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId );
			expect( hasThemesExtendedFeatures ).to.be.false;
		} );

		it( 'it should return `true` if jetpack version is greater or equal to 4.7', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						jetpack_version: '4.7'
					}
				}
			} );

			const hasThemesExtendedFeatures = hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId );
			expect( hasThemesExtendedFeatures ).to.be.true;
		} );
	} );

	describe( '#isJetpackSiteSecondaryNetworkSite()', () => {
		it( 'should return `null` for a non-existing site', () => {
			const isSecondary = isJetpackSiteSecondaryNetworkSite( stateWithNoItems, nonExistingSiteId );
			expect( isSecondary ).to.equal( null );
		} );

		it( 'it should return `false` for non multisite site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: false
				}
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			expect( isSecondary ).to.equal( false );
		} );

		it( 'it should return `false` for non-multisite/non-multinetwork sites', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						is_multi_network: false
					}
				}
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			expect( isSecondary ).to.equal( false );
		} );

		it( 'it should return `false` for multisite sites without unmapped url', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: true,
					options: {
						is_multi_network: false,
						main_network_site: 'https://example.wordpress.com'
					}
				}
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			expect( isSecondary ).to.equal( false );
		} );

		it( 'it should return `false` for multisite sites without main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: true,
					options: {
						is_multi_network: false,
						unmapped_url: 'https://example.wordpress.com'
					}
				}
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			expect( isSecondary ).to.equal( false );
		} );

		it( 'it should return `true` for multisite sites which unmapped_url does not match their main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: true,
					options: {
						unmapped_url: 'https://secondary.wordpress.com',
						main_network_site: 'https://example.wordpress.com'
					}
				}
			} );

			const isSecondary = isJetpackSiteSecondaryNetworkSite( state, siteId );
			expect( isSecondary ).to.equal( true );
		} );
	} );

	describe( '#verifyJetpackModulesActive()', () => {
		it( 'should return `null` for a non-existing site', () => {
			const modulesActive = verifyJetpackModulesActive( stateWithNoItems, nonExistingSiteId, [ 'manage' ] );
			expect( modulesActive ).to.equal( null );
		} );

		it( 'it should return `null` for a non jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: false,
					options: {}
				}
			} );

			const modulesActive = verifyJetpackModulesActive( state, siteId, [ 'manage' ] );
			expect( modulesActive ).to.equal( null );
		} );

		it( 'it should return `true` if all given modules are active for a site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'manage', 'sso', 'photon', 'omnisearch' ]
					}
				}
			} );

			const modulesActive = verifyJetpackModulesActive( state, siteId, [ 'omnisearch', 'sso', 'photon' ] );
			expect( modulesActive ).to.equal( true );
		} );

		it( 'it should return `false` if not all given modules are active for a site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'manage', 'sso', 'photon', 'omnisearch' ]
					}
				}
			} );

			const modulesActive = verifyJetpackModulesActive( state, siteId, [ 'after-the-deadline', 'manage' ] );
			expect( modulesActive ).to.equal( false );
		} );
	} );

	describe( '#getJetpackSiteRemoteManagementUrl()', () => {
		it( 'should return `null` for a non-existing site', () => {
			const managementUrl = getJetpackSiteRemoteManagementUrl( stateWithNoItems, nonExistingSiteId );
			expect( managementUrl ).to.equal( null );
		} );

		it( 'it should return `false` for a non jetpack site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					options: {}
				}
			} );

			const managementUrl = getJetpackSiteRemoteManagementUrl( state, siteId );
			expect( managementUrl ).to.equal( null );
		} );

		it( 'it should return the correct url for version of jetpack less than 3.4', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'manage', 'sso', 'photon', 'omnisearch' ],
						admin_url: 'https://jetpacksite.me/wp-admin/',
						jetpack_version: '3.3'
					}
				}
			} );

			const managementUrl = getJetpackSiteRemoteManagementUrl( state, siteId );
			expect( managementUrl ).to.equal( 'https://jetpacksite.me/wp-admin/admin.php?page=jetpack&configure=json-api' );
		} );

		it( 'it should return the correct url for versions of jetpack greater than or equal to 3.4', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						active_modules: [ 'manage', 'sso', 'photon', 'omnisearch' ],
						admin_url: 'https://jetpacksite.me/wp-admin/',
						jetpack_version: '3.4'
					}
				}
			} );

			const managementUrl = getJetpackSiteRemoteManagementUrl( state, siteId );
			expect( managementUrl ).to.equal( 'https://jetpacksite.me/wp-admin/admin.php?page=jetpack&configure=manage' );
		} );
	} );

	describe( '#hasJetpackSiteCustomDomain()', () => {
		it( 'should return `null` for a non-existing site', () => {
			const hasCustomDomain = hasJetpackSiteCustomDomain( stateWithNoItems, nonExistingSiteId );
			expect( hasCustomDomain ).to.equal( null );
		} );

		it( 'it should return `true` if `URL` and `unmapped_url` have different domains', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						unmapped_url: 'https://jetpack.co'
					}
				}
			} );

			const hasCustomDomain = hasJetpackSiteCustomDomain( state, siteId );
			expect( hasCustomDomain ).to.equal( true );
		} );

		it( 'it should return `false` if `URL` and `unmapped_url` have the same domain', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						unmapped_url: 'https://jetpacksite.me'
					}
				}
			} );

			const hasCustomDomain = hasJetpackSiteCustomDomain( state, siteId );
			expect( hasCustomDomain ).to.equal( false );
		} );
	} );

	describe( '#getJetpackSiteUpdateFilesDisabledReasons()', () => {
		it( 'it should have the correct reason for the clue `has_no_file_system_write_access`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'has_no_file_system_write_access' ]
					}
				}
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId );
			expect( reason ).to.deep.equal( [ 'The file permissions on this host prevent editing files.' ] );
		} );

		it( 'it should have the correct reason for the clue `disallow_file_mods`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'disallow_file_mods' ]
					}
				}
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId );
			expect( reason ).to.deep.equal( [ 'File modifications are explicitly disabled by a site administrator.' ] );
		} );

		it( 'it should have the correct reason for the clue `automatic_updater_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'automatic_updater_disabled' ]
					}
				}
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId, 'autoupdateCore' );
			expect( reason ).to.deep.equal( [ 'Any autoupdates are explicitly disabled by a site administrator.' ] );
		} );

		it( 'it should have the correct reason for the clue `wp_auto_update_core_disabled`', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					jetpack: true,
					options: {
						file_mod_disabled: [ 'wp_auto_update_core_disabled' ]
					}
				}
			} );

			const reason = getJetpackSiteUpdateFilesDisabledReasons( state, siteId, 'autoupdateCore' );
			expect( reason ).to.deep.equal( [ 'Core autoupdates are explicitly disabled by a site administrator.' ] );
		} );
	} );

	describe( '#isJetpackSiteMainNetworkSite()', () => {
		it( 'should return `null` for a non-existing site', () => {
			const isMainNetwork = isJetpackSiteMainNetworkSite( stateWithNoItems, nonExistingSiteId );
			expect( isMainNetwork ).to.equal( null );
		} );

		it( 'it should return `false` for multi-network sites', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					options: {
						is_multi_network: true
					}
				}
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			expect( isMainNetwork ).to.equal( false );
		} );

		it( 'it should return `true` for non multisite site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					jetpack: true,
					is_multisite: false,
				}
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			expect( isMainNetwork ).to.equal( true );
		} );

		it( 'it should return `false` for multisite sites without unmapped url', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					jetpack: true,
					options: {
						is_multi_network: false,
						main_network_site: 'https://example.wordpress.com'
					}
				}
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			expect( isMainNetwork ).to.equal( false );
		} );

		it( 'it should return `false` for multisite sites without main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					jetpack: true,
					options: {
						is_multi_network: false,
						unmapped_url: 'https://example.wordpress.com'
					}
				}
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			expect( isMainNetwork ).to.equal( false );
		} );

		it( 'it should return `true` for multisite sites and unmapped_url matches with main_network_site', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					URL: 'https://jetpacksite.me',
					is_multisite: true,
					jetpack: true,
					options: {
						is_multi_network: false,
						unmapped_url: 'https://example.wordpress.com',
						main_network_site: 'https://example.wordpress.com'
					}
				}
			} );

			const isMainNetwork = isJetpackSiteMainNetworkSite( state, siteId );
			expect( isMainNetwork ).to.equal( true );
		} );
	} );

	describe( 'getSiteAdminUrl()', () => {
		it( 'should return null if the admin URL is not known', () => {
			const adminUrl = getSiteAdminUrl( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( adminUrl ).to.be.null;
		} );

		it( 'should return the root admin url if no path specified', () => {
			const adminUrl = getSiteAdminUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								admin_url: 'https://example.wordpress.com/wp-admin/'
							}
						}
					}
				}
			}, 77203199 );

			expect( adminUrl ).to.equal( 'https://example.wordpress.com/wp-admin/' );
		} );

		it( 'should return the admin url concatenated with path', () => {
			const adminUrl = getSiteAdminUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								admin_url: 'https://example.wordpress.com/wp-admin/'
							}
						}
					}
				}
			}, 77203199, 'customize.php' );

			expect( adminUrl ).to.equal( 'https://example.wordpress.com/wp-admin/customize.php' );
		} );

		it( 'should return the admin url with path left slash trimmed automatically', () => {
			const adminUrl = getSiteAdminUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							options: {
								admin_url: 'https://example.wordpress.com/wp-admin/'
							}
						}
					}
				}
			}, 77203199, '/customize.php' );

			expect( adminUrl ).to.equal( 'https://example.wordpress.com/wp-admin/customize.php' );
		} );
	} );

	describe( 'getCustomizerUrl()', () => {
		it( 'should return root path if slug for WordPress.com site is not known', () => {
			const customizerUrl = getCustomizerUrl( {
				sites: {
					items: {}
				}
			}, 77203199 );

			expect( customizerUrl ).to.equal( '/customize' );
		} );

		it( 'should return customizer URL for WordPress.com site', () => {
			const customizerUrl = getCustomizerUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							jetpack: false
						}
					}
				}
			}, 77203199 );

			expect( customizerUrl ).to.equal( '/customize/example.com' );
		} );

		it( 'should return null if admin URL for Jetpack site is not known', () => {
			const customizerUrl = getCustomizerUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							jetpack: true
						}
					}
				}
			}, 77203199 );

			expect( customizerUrl ).to.be.null;
		} );

		it( 'should return customizer URL for Jetpack site', () => {
			const customizerUrl = getCustomizerUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								admin_url: 'https://example.com/wp-admin/'
							}
						}
					}
				}
			}, 77203199 );

			expect( customizerUrl ).to.equal( 'https://example.com/wp-admin/customize.php' );
		} );

		it( 'should prepend panel path parameter for WordPress.com site', () => {
			const customizerUrl = getCustomizerUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							jetpack: false
						}
					}
				}
			}, 77203199, 'identity' );

			expect( customizerUrl ).to.equal( '/customize/identity/example.com' );
		} );

		it( 'should prepend panel path parameter for Jetpack site', () => {
			const customizerUrl = getCustomizerUrl( {
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								admin_url: 'https://example.com/wp-admin/'
							}
						}
					}
				}
			}, 77203199, 'identity' );

			expect( customizerUrl ).to.equal( 'https://example.com/wp-admin/customize.php?autofocus%5Bsection%5D=title_tagline' );
		} );

		context( 'browser', () => {
			before( () => {
				global.window = {
					location: {
						href: 'https://wordpress.com'
					}
				};
			} );

			after( () => {
				delete global.window;
			} );

			it( 'should return customizer URL for Jetpack site', () => {
				const customizerUrl = getCustomizerUrl( {
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									admin_url: 'https://example.com/wp-admin/'
								}
							}
						}
					}
				}, 77203199 );

				expect( customizerUrl ).to.equal( 'https://example.com/wp-admin/customize.php?return=https%3A%2F%2Fwordpress.com' );
			} );
		} );

		context( 'node', () => {
			it( 'should return customizer URL for Jetpack site', () => {
				const customizerUrl = getCustomizerUrl( {
					sites: {
						items: {
							77203199: {
								ID: 77203199,
								URL: 'https://example.com',
								jetpack: true,
								options: {
									admin_url: 'https://example.com/wp-admin/'
								}
							}
						}
					}
				}, 77203199 );

				expect( customizerUrl ).to.equal( 'https://example.com/wp-admin/customize.php' );
			} );
		} );
	} );

	describe( 'siteSupportsJetpackSettingsUi()', () => {
		it( 'should return null if the Jetpack version is not known', () => {
			const supportsJetpackSettingsUI = siteSupportsJetpackSettingsUi( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
						}
					}
				}
			}, 77203074 );

			expect( supportsJetpackSettingsUI ).to.be.null;
		} );

		it( 'should return null if the site is not a Jetpack site', () => {
			const supportsJetpackSettingsUI = siteSupportsJetpackSettingsUi( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
						}
					}
				}
			}, 77203074 );

			expect( supportsJetpackSettingsUI ).to.be.null;
		} );

		it( 'should return false if the Jetpack version is older than 4.5', () => {
			const supportsJetpackSettingsUI = siteSupportsJetpackSettingsUi( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								jetpack_version: '4.4.0'
							}
						}
					}
				}
			}, 77203074 );

			expect( supportsJetpackSettingsUI ).to.be.false;
		} );

		it( 'should return true if the Jetpack version is 4.5', () => {
			const supportsJetpackSettingsUI = siteSupportsJetpackSettingsUi( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								jetpack_version: '4.5.0'
							}
						}
					}
				}
			}, 77203074 );

			expect( supportsJetpackSettingsUI ).to.be.true;
		} );

		it( 'should return true if the Jetpack version is newer than 4.5', () => {
			const supportsJetpackSettingsUI = siteSupportsJetpackSettingsUi( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								jetpack_version: '4.6.0'
							}
						}
					}
				}
			}, 77203074 );

			expect( supportsJetpackSettingsUI ).to.be.true;
		} );
	} );

	describe( 'getJetpackComputedAttributes()', () => {
		it( 'should return undefined attributes if a site is not Jetpack', () => {
			const state = {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							jetpack: false,
						}
					}
				}
			};

			const noNewAttributes = getJetpackComputedAttributes( state, 77203074 );
			expect( noNewAttributes.hasMinimumJetpackVersion ).to.equal( undefined );
			expect( noNewAttributes.canAutoupdateFiles ).to.equal( undefined );
			expect( noNewAttributes.canUpdateFiles ).to.equal( undefined );
			expect( noNewAttributes.canManage ).to.equal( undefined );
			expect( noNewAttributes.isMainNetworkSite ).to.equal( undefined );
			expect( noNewAttributes.isSecondaryNetworkSite ).to.equal( undefined );
		} );

		it( 'should return exists for attributes if a site is Jetpack', () => {
			const state = {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							jetpack: true,
						}
					}
				}
			};
			const noNewAttributes = getJetpackComputedAttributes( state, 77203074 );
			expect( noNewAttributes.hasMinimumJetpackVersion ).to.have.property;
			expect( noNewAttributes.canAutoupdateFiles ).to.have.property;
			expect( noNewAttributes.canUpdateFiles ).to.have.property;
			expect( noNewAttributes.canManage ).to.have.property;
			expect( noNewAttributes.isMainNetworkSite ).to.have.property;
			expect( noNewAttributes.isSecondaryNetworkSite ).to.have.property;
		} );
	} );
} );
