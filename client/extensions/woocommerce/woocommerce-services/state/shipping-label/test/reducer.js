/**
 * External dependencies
 */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	moveItem,
	openAddItem,
	setAddedItem,
	addItems,
	addPackage,
	removePackage,
	updatePackageWeight,
	savePackages,
	removeIgnoreValidation,
	updateAddressValue,
	clearAvailableRates,
	confirmAddressSuggestion,
} from '../actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_SIGNATURE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT,
} from '../../action-types';

const orderId = 1;
const siteId = 123456;

const initialState = {
	[ orderId ]: {
		form: {
			origin: {
				values: { address: 'Some street', postcode: '', state: 'CA', country: 'US' },
				isNormalized: false,
				normalized: null,
				ignoreValidation: { address: true, postcode: true, state: true, country: true },
			},
			destination: {
				isNormalized: false,
			},
			packages: {
				selected: {
					weight_0_custom1: {
						items: [
							{
								product_id: 123,
								weight: 1.2,
							},
						],
					},
					weight_1_custom1: {
						items: [
							{
								product_id: 456,
								weight: 2.3,
							},
						],
					},
				},
				isPacked: true,
			},
			rates: {
				values: {
					weight_0_custom1: '',
					weight_1_custom1: '',
				},
				available: {},
			},
		},
		openedPackageId: 'weight_0_custom1',
		labels: [],
	},
};

