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
	getSiteSlug,
	getJetpackSiteRemoteManagementUrl
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

	describe( '#getJetpackSiteRemoteManagementUrl()', () => {
		beforeEach( () => {
			getSiteCollisions.memoizedSelector.cache.clear();
		} );

		it( 'should return null if the site is not known', () => {
			const remoteManagementUrl = getJetpackSiteRemoteManagementUrl( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( remoteManagementUrl ).to.be.null;
		} );

		it( 'should return null if the site is not a Jetpack site', () => {
			const remoteManagementUrl = getJetpackSiteRemoteManagementUrl( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://testonesite2014.wordpress.com',
							jetpack: false,
						}
					}
				}
			}, 77203074 );

			expect( remoteManagementUrl ).to.be.null;
		} );

		it( 'should return the URL for a Jetpack site\'s remote wp-admin screen', () => {
			const remoteManagementUrl = getJetpackSiteRemoteManagementUrl( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.com',
							jetpack: true,
							options: {
								admin_url: 'https://example.com/wp-admin/',
								jetpack_version: '3.9.4'
							}
						}
					}
				}
			}, 77203074 );

			expect( remoteManagementUrl ).to.equal( 'https://example.com/wp-admin/admin.php?page=jetpack&configure=manage' );
		} );
	} );
} );
