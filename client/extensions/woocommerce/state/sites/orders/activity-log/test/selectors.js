/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { isActivityLogLoaded, isActivityLogLoading, getActivityLogEvents } from '../selectors';
import * as plugins from 'woocommerce/state/selectors/plugins';

const getState = ( notesState, labelsState ) => ( {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						notes: notesState,
					},
				},
			},
			woocommerceServices: {
				123: {
					shippingLabel: {
						45: labelsState,
					},
				},
			},
		},
	},
} );

const notesLoadingSubtree = {
	isLoading: {
		45: true,
	},
	isSaving: {
		45: true,
	},
	items: {},
	orders: {},
};

const notesLoadedSubtree = {
	isLoading: {
		45: false,
	},
	isSaving: {
		45: false,
	},
	items: {
		1: {
			id: 1,
			date_created_gmt: 'Mon Sep 18 2017 09:37:51',
			note: 'Something internal',
			customer_note: false,
		},
		2: {
			id: 2,
			date_created_gmt: 'Mon Sep 18 2017 10:37:51',
			note: 'Something customer-facing',
			customer_note: true,
		},
	},
	orders: {
		45: [ 1, 2 ],
	},
};

const emptyNotesSubtree = {
	isLoading: {
		45: false,
	},
	isSaving: {
		45: false,
	},
	items: {},
	orders: {
		45: [],
	},
};

const labelsLoadingSubtree = {
	isFetching: true,
};

const labelsLoadedSubtree = {
	isFetching: false,
	loaded: true,
	labels: [
		{
			label_id: 4,
			refundable_amount: 10,
			rate: 10,
			status: 'PURCHASED',
			currency: 'CAD',
			created_date: 4000000,
			used_date: null,
			expiry_date: 4500000,
			product_names: [ 'poutine' ],
			package_name: 'box',
			tracking: '12345',
			carrier_id: 'canada_post',
			service_name: 'Xpress',
			main_receipt_id: 12345,
			label_cached: 1600000,
			refund: {
				status: 'rejected',
				request_date: 4100000,
				refund_date: 4200000,
			},
		},
		{
			label_id: 3,
			refundable_amount: 7,
			rate: 7,
			status: 'PURCHASED',
			currency: 'USD',
			created_date: 3000000,
			used_date: null,
			expiry_date: null,
			product_names: [ 'Autograph' ],
			package_name: 'Small Envelope',
			tracking: '12345',
			carrier_id: 'usps',
			service_name: 'First Class',
			main_receipt_id: 12345,
			label_cached: 1600000,
			refund: {
				status: 'complete',
				request_date: 3100000,
				refund_date: 3200000,
				amount: '6.95',
			},
		},
		{
			label_id: 2,
			refundable_amount: 7,
			rate: 7,
			status: 'PURCHASED',
			currency: 'CAD',
			created_date: 2000000,
			used_date: null,
			expiry_date: 2500000,
			product_names: [ 'blender' ],
			package_name: 'regular box',
			tracking: '12345',
			carrier_id: 'canada_post',
			service_name: 'Xpress',
			main_receipt_id: 67890,
			label_cached: 1600000,
			refund: {
				status: 'pending',
				request_date: 2100000,
			},
		},
		{
			label_id: 1,
			refundable_amount: 4.5,
			rate: 5,
			status: 'PURCHASED',
			currency: 'USD',
			created_date: 1000000,
			used_date: 1100000,
			expiry_date: 1500000,
			product_names: [ 'bee', 'bee' ],
			package_name: 'bee box',
			tracking: '12345',
			carrier_id: 'usps',
			service_name: 'First Class',
			main_receipt_id: 654321,
			label_cached: 1600000,
		},
		{
			label_id: 10000,
			refundable_amount: 4.5,
			rate: 5,
			status: 'PURCHASE_ERROR',
			currency: 'USD',
			created_date: 1000000,
			used_date: 1100000,
			expiry_date: 1500000,
			product_names: [ 'bee', 'bee' ],
			package_name: 'bee box',
			tracking: '12345',
			carrier_id: 'usps',
			service_name: 'First Class',
			main_receipt_id: 123456789,
		},
		{
			label_id: 10001,
			refundable_amount: 4.5,
			rate: 5,
			status: 'PURCHASE_IN_PROGRESS',
			currency: 'USD',
			created_date: 1000000,
			used_date: 1100000,
			expiry_date: 1500000,
			product_names: [ 'bee', 'bee' ],
			package_name: 'bee box',
			tracking: '12345',
			carrier_id: 'usps',
			service_name: 'First Class',
			label_cached: 1600000,
		},
	],
};

