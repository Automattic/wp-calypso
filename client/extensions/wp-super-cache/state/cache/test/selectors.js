/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isTestingCache,
	isCacheTestSuccessful,
	getCacheTestResults,
	getCacheTestStatus,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isTestingCache()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isTesting = isTestingCache( state, secondarySiteId );

			expect( isTesting ).to.be.false;
		} );

		it( 'should return false if the cache test is not running', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: false, status: 'success' }
							}
						}
					}
				}
			};
			const isTesting = isTestingCache( state, primarySiteId );

			expect( isTesting ).to.be.false;
		} );

		it( 'should return true if the cache test is running', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isTesting = isTestingCache( state, primarySiteId );

			expect( isTesting ).to.be.true;
		} );
	} );

	describe( 'isCacheTestSuccessful()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isSuccessful = isCacheTestSuccessful( state, secondarySiteId );

			expect( isSuccessful ).to.be.false;
		} );

		it( 'should return true if the cache test request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: false, status: 'success' }
							}
						}
					}
				}
			};
			const isSuccessful = isCacheTestSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.true;
		} );

		it( 'should return false if the cache test request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: false, status: 'error' }
							}
						}
					}
				}
			};
			const isSuccessful = isCacheTestSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.false;
		} );
	} );

	describe( 'getCacheTestResults()', () => {
		const primaryResults = {
			attempts: {
				first: {
					status: 'OK',
				}
			}
		};

		it( 'should return undefined if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const results = getCacheTestResults( state, primarySiteId );

			expect( results ).to.be.undefined;
		} );

		it( 'should return undefined if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							items: {
								[ primarySiteId ]: primaryResults,
							}
						}
					}
				}
			};
			const results = getCacheTestResults( state, secondarySiteId );

			expect( results ).to.be.undefined;
		} );

		it( 'should return the cache test results for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							items: {
								[ primarySiteId ]: primaryResults,
							}
						}
					}
				}
			};
			const results = getCacheTestResults( state, primarySiteId );

			expect( results ).to.eql( primaryResults );
		} );
	} );

	describe( 'getCacheTestStatus()', () => {
		it( 'should return undefined if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: true, status: 'pending' }
							}
						}
					}
				}
			};
			const status = getCacheTestStatus( state, secondarySiteId );

			expect( status ).to.be.undefined;
		} );

		it( 'should return success if the cache test request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: false, status: 'success' }
							}
						}
					}
				}
			};
			const status = getCacheTestStatus( state, primarySiteId );

			expect( status ).to.eql( 'success' );
		} );

		it( 'should return error if the cache test request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: false, status: 'error' }
							}
						}
					}
				}
			};
			const status = getCacheTestStatus( state, primarySiteId );

			expect( status ).to.eql( 'error' );
		} );

		it( 'should return pending if the cache test request status is pending', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							testStatus: {
								[ primarySiteId ]: { testing: true, status: 'pending' }
							}
						}
					}
				}
			};
			const status = getCacheTestStatus( state, primarySiteId );

			expect( status ).to.eql( 'pending' );
		} );
	} );
} );
