/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSite,
	getSiteCollisions,
	isSiteConflicting,
	isJetpackSite,
	getSiteSlug,
	isRequestingSites,
	isCurrentUserCapableForSite
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getSite()', () => {
		it( 'should return null if the site is not known', () => {
			const site = getSite( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( site ).to.be.null;
		} );

		it( 'should return the site object', () => {
			const site = getSite( {
				sites: {
					items: {
						2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
					}
				}
			}, 2916284 );

			expect( site ).to.eql( { ID: 2916284, name: 'WordPress.com Example Blog' } );
		} );
	} );

	describe( '#getSiteCollisions', () => {
		beforeEach( () => {
			getSiteCollisions.memoizedSelector.cache.clear();
		} );

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
		beforeEach( () => {
			getSiteCollisions.memoizedSelector.cache.clear();
		} );

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

	describe( '#getSiteSlug()', () => {
		beforeEach( () => {
			getSiteCollisions.memoizedSelector.cache.clear();
		} );

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

	describe( '#isRequestingSites()', () => {
		it( 'should return fetching sites state', () => {
			const state = {
				sites: {
					fetchingItems: {
						all: true
					}
				}
			};
			const emptyState = {
				sites: {
					fetchingItems: {

					}
				}
			};
			const falseState = {
				sites: {
					fetchingItems: {
						all: false
					}
				}
			};

			expect( isRequestingSites( state ) ).to.equal( true );
			expect( isRequestingSites( emptyState ) ).to.equal( false );
			expect( isRequestingSites( falseState ) ).to.equal( false );
		} );
	} );

	describe( 'isCurrentUserCapableForSite', () => {
		it( 'should return null if the site is not known', () => {
			const isCapable = isCurrentUserCapableForSite( {
				sites: {
					items: {}
				}
			}, 2916284, 'manage_options' );

			expect( isCapable ).to.be.null;
		} );

		it( 'should return the value for the specified capability', () => {
			const isCapable = isCurrentUserCapableForSite( {
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
							capabilities: {
								manage_options: false
							}
						}
					}
				}
			}, 2916284, 'manage_options' );

			expect( isCapable ).to.be.false;
		} );
	} );
} );