const emptyLabelsSubtree = {
	isFetching: false,
	loaded: true,
	labels: [],
};

const labelsErrorSubtree = {
	isFetching: false,
	loaded: false,
	error: true,
};

const anonymizedLabelsSubtree = {
	isFetching: false,
	loaded: true,
	labels: [
		{
			label_id: 4,
			refundable_amount: 10,
			rate: 10,
			status: 'ANONYMIZED',
			currency: 'CAD',
			created_date: 4000000,
			used_date: null,
			expiry_date: 4500000,
			product_names: [ 'poutine' ],
			package_name: 'box',
			tracking: '12345',
			carrier_id: 'canada_post',
			service_name: 'Xpress',
			main_receipt_id: 12345,
		},
	],
};

const notesAndLabelsLoadingState = getState( notesLoadingSubtree, labelsLoadingSubtree );
const notesLoadingState = getState( notesLoadingSubtree, labelsLoadedSubtree );
const labelsLoadingState = getState( notesLoadedSubtree, labelsLoadingSubtree );
const loadedState = getState( notesLoadedSubtree, labelsLoadedSubtree );
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	let wcsEnabledStub;
	beforeEach( () => {
		wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( true );
	} );

	afterEach( () => {
		wcsEnabledStub.restore();
	} );

	describe( '#isActivityLogLoaded', () => {
		it( 'should be false when notes are currently being fetched for this order.', () => {
			expect( isActivityLogLoaded( notesAndLabelsLoadingState, 45, 123 ) ).to.be.false;
			expect( isActivityLogLoaded( notesLoadingState, 45, 123 ) ).to.be.false;
		} );

		it( 'should be false when notes are loaded but labels are not.', () => {
			expect( isActivityLogLoaded( labelsLoadingState, 45, 123 ) ).to.not.be.ok;
		} );

		it( 'should be true when notes are loaded and the WooCommerce Services extension is disabled.', () => {
			wcsEnabledStub.restore();
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
			expect( isActivityLogLoaded( labelsLoadingState, 45, 123 ) ).to.be.true;
		} );

		it( 'should be true when notes and labels are loaded for this order.', () => {
			expect( isActivityLogLoaded( loadedState, 45, 123 ) ).to.be.true;
		} );

		it( 'should be false when notes are loaded only for a different order.', () => {
			expect( isActivityLogLoaded( loadedState, 20, 123 ) ).to.be.false;
		} );

		it( 'should be false when notes are loaded only for a different site.', () => {
			expect( isActivityLogLoaded( loadedState, 45, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isActivityLogLoaded( loadedStateWithUi, 45 ) ).to.be.true;
		} );

		it( 'should be true if labels fetch errors out, but notes were loaded', () => {
			expect( isActivityLogLoaded( getState( notesLoadedSubtree, labelsErrorSubtree ), 45, 123 ) )
				.to.be.true;
		} );

		it( 'should be false if labels fetch errors out, and notes were not loaded', () => {
			expect( isActivityLogLoaded( getState( notesLoadingSubtree, labelsErrorSubtree ), 45, 123 ) )
				.to.be.false;
		} );

		it( 'should be true if WCS is disabled, and notes were loaded', () => {
			wcsEnabledStub.restore();
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
			expect( isActivityLogLoaded( getState( notesLoadedSubtree, labelsLoadingState ), 45, 123 ) )
				.to.be.true;
		} );
	} );

	describe( '#isActivityLogLoading', () => {
		it( 'should be true when notes are currently being fetched for this order.', () => {
			expect( isActivityLogLoading( notesAndLabelsLoadingState, 45, 123 ) ).to.be.true;
			expect( isActivityLogLoading( notesLoadingState, 45, 123 ) ).to.be.true;
		} );

		it( 'should be true when notes are loaded but labels are not.', () => {
			expect( isActivityLogLoading( labelsLoadingState, 45, 123 ) ).to.be.true;
		} );

		it( 'should be false when notes are loaded and the WooCommerce Services extension is disabled.', () => {
			wcsEnabledStub.restore();
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
			expect( isActivityLogLoading( labelsLoadingState, 45, 123 ) ).to.be.false;
		} );

		it( 'should be false when notes and labels are loaded for this order.', () => {
			expect( isActivityLogLoading( loadedState, 45, 123 ) ).to.be.false;
		} );

		it( 'should be false when notes are loading only for a different order.', () => {
			expect( isActivityLogLoading( notesLoadingState, 20, 123 ) ).to.not.be.ok;
		} );

		it( 'should be false when notes are loading only for a different site.', () => {
			expect( isActivityLogLoading( notesLoadingState, 45, 456 ) ).to.not.be.ok;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isActivityLogLoading( loadedStateWithUi, 45 ) ).to.be.false;
		} );

		it( 'should be false when notes are loaded and labels errored out', () => {
			expect( isActivityLogLoading( getState( notesLoadedSubtree, labelsErrorSubtree ), 45, 123 ) )
				.to.be.false;
		} );

		it( 'should be true when notes are loading and labels errored out', () => {
			expect( isActivityLogLoading( getState( notesLoadingSubtree, labelsErrorSubtree ), 45, 123 ) )
				.to.be.true;
		} );
	} );

	describe( '#getActivityLogEvents', () => {
		it( 'should be empty when notes are currently being fetched for this order.', () => {
			expect( getActivityLogEvents( notesAndLabelsLoadingState, 45, 123 ) ).to.be.empty;
			expect( getActivityLogEvents( getState( notesLoadingSubtree, emptyLabelsSubtree ), 45, 123 ) )
				.to.be.empty;
		} );

		it( 'should be empty when notes are loaded but labels are not.', () => {
			expect( getActivityLogEvents( getState( emptyNotesSubtree, labelsLoadingSubtree ), 45, 123 ) )
				.to.be.empty;
		} );

		it( 'should return just the notes when notes are loaded and the Services extension is disabled.', () => {
			wcsEnabledStub.restore();
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
			expect( getActivityLogEvents( loadedState, 45, 123 ) ).to.deep.equal( [
				{
					key: 1,
					type: 'INTERNAL_NOTE',
					timestamp: 1505727471000,
					content: 'Something internal',
				},
				{
					key: 2,
					type: 'CUSTOMER_NOTE',
					timestamp: 1505731071000,
					content: 'Something customer-facing',
				},
			] );
		} );

		it( 'should return a list of events if everything is loaded.', () => {
			expect( getActivityLogEvents( loadedState, 45, 123 ) ).to.deep.equal( [
				{
					key: 1,
					type: 'INTERNAL_NOTE',
					timestamp: 1505727471000,
					content: 'Something internal',
				},
				{
					key: 2,
					type: 'CUSTOMER_NOTE',
					timestamp: 1505731071000,
					content: 'Something customer-facing',
				},
				{
					key: 4,
					type: 'LABEL_REFUND_REJECTED',
					timestamp: 4200000,
					serviceName: 'Xpress',
					labelIndex: 4,
				},
				{
					key: 4,
					type: 'LABEL_PURCHASED',
					timestamp: 4000000,
					createdDate: 4000000,
					usedDate: null,
					expiryDate: 4500000,
					showDetails: true, // Refund rejected, user can refund/reprint again
					labelId: 4,
					labelIndex: 4,
					amount: 10,
					currency: 'CAD',
					refundableAmount: 10,
					packageName: 'box',
					productNames: [ 'poutine' ],
					tracking: '12345',
					carrierId: 'canada_post',
					serviceName: 'Xpress',
					receiptId: 12345,
					anonymized: false,
					labelCached: 1600000,
				},
				{
					key: 3,
					type: 'LABEL_REFUND_COMPLETED',
					timestamp: 3200000,
					serviceName: 'First Class',
					labelIndex: 3,
					amount: 6.95,
					currency: 'USD',
				},
				{
					key: 3,
					type: 'LABEL_PURCHASED',
					timestamp: 3000000,
					createdDate: 3000000,
					usedDate: null,
					expiryDate: null,
					showDetails: false, // Already requested refund
					labelId: 3,
					labelIndex: 3,
					amount: 7,
					currency: 'USD',
					refundableAmount: 7,
					packageName: 'Small Envelope',
					productNames: [ 'Autograph' ],
					tracking: '12345',
					carrierId: 'usps',
					serviceName: 'First Class',
					receiptId: 12345,
					anonymized: false,
					labelCached: 1600000,
				},
				{
					key: 2,
					type: 'LABEL_REFUND_REQUESTED',
					timestamp: 2100000,
					serviceName: 'Xpress',
					labelIndex: 2,
					amount: 7,
					currency: 'CAD',
				},
				{
					key: 2,
					type: 'LABEL_PURCHASED',
					timestamp: 2000000,
					createdDate: 2000000,
					usedDate: null,
					expiryDate: 2500000,
					showDetails: false, // Already requested refund
					labelId: 2,
					labelIndex: 2,
					amount: 7,
					currency: 'CAD',
					refundableAmount: 7,
					packageName: 'regular box',
					productNames: [ 'blender' ],
					tracking: '12345',
					carrierId: 'canada_post',
					serviceName: 'Xpress',
					receiptId: 67890,
					anonymized: false,
					labelCached: 1600000,
				},
				{
					key: 1,
					type: 'LABEL_PURCHASED',
					timestamp: 1000000,
					createdDate: 1000000,
					usedDate: 1100000,
					expiryDate: 1500000,
					showDetails: true,
					labelId: 1,
					labelIndex: 1,
					amount: 5,
					currency: 'USD',
					refundableAmount: 4.5,
					packageName: 'bee box',
					productNames: [ 'bee', 'bee' ],
					tracking: '12345',
					carrierId: 'usps',
					serviceName: 'First Class',
					receiptId: 654321,
					anonymized: false,
					labelCached: 1600000,
				},
				{
					key: 10001,
					type: 'LABEL_PURCHASING',
					labelIndex: 0,
					labelId: 10001,
					serviceName: 'First Class',
					carrierId: 'usps',
					labelCached: 1600000,
				},
			] );
		} );

		it( 'should be empty when notes are loaded only for a different order.', () => {
			expect( getActivityLogEvents( loadedState, 20, 123 ) ).to.be.empty;
		} );

		it( 'should be empty when notes are loaded only for a different site.', () => {
			expect( getActivityLogEvents( loadedState, 45, 456 ) ).to.be.empty;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getActivityLogEvents( loadedStateWithUi, 45 ) ).to.not.be.empty;
		} );

		it( 'should mark anonymized labels as not available for reprint', () => {
			const result = getActivityLogEvents(
				getState( emptyNotesSubtree, anonymizedLabelsSubtree ),
				45,
				123
			);
			expect( result[ 0 ].anonymized ).to.be.true;
		} );
	} );
} );
