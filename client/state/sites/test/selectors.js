/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import config from 'config';
import { useSandbox } from 'test/helpers/use-sinon';
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
	isSitePreviewable,
	isRequestingSites,
	isRequestingSite,
	getSiteByUrl,
	getSitePlan,
	isCurrentSitePlan,
	isCurrentPlanPaid
} from '../selectors';

describe( 'selectors', () => {
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
				is_customizable: false,
				is_previewable: true,
				options: {
					default_post_format: 'standard',
					unmapped_url: 'https://example.wordpress.com'
				}
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
} );
