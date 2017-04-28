/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isCacheDeleteSuccessful,
	isCacheTestSuccessful,
	isDeletingCache,
	isTestingCache,
	getCacheDeleteStatus,
	getCacheTestResults,
	getCacheTestStatus,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isDeletingCache()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const isDeleting = isDeletingCache( state, primarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isDeleting = isDeletingCache( state, secondarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		it( 'should return false if the cache is not being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'success' }
							}
						}
					}
				}
			};
			const isDeleting = isDeletingCache( state, primarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		it( 'should return true if the cache is being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isDeleting = isDeletingCache( state, primarySiteId );

			expect( isDeleting ).to.be.true;
		} );
	} );

	describe( 'isCacheDeleteSuccessful()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isSuccessful = isCacheDeleteSuccessful( state, secondarySiteId );

			expect( isSuccessful ).to.be.false;
		} );

		it( 'should return true if the delete request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'success' }
							}
						}
					}
				}
			};
			const isSuccessful = isCacheDeleteSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.true;
		} );

		it( 'should return false if the delete request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'error' }
							}
						}
					}
				}
			};
			const isSuccessful = isCacheDeleteSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.false;
		} );
	} );

	describe( 'getCacheDeleteStatus()', () => {
		it( 'should return undefined if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' }
							}
						}
					}
				}
			};
			const status = getCacheDeleteStatus( state, secondarySiteId );

			expect( status ).to.be.undefined;
		} );

		it( 'should return success if the delete request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'success' }
							}
						}
					}
				}
			};
			const status = getCacheDeleteStatus( state, primarySiteId );

			expect( status ).to.eql( 'success' );
		} );

		it( 'should return error if the delete request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: false, status: 'error' }
							}
						}
					}
				}
			};
			const status = getCacheDeleteStatus( state, primarySiteId );

			expect( status ).to.eql( 'error' );
		} );

		it( 'should return pending if the delete request status is pending', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						cache: {
							deleteStatus: {
								[ primarySiteId ]: { deleting: true, status: 'pending' }
							}
						}
					}
				}
			};
			const status = getCacheDeleteStatus( state, primarySiteId );

			expect( status ).to.eql( 'pending' );
		} );
	} );

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
} );
