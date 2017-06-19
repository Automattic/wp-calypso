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
import { createState } from 'woocommerce/state/test/helpers';

const emptyZoneLocations = { country: [], continent: [], state: [], postcode: [] };

describe( 'selectors', () => {
	describe( 'getShippingZones', () => {
		it( 'should return an empty list when the zones are being loaded', () => {
			const state = createState( {
				site: {
					shippingZones: LOADING,
				},
				ui: {},
			} );

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list when some zone methods are still being loaded', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, name: 'Zone0', methodIds: LOADING },
						{ id: 2, name: 'Zone0', methodIds: [] },
					],
					shippingZoneLocations: { 1: emptyZoneLocations, 2: emptyZoneLocations },
				},
				ui: {},
			} );

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list when some zone locations are still being loaded', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, name: 'Zone0', methodIds: [] },
						{ id: 2, name: 'Zone0', methodIds: [] },
					],
					shippingZoneLocations: { 1: LOADING, 2: emptyZoneLocations },
				},
				ui: {},
			} );

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list when the zones didn\'t load', () => {
			const state = createState( {
				site: {
					shippingZones: null,
				},
				ui: {},
			} );

			expect( getShippingZones( state ) ).to.deep.equal( [] );
		} );

		it( 'should return the WC-API zones list if there are no edits in the state', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [], name: 'Zone1' },
						{ id: 2, methodIds: [], name: 'Zone2' },
					],
					shippingZoneLocations: { 1: emptyZoneLocations, 2: emptyZoneLocations },
				},
				ui: {},
			} );

			expect( getShippingZones( state ) ).to.deep.equal( [
				{ id: 1, methodIds: [], name: 'Zone1' },
				{ id: 2, methodIds: [], name: 'Zone2' },
			] );
		} );

		it( 'should apply the "edits" changes to the zone list', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [], name: 'Zone1' },
						{ id: 2, methodIds: [], name: 'Zone2' },
						{ id: 3, methodIds: [], name: 'Zone3' },
					],
					shippingZoneLocations: { 1: emptyZoneLocations, 2: emptyZoneLocations, 3: emptyZoneLocations },
				},
				ui: {
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
			} );

			expect( getShippingZones( state ) ).to.deep.equal( [
				{ id: { index: 0 }, methodIds: [], name: 'NewZone4' },
				{ id: 2, methodIds: [], name: 'EditedZone2' },
				{ id: 3, methodIds: [], name: 'Zone3' },
			] );
		} );

		it( 'should NOT apply the uncommitted changes made in the modal', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [], name: 'Zone1' },
					],
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
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
			} );

			expect( getShippingZones( state ) ).to.deep.equal( [ { id: 1, methodIds: [], name: 'Zone1' } ] );
		} );
	} );

	describe( 'getCurrentlyEditingShippingZone', () => {
		it( 'should return null when there is no zone being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [] },
					],
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZone( state ) ).to.be.null;
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.false;
		} );

		it( 'should return the zone being edited, even if there are no changes in that zone', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [], name: 'MyZone' },
						{ id: 2, methodIds: [], name: 'Blah Blah' },
					],
					shippingZoneLocations: { 1: emptyZoneLocations, 2: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ { id: 2, name: 'Potato' } ],
							deletes: [],
							currentlyEditingId: 1,
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZone( state ) ).to.deep.equal( { id: 1, methodIds: [], name: 'MyZone' } );
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.true;
		} );

		it( 'should return the zone being edited, with both the committed and non-committed changes overlayed', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [], name: 'MyZone' },
					],
					shippingZoneLocations: { 1: emptyZoneLocations },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [ { id: 1, name: 'MyNewZone' } ],
							deletes: [],
							currentlyEditingId: 1,
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZone( state ) ).to.deep.equal( { id: 1, methodIds: [], name: 'MyNewZone' } );
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.true;
		} );

		it( 'should return the zone being edited when it is a newly created zone with temporary ID', () => {
			const state = createState( {
				site: {
					shippingZones: [],
				},
				ui: {
					shipping: {
						zones: {
							creates: [ { id: { index: 0 }, name: 'MyNewZone' } ],
							updates: [],
							deletes: [],
							currentlyEditingId: { index: 0 },
						},
					},
				},
			} );

			expect( getCurrentlyEditingShippingZone( state ) ).to.deep.equal( { id: { index: 0 }, name: 'MyNewZone' } );
			expect( isCurrentlyEditingShippingZone( state ) ).to.be.true;
		} );
	} );

	describe( 'is shipping zone editable', () => {
		it( 'is editable when it\'s a locally created zone', () => {
			const zoneId = { index: 0 };
			expect( canChangeShippingZoneTitle( zoneId ) ).to.be.true;
			expect( canRemoveShippingZone( zoneId ) ).to.be.true;
			expect( canEditShippingZoneLocations( zoneId ) ).to.be.true;
		} );

		it( 'is editable when it\'s a regular zone', () => {
			const zoneId = 7;
			expect( canChangeShippingZoneTitle( zoneId ) ).to.be.true;
			expect( canRemoveShippingZone( zoneId ) ).to.be.true;
			expect( canEditShippingZoneLocations( zoneId ) ).to.be.true;
		} );

		it( 'is NOT editable when it\'s the "Rest Of The World" zone', () => {
			const zoneId = 0;
			expect( canChangeShippingZoneTitle( zoneId ) ).to.be.false;
			expect( canRemoveShippingZone( zoneId ) ).to.be.false;
			expect( canEditShippingZoneLocations( zoneId ) ).to.be.false;
		} );
	} );
} );
