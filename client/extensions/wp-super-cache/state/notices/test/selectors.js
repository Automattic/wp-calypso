/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingNotices,
	getNotices,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingNotices()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const isRequesting = isRequestingNotices( state, primarySiteId );

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
			const isRequesting = isRequestingNotices( state, secondarySiteId );

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
			const isRequesting = isRequestingNotices( state, primarySiteId );

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
			const isRequesting = isRequestingNotices( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'getNotices()', () => {
		const primaryNotices = {
			cache_writable: {
				message: '/home/public_html/ is writable.',
				type: 'warning',
			}
		};

		it( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const notices = getNotices( state, primarySiteId );

			expect( notices ).to.be.null;
		} );

		it( 'should return null if the site is not attached', () => {
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
			const notices = getNotices( state, secondarySiteId );

			expect( notices ).to.be.null;
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
			const notices = getNotices( state, primarySiteId );

			expect( notices ).to.eql( primaryNotices );
		} );
	} );
} );
