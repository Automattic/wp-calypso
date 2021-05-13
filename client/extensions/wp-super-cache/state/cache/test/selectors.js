/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isCacheDeleteSuccessful,
	isDeletingCache,
	isPreloadingCache,
	isTestingCache,
	getCacheDeleteStatus,
	getCacheTestResults,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isDeletingCache()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				},
			};
			const isDeleting = isDeletingCache( state, primarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' },
							},
						},
					},
				},
			};
			const isDeleting = isDeletingCache( state, secondarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		test( 'should return false if the cache is not being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'success' },
							},
						},
					},
				},
			};
			const isDeleting = isDeletingCache( state, primarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		test( 'should return true if the cache is being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' },
							},
						},
					},
				},
			};
			const isDeleting = isDeletingCache( state, primarySiteId );

			expect( isDeleting ).to.be.true;
		} );
	} );

	describe( 'isCacheDeleteSuccessful()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' },
							},
						},
					},
				},
			};
			const isSuccessful = isCacheDeleteSuccessful( state, secondarySiteId );

			expect( isSuccessful ).to.be.false;
		} );

		test( 'should return true if the delete request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'success' },
							},
						},
					},
				},
			};
			const isSuccessful = isCacheDeleteSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.true;
		} );

		test( 'should return false if the delete request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'error' },
							},
						},
					},
				},
			};
			const isSuccessful = isCacheDeleteSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.false;
		} );
	} );

	describe( 'getCacheDeleteStatus()', () => {
		test( 'should return undefined if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' },
							},
						},
					},
				},
			};
			const status = getCacheDeleteStatus( state, secondarySiteId );

			expect( status ).to.be.undefined;
		} );

		test( 'should return success if the delete request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'success' },
							},
						},
					},
				},
			};
			const status = getCacheDeleteStatus( state, primarySiteId );

			expect( status ).to.eql( 'success' );
		} );

		test( 'should return error if the delete request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'error' },
							},
						},
					},
				},
			};
			const status = getCacheDeleteStatus( state, primarySiteId );

			expect( status ).to.eql( 'error' );
		} );

		test( 'should return pending if the delete request status is pending', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' },
							},
						},
					},
				},
			};
			const status = getCacheDeleteStatus( state, primarySiteId );

			expect( status ).to.eql( 'pending' );
		} );
	} );

	describe( 'isTestingCache()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {},
					},
				},
			};
			const isTesting = isTestingCache( state, primarySiteId );

			expect( isTesting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testing: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isTesting = isTestingCache( state, secondarySiteId );

			expect( isTesting ).to.be.false;
		} );

		test( 'should return false if the cache is not being tested', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testing: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isTesting = isTestingCache( state, primarySiteId );

			expect( isTesting ).to.be.false;
		} );

		test( 'should return true if the cache is being tested', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testing: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isTesting = isTestingCache( state, primarySiteId );

			expect( isTesting ).to.be.true;
		} );
	} );

	describe( 'getCacheTestResults()', () => {
		const primaryResults = {
			attempts: {
				first: {
					status: 'OK',
				},
			},
		};

		test( 'should return empty object if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {},
					},
				},
			};
			const results = getCacheTestResults( state, primarySiteId );

			expect( results ).to.be.empty;
		} );

		test( 'should return empty object if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							items: {
								[ primarySiteId ]: primaryResults,
							},
						},
					},
				},
			};
			const results = getCacheTestResults( state, secondarySiteId );

			expect( results ).to.be.empty;
		} );

		test( 'should return the cache test results for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							items: {
								[ primarySiteId ]: primaryResults,
							},
						},
					},
				},
			};
			const results = getCacheTestResults( state, primarySiteId );

			expect( results ).to.eql( primaryResults );
		} );
	} );

	describe( 'isPreloadingCache()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {},
					},
				},
			};
			const isPreloading = isPreloadingCache( state, primarySiteId );

			expect( isPreloading ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							preloading: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isPreloading = isPreloadingCache( state, secondarySiteId );

			expect( isPreloading ).to.be.false;
		} );

		test( 'should return false if the cache is not preloading', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							preloading: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isPreloading = isPreloadingCache( state, primarySiteId );

			expect( isPreloading ).to.be.false;
		} );

		test( 'should return true if the cache is preloading', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							preloading: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isPreloading = isPreloadingCache( state, primarySiteId );

			expect( isPreloading ).to.be.true;
		} );
	} );
} );
