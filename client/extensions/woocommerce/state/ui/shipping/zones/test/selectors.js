/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getShippingZones,
	getCurrentlyEditingShippingZone,
	isCurrentlyEditingShippingZone,
	canChangeShippingZoneTitle,
	canRemoveShippingZone,
	canEditShippingZoneLocations
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

describe( 'selectors', () => {
	describe( 'get shipping zones', () => {
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

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'when some zone methods are still being loaded', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, name: 'Zone0', methodIds: LOADING },
									{ id: 2, name: 'Zone0', methodIds: [] },
								],
								shippingZoneLocations: {
									1: { country: [], continent: [], state: [], postcode: [] },
									2: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list when some zone locations are still being loaded', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, name: 'Zone0', methodIds: [] },
									{ id: 2, name: 'Zone0', methodIds: [] },
								],
								shippingZoneLocations: {
									1: LOADING,
									2: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'when the zones didn\'t load', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: null,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'should return the WC-API zones list if there are no edits in the state', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [], name: 'Zone1' },
									{ id: 2, methodIds: [], name: 'Zone2' },
								],
								shippingZoneLocations: {
									1: { country: [], continent: [], state: [], postcode: [] },
									2: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
						ui: {},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingZones( state ) ).to.deep.equal( [
				{ id: 1, methodIds: [], name: 'Zone1' },
				{ id: 2, methodIds: [], name: 'Zone2' },
			] );
		} );

		it( 'should apply the "edits" changes to the zone list', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [], name: 'Zone1' },
									{ id: 2, methodIds: [], name: 'Zone2' },
									{ id: 3, methodIds: [], name: 'Zone3' },
								],
								shippingZoneLocations: {
									1: { country: [], continent: [], state: [], postcode: [] },
									2: { country: [], continent: [], state: [], postcode: [] },
									3: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
						ui: {
							123: {
								shipping: {
									zones: {
										creates: [
											{ id: { index: 0 }, methodIds: [], name: 'NewZone4' },
										],
										updates: [
											{ id: 2, name: 'EditedZone2' },
										],
										deletes: [
											{ id: 1 },
										],
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

			expect( getShippingZones( state ) ).to.deep.equal( [
				{ id: 2, methodIds: [], name: 'EditedZone2' },
				{ id: 3, methodIds: [], name: 'Zone3' },
				{ id: { index: 0 }, methodIds: [], name: 'NewZone4' },
			] );
		} );

		it( 'should NOT apply the uncommited changes made in the modal', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [], name: 'Zone1' },
								],
								shippingZoneLocations: {
									1: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
						ui: {
							123: {
								shipping: {
									zones: {
										creates: [],
										updates: [],
										deletes: [],
										currentlyEditingId: 1,
										currentlyEditingChanges: { name: 'This name has not been saved yet' },
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

			expect( getShippingZones( state ) ).to.deep.equal( [ { id: 1, methodIds: [], name: 'Zone1' } ] );
		} );
	} );

	describe( 'get shipping zone currently being edited', () => {
		it( 'when there is no zone being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [] },
								],
								shippingZoneLocations: {
									1: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
						ui: {
							123: {
								shipping: {
									zones: {
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

			expect( getCurrentlyEditingShippingZone( state ) ).to.be.null;
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.false;
		} );

		it( 'when there is a zone being edited, without changes in that zone', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [], name: 'MyZone' },
									{ id: 2, methodIds: [], name: 'Blah Blah' },
								],
								shippingZoneLocations: {
									1: { country: [], continent: [], state: [], postcode: [] },
									2: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
						ui: {
							123: {
								shipping: {
									zones: {
										creates: [],
										updates: [ { id: 2, name: 'Potato' } ],
										deletes: [],
										currentlyEditingId: 1,
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

			expect( getCurrentlyEditingShippingZone( state ) ).to.deep.equal( { id: 1, methodIds: [], name: 'MyZone' } );
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.true;
		} );

		it( 'when there is a zone being edited, with changes in that zone', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: [], name: 'MyZone' },
								],
								shippingZoneLocations: {
									1: { country: [], continent: [], state: [], postcode: [] },
								},
							},
						},
						ui: {
							123: {
								shipping: {
									zones: {
										creates: [],
										updates: [ { id: 1, name: 'MyNewZone' } ],
										deletes: [],
										currentlyEditingId: 1,
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

			expect( getCurrentlyEditingShippingZone( state ) ).to.deep.equal( { id: 1, methodIds: [], name: 'MyNewZone' } );
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.true;
		} );

		it( 'when there is a newly created zone being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [],
							},
						},
						ui: {
							123: {
								shipping: {
									zones: {
										creates: [ { id: { index: 0 }, name: 'MyNewZone' } ],
										updates: [],
										deletes: [],
										currentlyEditingId: { index: 0 },
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

			expect( getCurrentlyEditingShippingZone( state ) ).to.deep.equal( { id: { index: 0 }, name: 'MyNewZone' } );
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.true;
		} );
	} );

	describe( 'is shipping zone editable', () => {
		it( 'when it\'s a locally created zone', () => {
			const zoneId = { index: 0 };
			expect( canChangeShippingZoneTitle( zoneId ) ).to.be.true;
			expect( canRemoveShippingZone( zoneId ) ).to.be.true;
			expect( canEditShippingZoneLocations( zoneId ) ).to.be.true;
		} );

		it( 'when it\'s a regular zone', () => {
			const zoneId = 7;
			expect( canChangeShippingZoneTitle( zoneId ) ).to.be.true;
			expect( canRemoveShippingZone( zoneId ) ).to.be.true;
			expect( canEditShippingZoneLocations( zoneId ) ).to.be.true;
		} );

		it( 'when it\'s the "Rest Of The World" zone', () => {
			const zoneId = 0;
			expect( canChangeShippingZoneTitle( zoneId ) ).to.be.false;
			expect( canRemoveShippingZone( zoneId ) ).to.be.false;
			expect( canEditShippingZoneLocations( zoneId ) ).to.be.false;
		} );
	} );
} );
