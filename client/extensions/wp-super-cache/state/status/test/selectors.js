/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingStatus,
	getStatus,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingStatus()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const isRequesting = isRequestingStatus( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						notices: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingStatus( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the notices are not being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						notices: {
							requesting: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingStatus( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the notices are being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						notices: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isRequesting = isRequestingStatus( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'getStatus()', () => {
		const primaryNotices = {
			cache_writable: {
				message: '/home/public_html/ is writable.',
				type: 'warning',
			}
		};

		it( 'should return empty object if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const notices = getStatus( state, primarySiteId );

			expect( notices ).to.be.empty;
		} );

		it( 'should return empty object if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						notices: {
							items: {
								[ primarySiteId ]: primaryNotices,
							}
						}
					}
				}
			};
			const notices = getStatus( state, secondarySiteId );

			expect( notices ).to.be.empty;
		} );

		it( 'should return the notices for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						notices: {
							items: {
								[ primarySiteId ]: primaryNotices,
							}
						}
					}
				}
			};
			const notices = getStatus( state, primarySiteId );

			expect( notices ).to.eql( primaryNotices );
		} );
	} );
} );