describe( 'Label purchase form reducer', () => {
	let stateBefore;

	beforeEach( () => {
		stateBefore = cloneDeep( initialState );
	} );

	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		expect( initialState ).to.eql( stateBefore );
	} );

	it( 'MOVE_ITEM moves items between selected packages', () => {
		const action = moveItem( orderId, siteId, 'weight_0_custom1', 0, 'weight_1_custom1' );
		const state = reducer( initialState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1 ).to.eql( undefined );
		expect( state[ orderId ].form.packages.selected.weight_1_custom1.items.length ).to.eql( 2 );
		expect( state[ orderId ].form.packages.selected.weight_1_custom1.items ).to.include(
			initialState[ orderId ].form.packages.selected.weight_0_custom1.items[ 0 ]
		);
		expect( state[ orderId ].form.packages.saved ).to.eql( false );
		expect( state[ orderId ].form.rates.values ).to.include.all.keys(
			Object.keys( state[ orderId ].form.packages.selected )
		);
		expect( state[ orderId ].form.needsPrintConfirmation ).to.eql( false );
		expect( state[ orderId ].form.rates.available ).to.eql( {} );
	} );

	it( 'MOVE_ITEM moves items from selected packages to original packaging', () => {
		const action = moveItem( orderId, siteId, 'weight_0_custom1', 0, 'individual' );
		const state = reducer( initialState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1 ).to.eql( undefined );
		expect( state[ orderId ].form.packages.selected ).to.include.keys( 'client_individual_0' );
		expect( state[ orderId ].form.packages.selected.client_individual_0.box_id ).to.eql(
			'individual'
		);
		expect( state[ orderId ].form.packages.selected.client_individual_0.items.length ).to.eql( 1 );
		expect( state[ orderId ].form.packages.selected.client_individual_0.items ).to.include(
			initialState[ orderId ].form.packages.selected.weight_0_custom1.items[ 0 ]
		);
		expect( state[ orderId ].form.packages.saved ).to.eql( false );
		expect( state[ orderId ].form.rates.values ).to.include.all.keys(
			Object.keys( state[ orderId ].form.packages.selected )
		);
		expect( state[ orderId ].form.needsPrintConfirmation ).to.eql( false );
		expect( state[ orderId ].form.rates.available ).to.eql( {} );
	} );

	it( 'MOVE_ITEM moves items from original packaging to selected packages and deletes original package', () => {
		const existingState = cloneDeep( initialState );
		existingState[ orderId ].form.packages.selected.client_individual_0 = {
			items: [
				{
					product_id: 789,
				},
			],
			box_id: 'individual',
		};
		existingState[ orderId ].openedPackageId = 'client_individual_0';

		const action = moveItem( orderId, siteId, 'client_individual_0', 0, 'weight_0_custom1' );
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1.items.length ).to.eql( 2 );
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.items ).to.include(
			existingState[ orderId ].form.packages.selected.client_individual_0.items[ 0 ]
		);
		expect( state[ orderId ].form.packages.saved ).to.eql( false );
		expect( state[ orderId ].form.needsPrintConfirmation ).to.eql( false );
		expect( state[ orderId ].form.rates.available ).to.eql( {} );
	} );

	it( 'ADD_ITEMS moves a set of items from their original packaging to selected package', () => {
		const existingState = cloneDeep( initialState );
		existingState[ orderId ].form.packages.selected.weight_2_custom1 = {
			items: [
				{
					product_id: 789,
					weight: 4.5,
				},
			],
		};
		existingState[ orderId ].form.packages.selected.weight_1_custom1.items[ 1 ] = {
			product_id: 457,
			weight: 3.4,
		};

		let state = reducer( existingState, openAddItem( orderId, siteId ) );
		expect( state[ orderId ].addedItems ).to.eql( {} );

		state = [
			setAddedItem( orderId, siteId, 'weight_0_custom1', 0, true ),
			setAddedItem( orderId, siteId, 'weight_1_custom1', 0, true ),
			setAddedItem( orderId, siteId, 'weight_1_custom1', 1, true ),
		].reduce( reducer, state );

		expect( state[ orderId ].addedItems.weight_0_custom1 ).to.eql( [ 0 ] );
		expect( state[ orderId ].addedItems.weight_1_custom1 ).to.include( 0 );
		expect( state[ orderId ].addedItems.weight_1_custom1 ).to.include( 1 );

		state = reducer( state, addItems( orderId, siteId, 'weight_2_custom1' ) );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1 ).to.not.exist;
		expect( state[ orderId ].form.packages.selected.weight_1_custom1 ).to.not.exist;
		expect( state[ orderId ].form.packages.selected.weight_2_custom1.items.length ).to.eql( 4 );
		expect( state[ orderId ].form.packages.selected.weight_2_custom1.items ).to.include(
			existingState[ orderId ].form.packages.selected.weight_0_custom1.items[ 0 ]
		);
		expect( state[ orderId ].form.packages.selected.weight_2_custom1.items ).to.include(
			existingState[ orderId ].form.packages.selected.weight_1_custom1.items[ 0 ]
		);
		expect( state[ orderId ].form.packages.selected.weight_2_custom1.items ).to.include(
			existingState[ orderId ].form.packages.selected.weight_1_custom1.items[ 1 ]
		);
	} );

	it( 'ADD_PACKAGE adds a new package', () => {
		const action = addPackage( orderId, siteId );
		const state = reducer( initialState, action );

		expect( state[ orderId ].form.packages.selected ).to.include.keys( 'client_custom_0' );
		expect( state[ orderId ].form.packages.selected.client_custom_0.items.length ).to.eql( 0 );
		expect( state[ orderId ].form.packages.selected.client_custom_0.box_id ).to.eql(
			'not_selected'
		);
		expect( state[ orderId ].form.packages.selected.client_custom_0.length ).to.eql( 0 );
		expect( state[ orderId ].form.packages.selected.client_custom_0.width ).to.eql( 0 );
		expect( state[ orderId ].form.packages.selected.client_custom_0.height ).to.eql( 0 );
		expect( state[ orderId ].form.packages.selected.client_custom_0.weight ).to.eql( 0 );
		expect( state[ orderId ].form.packages.saved ).to.eql( false );
		expect( state[ orderId ].openedPackageId ).to.eql( 'client_custom_0' );
		expect( state[ orderId ].form.needsPrintConfirmation ).to.eql( false );
		expect( state[ orderId ].form.rates.available ).to.eql( {} );
	} );

	it( 'REMOVE_PACKAGE removes the package and moves all the items to first package', () => {
		const action = removePackage( orderId, siteId, 'weight_0_custom1' );
		const state = reducer( initialState, action );

		expect( state[ orderId ].form.packages.selected ).to.not.include.keys( 'weight_0_custom1' );
		expect( state[ orderId ].form.packages.selected ).to.include.keys( 'weight_1_custom1' );
		expect( state[ orderId ].form.packages.selected.weight_1_custom1 ).to.include.all.keys(
			Object.keys( initialState[ orderId ].form.packages.selected.weight_0_custom1 )
		);
		expect( state[ orderId ].form.packages.selected.weight_1_custom1 ).to.include.all.keys(
			Object.keys( initialState[ orderId ].form.packages.selected.weight_1_custom1 )
		);
		expect( state[ orderId ].form.rates.values ).to.include.all.keys(
			Object.keys( state[ orderId ].form.packages.selected )
		);
		expect( state[ orderId ].form.packages.saved ).to.eql( false );
		expect( state[ orderId ].form.needsPrintConfirmation ).to.eql( false );
		expect( state[ orderId ].form.rates.available ).to.eql( {} );
	} );

	it( 'SET_PACKAGE_TYPE changes an existing package', () => {
		const action = {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
			siteId,
			orderId,
			packageId: 'weight_0_custom1',
			boxTypeId: 'customPackage1',
			box: {
				inner_dimensions: '1 x 2 x 3',
				box_weight: 3.5,
			},
		};
		const state = reducer( initialState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1.items.length ).to.eql( 1 );
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.box_id ).to.eql(
			'customPackage1'
		);
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.length ).to.eql( 1 );
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.width ).to.eql( 2 );
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.height ).to.eql( 3 );
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.weight ).to.eql( 4.7 );
		expect( state[ orderId ].form.packages.saved ).to.eql( false );
		expect( state[ orderId ].form.rates.values ).to.include.all.keys(
			Object.keys( state[ orderId ].form.packages.selected )
		);
		expect( state[ orderId ].form.needsPrintConfirmation ).to.eql( false );
		expect( state[ orderId ].form.rates.available ).to.eql( {} );
	} );

	it( 'SET_PACKAGE_TYPE maintains user-specified weight after changing an existing package', () => {
		const priorAction = updatePackageWeight( orderId, siteId, 'weight_0_custom1', 5.8 );
		const existingState = reducer( initialState, priorAction );

		const action = {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
			siteId,
			orderId,
			packageId: 'weight_0_custom1',
			boxTypeId: 'customPackage1',
			box: {
				inner_dimensions: '1 x 2 x 3',
				box_weight: 3.5,
			},
		};
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1.box_id ).to.eql(
			'customPackage1'
		);
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.weight ).to.eql( 5.8 );
	} );

	it( 'SAVE_PACKAGES changes the saved state', () => {
		const existingState = cloneDeep( initialState );
		existingState[ orderId ].form.packages.saved = false;

		const action = savePackages( orderId, siteId );
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.packages.saved ).to.eql( true );
	} );

	it( 'REMOVE_IGNORE_VALIDATION removes the ignore validation flags, does not change anything else', () => {
		const existingState = cloneDeep( initialState );

		const action = removeIgnoreValidation( orderId, siteId, 'origin' );
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.origin.ignoreValidation ).to.be.null;
		state[ orderId ].form.origin.ignoreValidation =
			existingState[ orderId ].form.origin.ignoreValidation;
		expect( state ).to.deep.equal( existingState );
	} );

	it( 'UPDATE_ADDRESS_VALUE on any field marks the address as not validated', () => {
		const existingState = cloneDeep( initialState );
		existingState[ orderId ].form.origin.ignoreValidation = null;
		existingState[ orderId ].form.origin.isNormalized = true;
		existingState[ orderId ].form.origin.normalized = { address: 'MAIN ST', postcode: '12345' };

		const action = updateAddressValue( orderId, siteId, 'origin', 'address', 'Main Street' );
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.origin.values.address ).to.equal( 'Main Street' );
		expect( state[ orderId ].form.origin.isNormalized ).to.be.false;
		expect( state[ orderId ].form.origin.normalized ).to.be.null;
	} );

	it( 'UPDATE_ADDRESS_VALUE changing the country restes the state field', () => {
		const existingState = cloneDeep( initialState );

		const action = updateAddressValue( orderId, siteId, 'origin', 'country', 'ES' );
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.origin.values.country ).to.equal( 'ES' );
		expect( state[ orderId ].form.origin.values.state ).to.equal( '' );
	} );

	it( 'UPDATE_ADDRESS_VALUE removed the "ignore validation" flag on that field', () => {
		const existingState = cloneDeep( initialState );

		const action = updateAddressValue( orderId, siteId, 'origin', 'address', 'Main Street' );
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.origin.ignoreValidation.address ).to.be.false;
		expect( state[ orderId ].form.origin.ignoreValidation.postcode ).to.be.true;
	} );

	it( 'CLEAR_AVAILABLE_RATES clears the available rates and resets the print confirmation', () => {
		const existingState = cloneDeep( initialState );

		const action = clearAvailableRates( orderId, siteId );
		const state = reducer( existingState, action );

		expect( state[ orderId ].form.rates.available ).to.eql( {} );
		expect( state[ orderId ].form.needsPrintConfirmation ).to.eql( false );
	} );

	it( 'PURCHASE_LABEL_RESPONSE handles errors', () => {
		const action = {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE,
			response: null,
			error: 'there was an error',
			siteId,
			orderId,
		};
		const state = reducer( initialState, action );

		// In an error condition, the form is marked as "not submitting"
		// and the label data should remain unchanged
		expect( state[ orderId ].form.isSubmitting ).to.equal( false );
		expect( initialState[ orderId ].labels ).to.deep.equal( state[ orderId ].labels );
	} );

	it( 'PURCHASE_LABEL_RESPONSE handles success', () => {
		const label = {
			label_id: 1,
			tracking: '8888888888888888888888',
			refundable_amount: 6.66,
			created: 1500054237240,
			carrier_id: 'usps',
			service_name: 'USPS - Priority Mail',
			package_name: 'Individual packaging',
			product_names: [ 'Dark Matter' ],
		};
		const action = {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE,
			response: [ label ],
			error: null,
			siteId,
			orderId,
		};
		const state = reducer( initialState, action );

		// All labels in response should be in state, marked as "updated"
		expect( state[ orderId ].labels ).to.deep.equal( [ { ...label, statusUpdated: true } ] );
	} );

	it( 'Maintains fixed precision upon adjusting total weight', () => {
		const existingState = cloneDeep( initialState );
		existingState[ orderId ].form.packages.selected.weight_0_custom1 = {
			items: [
				{
					product_id: 123,
					weight: 3,
				},
				{
					product_id: 124,
					weight: 0.3,
				},
			],
			weight: 3.3,
		};
		existingState[ orderId ].form.packages.selected.weight_1_custom1 = {
			items: [
				{
					product_id: 456,
					weight: 1.44,
				},
			],
			weight: 1.44,
		};

		const action = moveItem( orderId, siteId, 'weight_0_custom1', 0, 'weight_1_custom1' );
		let state = reducer( existingState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1.weight ).to.eql( 0.3 );
		expect( state[ orderId ].form.packages.selected.weight_1_custom1.weight ).to.eql( 4.44 );

		const packageTypeAction = {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
			siteId,
			orderId,
			packageId: 'weight_0_custom1',
			boxTypeId: 'customPackage1',
			box: {
				inner_dimensions: '1 x 2 x 3',
				box_weight: 1.33,
			},
		};
		state = reducer( state, packageTypeAction );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1.weight ).to.eql( 1.63 );
	} );

	it( 'WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_SIGNATURE updates package signature option and clears rates', () => {
		const action = {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_SIGNATURE,
			siteId,
			orderId,
			packageId: 'weight_0_custom1',
			signature: 'yes',
		};
		const state = reducer( initialState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1.signature ).to.eql( 'yes' );
		expect( state[ orderId ].form.packages.saved ).to.be.false;
		expect( state[ orderId ].form.rates.available ).to.be.an( 'object' ).that.is.empty;
		expect( state[ orderId ].form.rates.values.weight_0_custom1 ).to.eql( '' );
	} );

	it( 'WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT updates package weight option and clears rates', () => {
		const action = {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT,
			siteId,
			orderId,
			packageId: 'weight_0_custom1',
			value: '3.3',
		};
		const state = reducer( initialState, action );

		expect( state[ orderId ].form.packages.selected.weight_0_custom1.weight ).to.eql( 3.3 );
		expect( state[ orderId ].form.packages.selected.weight_0_custom1.isUserSpecifiedWeight ).to.be
			.true;
		expect( state[ orderId ].form.packages.saved ).to.be.false;
		expect( state[ orderId ].form.rates.available ).to.be.an( 'object' ).that.is.empty;
		expect( state[ orderId ].form.rates.values.weight_0_custom1 ).to.eql( '' );
	} );

	it( 'WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION saves the address and proceeds to the next step', () => {
		const group = 'origin';
		let state = initialState;

		const getState = () => ( {
			extensions: {
				woocommerce: {
					woocommerceServices: {
						[ siteId ]: {
							shippingLabel: state,
						},
					},
				},
			},
		} );

		const dispatch = ( action ) => {
			state = reducer( state, action );
		};

		confirmAddressSuggestion( orderId, siteId, group )( dispatch, getState );

		expect( state[ orderId ].form[ group ] ).to.eql( {
			...initialState[ orderId ].form[ group ],
			expanded: false,
			isNormalized: true,
			normalized: initialState[ orderId ].form[ group ].values,
		} );
	} );
} );
