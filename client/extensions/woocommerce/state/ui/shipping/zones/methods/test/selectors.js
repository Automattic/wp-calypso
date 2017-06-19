/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getShippingZoneMethods,
	getCurrentlyEditingShippingZoneMethods,
	getNewMethodTypeOptions,
	getCurrentlyOpenShippingZoneMethod,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';
import { createState } from 'woocommerce/state/test/helpers';

const emptyZoneLocations = { country: [], continent: [], state: [], postcode: [] };

describe( 'selectors', () => {
	describe( 'getShippingZoneMethods', () => {
		it( 'should return an empty list when the zones are being loaded', () => {
			const state = createState( {
				site: {
					shippingZones: LOADING,
				},
				ui: {},
			} );

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list when the zone does not exist', () => {
			const state = createState( {
				site: {
					shippingZones: [],
				},
				ui: {},
			} );

			expect( getShippingZoneMethods( state, 7 ) ).to.deep.equal( [] );
		} );

		it( 'should NOT overlay the zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'MyOldMethodTitle' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [],
									updates: [ { id: 7, title: 'MyNewMethodTitle' } ],
									deletes: [],
								}
							},
						},
					},
				},
			} );

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: 7, title: 'MyOldMethodTitle' } ] );
		} );

		it( 'should overlay method updates', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'MyOldMethodTitle' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [ { id: 7, title: 'MyNewMethodTitle' } ],
									deletes: [],
								},
							} ],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: 7, title: 'MyNewMethodTitle' } ] );
		} );

		it( 'should overlay method deletes', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7, 8 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'Title7' },
						8: { id: 8, title: 'Title8' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [],
									deletes: [ { id: 7 } ],
								},
							} ],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: 8, title: 'Title8' } ] );
		} );

		it( 'should overlay method creates', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [] },
					],
					shippingZoneMethods: {},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [ { id: { index: 0 }, title: 'NewMethod' } ],
									updates: [],
									deletes: [],
								},
							} ],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: { index: 0 }, title: 'NewMethod' } ] );
		} );

		it( 'should work for newly-created zones', () => {
			const state = createState( {
				site: {
					shippingZones: [],
					shippingZoneMethods: {},
					shippingZoneLocations: {},
				},
				ui: {
					shipping: {
						zones: {
							creates: [ {
								id: { index: 0 },
								methods: {
									creates: [ { id: { index: 0 }, title: 'MyNewMethodTitle' } ],
									updates: [],
									deletes: [],
								},
							} ],
							updates: [],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getShippingZoneMethods( state, { index: 0 } ) ).to.deep.equal( [ { id: { index: 0 }, title: 'MyNewMethodTitle' } ] );
		} );

		it( 'should sort the shipping methods', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7, 8 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'Title7', order: 1 },
						8: { id: 8, title: 'Title8', order: 2 },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [
										{ id: { index: 1 }, title: 'ConvertedMethod7', _originalId: 7 },
										{ id: { index: 2 }, title: 'ConvertedMethod0', _originalId: { index: 0 } },
										{ id: { index: 3 }, title: 'NewMethod3' },
									],
									updates: [
										{ id: 8, title: 'NewTitle8' },
									],
									deletes: [
										{ id: 7 },
									],
								},
							} ],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [
				{ id: { index: 1 }, title: 'ConvertedMethod7', _originalId: 7 },
				{ id: 8, title: 'NewTitle8', order: 2 },
				{ id: { index: 2 }, title: 'ConvertedMethod0', _originalId: { index: 0 } },
				{ id: { index: 3 }, title: 'NewMethod3' },
			] );
		} );
	} );

	describe( 'getCurrentlyEditingShippingZoneMethods', () => {
		it( 'should return an empty list when the zones are being loaded', () => {
			const state = createState( {
				site: {
					shippingZones: LOADING,
				},
				ui: {},
			} );

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list when there is no zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7 },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [] );
		} );

		it( 'should overlay updates in the zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'MyOldOldMethodTitle' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [ { id: 7, title: 'MyOldMethodTitle', foo: 'bar' } ],
									deletes: [],
								},
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [],
									updates: [ { id: 7, title: 'MyNewMethodTitle' } ],
									deletes: [],
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [
				{ id: 7, title: 'MyNewMethodTitle', foo: 'bar' },
			] );
		} );

		it( 'should overlay deletes in the zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7, 8, 9 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'Title7' },
						8: { id: 8, title: 'Title8' },
						9: { id: 9, title: 'Title9' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [ { id: { index: 0 } } ],
									updates: [],
									deletes: [ { id: 8 } ],
								},
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [],
									updates: [],
									deletes: [ { id: 7 }, { id: { index: 0 } } ],
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [ { id: 9, title: 'Title9' } ] );
		} );

		it( 'should overlay method creates in the zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [] },
					],
					shippingZoneMethods: {},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [],
									deletes: [],
								},
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [ { id: { index: 0 }, title: 'NewMethod' } ],
									updates: [],
									deletes: [],
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [ { id: { index: 0 }, title: 'NewMethod' } ] );
		} );
	} );

	describe( 'getNewMethodTypeOptions', () => {
		it( 'should return all the built-in types when there are no methods in the zone', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [] },
					],
					shippingZoneMethods: {},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getNewMethodTypeOptions( state, 1 ) ).to.deep.equal( [
				'flat_rate',
				'free_shipping',
				'local_pickup',
			] );
		} );

		it( 'should not allow for repeated methods, except for local_pickup', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7, 8, 9 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, methodType: 'local_pickup' },
						8: { id: 8, methodType: 'free_shipping' },
						9: { id: 9, methodType: 'flat_rate' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getNewMethodTypeOptions( state, 1 ) ).to.deep.equal( [ 'local_pickup' ] );
		} );

		it( 'should overlay committed edits to the zone, but not uncommitted edits to the zone currently edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7, 8 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, methodType: 'free_shipping' },
						8: { id: 8, methodType: 'flat_rate' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [],
									deletes: [ { id: 7 } ],
								}
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [ { id: { index: 0 }, methodType: 'free_shipping' } ],
									updates: [],
									deletes: [],
								}
							},
						},
					},
				},
			} );

			expect( getNewMethodTypeOptions( state, 1 ) ).to.deep.equal( [ 'free_shipping', 'local_pickup' ] );
		} );

		it( 'should use the zone currently being edited if the zoneId param is omitted, overlaying all the edits', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7, 8 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, methodType: 'free_shipping' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [],
									deletes: [ { id: 7 } ],
								}
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [ { id: { index: 0 }, methodType: 'flat_rate' } ],
									updates: [],
									deletes: [],
								}
							},
						},
					},
				},
			} );

			expect( getNewMethodTypeOptions( state ) ).to.deep.equal( [ 'free_shipping', 'local_pickup' ] );
		} );
	} );

	describe( 'getCurrentlyOpenShippingZoneMethod', () => {
		it( 'should return null when the zones are being loaded', () => {
			const state = createState( {
				site: {
					shippingZones: LOADING,
				},
				ui: {},
			} );

			expect( getCurrentlyOpenShippingZoneMethod( state ) ).to.equal( null );
		} );

		it( 'should return null when no zone is being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [],
				},
				ui: {},
			} );

			expect( getCurrentlyOpenShippingZoneMethod( state ) ).to.equal( null );
		} );

		it( 'should return null if no method is open', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'methodTitle' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [],
									updates: [],
									deletes: [],
									currentlyEditingId: null,
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyOpenShippingZoneMethod( state ) ).to.equal( null );
		} );

		it( 'should return the method fetched from the server if there are no edits', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'methodTitle' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [],
									updates: [],
									deletes: [],
									currentlyEditingId: 7,
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyOpenShippingZoneMethod( state ) ).to.deep.equal( { id: 7, title: 'methodTitle' } );
		} );

		it( 'should overlay method updates', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'MyOldMethodTitle' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [ { id: 7, title: 'MyNewMethodTitle' } ],
									deletes: [],
									currentlyEditingId: 7,
								},
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [],
									updates: [],
									deletes: [],
									currentlyEditingId: 7,
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyOpenShippingZoneMethod( state ) ).to.deep.equal( { id: 7, title: 'MyNewMethodTitle' } );
		} );

		it( 'should work for newly-created methods', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [] },
					],
					shippingZoneMethods: {},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [],
									deletes: [],
									currentlyEditingId: null,
								},
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [ { id: { index: 0 }, title: 'NewMethod' } ],
									updates: [],
									deletes: [],
									currentlyEditingId: { index: 0 },
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyOpenShippingZoneMethod( state ) ).to.deep.equal( { id: { index: 0 }, title: 'NewMethod' } );
		} );

		it( 'should overlay method updates and currently added changes', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [ 7 ] },
					],
					shippingZoneMethods: {
						7: { id: 7, title: 'MyOldMethodTitle' },
					},
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ {
								id: 1,
								methods: {
									creates: [],
									updates: [ { id: 7, title: 'MyNewMethodTitle', cost: 1 } ],
									deletes: [],
									currentlyEditingId: 7,
								},
							} ],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								methods: {
									creates: [],
									updates: [],
									deletes: [],
									currentlyEditingId: 7,
									currentlyEditingChanges: { cost: 123 }
								}
							},
						},
					},
				},
			} );

			expect( getCurrentlyOpenShippingZoneMethod( state ) ).to.deep.equal( { id: 7, title: 'MyNewMethodTitle', cost: 123 } );
		} );
	} );
} );
