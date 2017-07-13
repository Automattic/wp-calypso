/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPages,
	isFetchingPages,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isFetchingPages()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						pages: undefined,
					}
				}
			};
			const isFetching = isFetchingPages( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						pages: {
							fetching: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isFetching = isFetchingPages( state, secondarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return false if the pages are not being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						pages: {
							fetching: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const isFetching = isFetchingPages( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return true if the pages are being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						pages: {
							fetching: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isFetching = isFetchingPages( state, primarySiteId );

			expect( isFetching ).to.be.true;
		} );
	} );

	describe( 'getPages()', () => {
		const primaryPages = {
			id: 1,
			title: { rendered: 'My page' }
		};

		it( 'should return an empty array if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						pages: undefined,
					}
				}
			};
			const pages = getPages( state, primarySiteId );

			expect( pages ).to.deep.equal( [] );
		} );

		it( 'should return an empty array if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						pages: {
							items: {
								[ primarySiteId ]: primaryPages,
							}
						}
					}
				}
			};
			const pages = getPages( state, secondarySiteId );

			expect( pages ).to.deep.equal( [] );
		} );

		it( 'should return the pages for a siteId', () => {
			const state = {
				extensions: {
					wpJobManager: {
						pages: {
							items: {
								[ primarySiteId ]: primaryPages,
							}
						}
					}
				}
			};
			const pages = getPages( state, primarySiteId );

			expect( pages ).to.deep.equal( primaryPages );
		} );
	} );
} );
