/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getDebugLogs,
	isDeletingDebugLog,
	isRequestingDebugLogs,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;
	const filename = '89fe3b92191d36ee7fb3956cd52c704c.php';

	describe( 'getDebugLogs()', () => {
		const primaryDebugLogs = {
			'89fe3b92191d36ee7fb3956cd52c704c.php': '145cc79483f018538a3edc78117622ba'
		};

		it( 'should return empty object if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: undefined
					}
				}
			};
			const debugLogs = getDebugLogs( state, primarySiteId );

			expect( debugLogs ).to.eql( {} );
		} );

		it( 'should return an empty object if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							items: {
								[ primarySiteId ]: primaryDebugLogs,
							}
						}
					}
				}
			};
			const debugLogs = getDebugLogs( state, secondarySiteId );

			expect( debugLogs ).to.eql( {} );
		} );

		it( 'should return the debugLogs for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							items: {
								[ primarySiteId ]: primaryDebugLogs,
							}
						}
					}
				}
			};
			const debugLogs = getDebugLogs( state, primarySiteId );

			expect( debugLogs ).to.eql( primaryDebugLogs );
		} );
	} );

	describe( 'isRequestingDebugLogs()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: undefined
					}
				}
			};
			const isRequesting = isRequestingDebugLogs( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingDebugLogs( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if debug logs are not being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							requesting: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingDebugLogs( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if debug logs are being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingDebugLogs( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isDeletingDebugLog()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: undefined
					},
				}
			};
			const isDeleting = isDeletingDebugLog( state, primarySiteId, filename );

			expect( isDeleting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							deleteStatus: {
								[ primarySiteId ]: {
									[ filename ]: true
								}
							}
						}
					}
				}
			};
			const isDeleting = isDeletingDebugLog( state, secondarySiteId, filename );

			expect( isDeleting ).to.be.false;
		} );

		it( 'should return false if the debug log is not being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							deleteStatus: {
								[ primarySiteId ]: {
									[ filename ]: false
								}
							}
						}
					}
				}
			};
			const isDeleting = isDeletingDebugLog( state, primarySiteId, filename );

			expect( isDeleting ).to.be.false;
		} );

		it( 'should return true if the debug log is being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						debug: {
							deleteStatus: {
								[ primarySiteId ]: {
									[ filename ]: true
								}
							}
						}
					}
				}
			};
			const isDeleting = isDeletingDebugLog( state, primarySiteId, filename );

			expect( isDeleting ).to.be.true;
		} );
	} );
} );
