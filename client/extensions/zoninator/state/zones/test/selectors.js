/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getZones, isRequestingZones } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 234567;

	describe( 'isRequestingZones()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: undefined,
					}
				}
			};

			const isRequesting = isRequestingZones( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};

			const isRequesting = isRequestingZones( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the settings are not being fetched', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							requesting: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};

			const isRequesting = isRequestingZones( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the settings are being fetched', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							requesting: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};

			const isRequesting = isRequestingZones( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'getZones()', () => {
		const primaryZones = {
			1: {
				id: 1,
				name: 'Foo',
				description: 'A test zone.',
			},
		};

		it( 'should return an empty array if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: undefined,
					}
				}
			};

			const zones = getZones( state, primarySiteId );

			expect( zones ).to.deep.equal( [] );
		} );

		it( 'should return an empty array if no site is attached', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							items: {
								[ primarySiteId ]: primaryZones,
							}
						}
					}
				}
			};

			const zones = getZones( state, secondarySiteId );

			expect( zones ).to.deep.equal( [] );
		} );

		it( 'should return the zones for a siteId', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							items: {
								[ primarySiteId ]: primaryZones,
							}
						}
					}
				}
			};

			const zones = getZones( state, primarySiteId );

			expect( zones ).to.deep.equal( [ primaryZones[ 1 ] ] );
		} );
	} );
} );
