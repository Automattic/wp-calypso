/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getZone, getZones, isRequestingZones, isSavingZone } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 234567;

	describe( 'isRequestingZones()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: undefined,
					},
				},
			};

			const isRequesting = isRequestingZones( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};

			const isRequesting = isRequestingZones( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the settings are not being fetched', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							requesting: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};

			const isRequesting = isRequestingZones( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if the settings are being fetched', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
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

		test( 'should return an empty array if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: undefined,
					},
				},
			};

			const zones = getZones( state, primarySiteId );

			expect( zones ).to.deep.equal( [] );
		} );

		test( 'should return an empty array if no site is attached', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							items: {
								[ primarySiteId ]: primaryZones,
							},
						},
					},
				},
			};

			const zones = getZones( state, secondarySiteId );

			expect( zones ).to.deep.equal( [] );
		} );

		test( 'should return the zones for a siteId', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							items: {
								[ primarySiteId ]: primaryZones,
							},
						},
					},
				},
			};

			const zones = getZones( state, primarySiteId );

			expect( zones ).to.deep.equal( [ primaryZones[ 1 ] ] );
		} );
	} );

	describe( 'getZone()', () => {
		const primaryZones = {
			1: {
				id: 1,
				name: 'Foo',
				description: 'A test zone.',
			},
		};

		test( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: undefined,
					},
				},
			};

			const zone = getZone( state, primarySiteId, 1 );

			expect( zone ).to.be.null;
		} );

		test( 'should return null if no site is attached', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							items: {
								[ primarySiteId ]: primaryZones,
							},
						},
					},
				},
			};

			const zone = getZone( state, secondarySiteId, 1 );

			expect( zone ).to.be.null;
		} );

		test( 'should return the zone for a siteId and zoneId combination', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							items: {
								[ primarySiteId ]: primaryZones,
							},
						},
					},
				},
			};

			const zone = getZone( state, primarySiteId, 1 );

			expect( zone ).to.deep.equal( primaryZones[ 1 ] );
		} );
	} );

	describe( 'isSavingZone()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: undefined,
					},
				},
			};

			const isRequesting = isSavingZone( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							saving: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};

			const isRequesting = isSavingZone( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the zone is not being saved', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							saving: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};

			const isRequesting = isSavingZone( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if the zone is being saved', () => {
			const state = {
				extensions: {
					zoninator: {
						zones: {
							saving: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};

			const isRequesting = isSavingZone( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );
} );
