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
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

describe( 'selectors', () => {
	describe( 'get shipping zone methods', () => {
		it( 'when the zones are being loaded', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [] );
		} );

		it( 'when the zone does not exist', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZoneMethods( state, 7 ) ).to.deep.equal( [] );
		} );

		it( 'should NOT overlay the zone currently being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, title: 'MyOldMethodTitle' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: 7, title: 'MyOldMethodTitle' } ] );
		} );

		it( 'should overlay method updates', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, title: 'MyOldMethodTitle' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: 7, title: 'MyNewMethodTitle' } ] );
		} );

		it( 'should overlay method deletes', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7, 8 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, title: 'Title7' },
									8: { id: 8, title: 'Title8' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: 8, title: 'Title8' } ] );
		} );

		it( 'should overlay method creates', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [] },
								],
								shippingZoneMethods: {},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [ { id: { index: 0 }, title: 'NewMethod' } ] );
		} );

		it( 'should sort the shipping methods', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7, 8 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, title: 'Title7', order: 1 },
									8: { id: 8, title: 'Title8', order: 2 },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZoneMethods( state, 1 ) ).to.deep.equal( [
				{ id: { index: 1 }, title: 'ConvertedMethod7', _originalId: 7 },
				{ id: 8, title: 'NewTitle8', order: 2 },
				{ id: { index: 2 }, title: 'ConvertedMethod0', _originalId: { index: 0 } },
				{ id: { index: 3 }, title: 'NewMethod3' },
			] );
		} );
	} );

	describe( 'get currently editing shipping zone methods', () => {
		it( 'when the zones are being loaded', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [] );
		} );

		it( 'when there is no zone currently being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7 ] },
								],
								shippingZoneMethods: {
									7: { id: 7 },
								},
							},
						},
						ui: {
							shipping: {
								123: {
									zones: {
										creates: [],
										updates: [],
										deletes: [],
										currentlyEditingId: null,
									},
								},
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [] );
		} );

		it( 'should overlay updates in the zone currently being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, title: 'MyOldOldMethodTitle' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [
				{ id: 7, title: 'MyNewMethodTitle', foo: 'bar' },
			] );
		} );

		it( 'should overlay deletes in the zone currently being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7, 8, 9 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, title: 'Title7' },
									8: { id: 8, title: 'Title8' },
									9: { id: 9, title: 'Title9' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [ { id: 9, title: 'Title9' } ] );
		} );

		it( 'should overlay method creates in the zone currently being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [] },
								],
								shippingZoneMethods: {},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getCurrentlyEditingShippingZoneMethods( state ) ).to.deep.equal( [ { id: { index: 0 }, title: 'NewMethod' } ] );
		} );
	} );

	describe( 'get type options to add a new shipping method to a zone', () => {
		it( 'when there are no methods in the zone', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [] },
								],
								shippingZoneMethods: {},
							},
						},
						ui: {
							shipping: {
								123: {
									zones: {
										creates: [],
										updates: [],
										deletes: [],
										currentlyEditingId: null,
									},
								},
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getNewMethodTypeOptions( state, 1 ) ).to.deep.equal( [
				'flat_rate',
				'free_shipping',
				'local_pickup',
			] );
		} );

		it( 'should not allow for repeated methods, except for local_pickup', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7, 8, 9 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, methodType: 'local_pickup' },
									8: { id: 8, methodType: 'free_shipping' },
									9: { id: 9, methodType: 'flat_rate' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
									zones: {
										creates: [],
										updates: [],
										deletes: [],
										currentlyEditingId: null,
									},
								},
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getNewMethodTypeOptions( state, 1 ) ).to.deep.equal( [ 'local_pickup' ] );
		} );

		it( 'should overlay committed edits to the zone, but not uncommitted edits to the zone currently edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7, 8 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, methodType: 'free_shipping' },
									8: { id: 8, methodType: 'flat_rate' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getNewMethodTypeOptions( state, 1 ) ).to.deep.equal( [ 'free_shipping', 'local_pickup' ] );
		} );

		it( 'should use the zone currently being edited if the zoneId param is omitted, overlaying all the edits', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [ 7, 8 ] },
								],
								shippingZoneMethods: {
									7: { id: 7, methodType: 'free_shipping' },
								},
							},
						},
						ui: {
							shipping: {
								123: {
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
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getNewMethodTypeOptions( state ) ).to.deep.equal( [ 'free_shipping', 'local_pickup' ] );
		} );
	} );
} );
