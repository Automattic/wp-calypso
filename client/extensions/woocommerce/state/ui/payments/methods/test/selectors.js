/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	arePaymentsSetup,
	getPaymentMethodEdits,
	getPaymentMethodsWithEdits,
	getCurrentlyEditingPaymentMethod,
	getPaymentMethodsGroup,
	isCurrentlyEditingPaymentMethod,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const siteState = {
	paymentMethods: null,
};
const uiState = {
	methods: null,
};
const state = {
	extensions: {
		woocommerce: {
			sites: {
				123: siteState,
			},
			ui: {
				payments: {
					123: uiState,
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

describe( 'selectors', () => {
	beforeEach( () => {
		siteState.paymentMethods = null;
		uiState.methods = null;
	} );

	describe( 'getPaymentMethodEdits', () => {
		test( 'should return empty array when the methods are being loaded', () => {
			siteState.paymentMethods = LOADING;
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [] );
		} );

		test( "should return empty array when the methods didn't load", () => {
			siteState.paymentMethods = null;
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [] );
		} );

		test( 'should return the WC-API methods list if there are no edits in the state', () => {
			siteState.paymentMethods = [
				{ id: 1, settings: { name: { value: 'Method1' } } },
				{ id: 2, settings: { name: { value: 'Method2' } } },
			];
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [
				{ id: 1, settings: { name: { value: 'Method1' } } },
				{ id: 2, settings: { name: { value: 'Method2' } } },
			] );
		} );

		test( 'should apply the "edits" changes to the method list', () => {
			siteState.paymentMethods = [
				{ id: 1, settings: { name: { value: 'Method1' } } },
				{ id: 2, settings: { name: { value: 'Method2' } } },
			];
			uiState.methods = {
				creates: [ { id: { index: 0 }, settings: { name: { value: 'Method3' } } } ],
				updates: [ { id: 2, name: { value: 'EditedMethod2' } } ],
				deletes: [ { id: 1 } ],
				currentlyEditingId: null,
			};
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [
				{ id: 2, settings: { name: { value: 'EditedMethod2' } } },
				{ id: { index: 0 }, settings: { name: { value: 'Method3' } } },
			] );
		} );

		test( 'when title is edited, the base title attribute and settings value should both be updated', () => {
			siteState.paymentMethods = [
				{ id: 1, title: 'chicken', settings: { title: { value: 'chicken' } } },
				{ id: 2, title: 'ribs', settings: { title: { value: 'ribs' } } },
			];
			uiState.methods = {
				creates: [],
				updates: [ { id: 2, title: { value: 'yummy ribs' } } ],
				deletes: [],
				currentlyEditingId: null,
			};
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [
				{ id: 1, title: 'chicken', settings: { title: { value: 'chicken' } } },
				{ id: 2, title: 'yummy ribs', settings: { title: { value: 'yummy ribs' } } },
			] );
		} );

		test( 'should apply the enabled "edits" changes to the method list', () => {
			siteState.paymentMethods = [
				{ id: 1, enabled: false, settings: { name: { value: 'Method1' } } },
			];
			uiState.methods = {
				creates: [],
				deletes: [],
				updates: [ { id: 1, enabled: true } ],
			};
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [
				{ id: 1, enabled: true, settings: { name: { value: 'Method1' } } },
			] );
		} );

		test( 'should apply the description "edits" changes to the method list', () => {
			siteState.paymentMethods = [
				{ id: 1, enabled: true, description: 'test', settings: { name: { value: 'Method1' } } },
			];
			uiState.methods = {
				creates: [],
				deletes: [],
				updates: [ { id: 1, enabled: true, description: { value: 'update' } } ],
			};
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [
				{ id: 1, enabled: true, description: 'update', settings: { name: { value: 'Method1' } } },
			] );
		} );

		test( 'should NOT apply the uncommited changes made in the modal', () => {
			siteState.paymentMethods = [ { id: 1, settings: { name: { value: 'Method1' } } } ];
			uiState.methods = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { name: 'This name has not been saved yet' },
			};
			expect( getPaymentMethodsWithEdits( state ) ).to.deep.equal( [
				{ id: 1, settings: { name: { value: 'Method1' } } },
			] );
		} );
	} );

	describe( 'arePaymentsSetup', () => {
		test( 'should return false when there are no enabled payemnt methods', () => {
			siteState.paymentMethods = [ { id: 1, enabled: false } ];

			expect( arePaymentsSetup( state ) ).to.be.false;
		} );

		test( 'should return true when there are is an enabled payemnt method', () => {
			siteState.paymentMethods = [ { id: 1, enabled: true } ];

			expect( arePaymentsSetup( state ) ).to.be.true;
		} );
	} );

	describe( 'getCurrentlyEditingPaymentMethod', () => {
		test( 'should return null when there is no method being edited', () => {
			siteState.paymentMethods = [ { id: 1 } ];
			uiState.methods = {
				currentlyEditingId: null,
			};

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.be.null;
		} );

		test( 'should return method when there is a method being edited, without changes in that method', () => {
			siteState.paymentMethods = [
				{ id: 1, settings: { name: { value: 'Method1' } } },
				{ id: 2, settings: { name: { value: 'Method2' } } },
			];
			uiState.methods = {
				creates: [],
				updates: [ { id: 2, settings: { name: 'Foo' } } ],
				deletes: [],
				currentlyEditingId: 1,
			};

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.deep.equal( {
				id: 1,
				settings: { name: { value: 'Method1' } },
			} );
		} );

		test( 'should return method with changes when there is a method being edited, with changes in that method', () => {
			siteState.paymentMethods = [
				{ id: 1, description: 'test', settings: { name: { value: 'MyMethod' } } },
			];
			uiState.methods = {
				creates: [],
				updates: [ { id: 1, description: { value: 'update' }, name: { value: 'MyNewMethod' } } ],
				deletes: [],
				currentlyEditingId: 1,
			};

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.deep.equal( {
				id: 1,
				description: 'update',
				settings: { name: { value: 'MyNewMethod' } },
			} );
		} );

		test( 'should return new method from creates when there is a newly created method being edited', () => {
			siteState.paymentMethods = [];
			uiState.methods = {
				creates: [ { id: { index: 0 }, settings: { name: { value: 'MyNewMethod' } } } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
			};

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.deep.equal( {
				id: { index: 0 },
				settings: { name: { value: 'MyNewMethod' } },
			} );
		} );
	} );

	describe( 'isCurrentlyEditingPaymentMethod', () => {
		test( 'should return false when there is no method being edited', () => {
			siteState.paymentMethods = [ { id: 1 } ];
			uiState.methods = {
				currentlyEditingId: null,
			};

			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.false;
		} );

		test( 'should return true when there is a method being edited, without changes in that method', () => {
			siteState.paymentMethods = [
				{ id: 1, settings: { name: { value: 'Method1' } } },
				{ id: 2, settings: { name: { value: 'Method2' } } },
			];
			uiState.methods = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
			};

			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.true;
		} );

		test( 'should return new true when there is a newly created method being edited', () => {
			siteState.paymentMethods = [];
			uiState.methods = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
			};

			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.true;
		} );
	} );

	describe( 'getPaymentMethodsGroup', () => {
		test( 'should return emoty array when no methods of type exist', () => {
			siteState.paymentMethods = [
				{ id: 1, settings: { name: { value: 'Method1' } }, methodType: 'foo' },
				{ id: 2, settings: { name: { value: 'Method2' } }, methodType: 'bar' },
			];

			expect( getPaymentMethodsGroup( state, 'bang' ) ).to.deep.equal( [] );
		} );
		test( 'should return array of one method of type passed when one exists', () => {
			siteState.paymentMethods = [
				{ id: 1, settings: { name: { value: 'Method1' } }, methodType: 'foo' },
				{ id: 2, settings: { name: { value: 'Method2' } }, methodType: 'bang' },
			];

			expect( getPaymentMethodsGroup( state, 'bang' ) ).to.deep.equal( [
				{ id: 2, settings: { name: { value: 'Method2' } }, methodType: 'bang' },
			] );
		} );
		test( 'should return array of all methods of type when multiple exist', () => {
			siteState.paymentMethods = [
				{ id: 1, settings: { name: { value: 'Method1' } }, methodType: 'bang' },
				{ id: 2, settings: { name: { value: 'Method2' } }, methodType: 'bang' },
			];

			expect( getPaymentMethodsGroup( state, 'bang' ) ).to.deep.equal( [
				{ id: 1, settings: { name: { value: 'Method1' } }, methodType: 'bang' },
				{ id: 2, settings: { name: { value: 'Method2' } }, methodType: 'bang' },
			] );
		} );
	} );

	describe( 'getPaymentMethodEdits', () => {
		test( 'should return currently editing payment method changes when given populated state tree.', () => {
			uiState.methods = {
				currentlyEditingChanges: {
					title: 'Foo',
				},
			};
			expect( getPaymentMethodEdits( state, 123 ) ).to.deep.equal(
				state.extensions.woocommerce.ui.payments[ 123 ].methods.currentlyEditingChanges
			);
		} );

		test( 'should return undefined when given a state tree without currently editing changes.', () => {
			uiState.methods = {
				methods: {},
			};
			expect( getPaymentMethodEdits( state, 123 ) ).to.be.undefined;
		} );
	} );
} );
