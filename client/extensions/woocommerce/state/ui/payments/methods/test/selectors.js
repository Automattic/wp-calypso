/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPaymentMethods,
	getCurrentlyEditingPaymentMethod,
	isCurrentlyEditingPaymentMethod,
	canChangePaymentMethodTitle,
	canRemovePaymentMethod,
	canEditPaymentMethodLocations
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

describe( 'selectors', () => {
	describe( 'get payment methods', () => {
		it( 'when the methods are being loaded', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getPaymentMethods( state ) ).to.deep.equal( [] );
		} );

		it( 'when the methods didn\'t load', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: null,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getPaymentMethods( state ) ).to.deep.equal( [] );
		} );

		it( 'should return the WC-API methods list if there are no edits in the state', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1' },
									{ id: 2, name: 'Method2' },
								],
							},
						},
						ui: {},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getPaymentMethods( state ) ).to.deep.equal( [
				{ id: 1, name: 'Method1' },
				{ id: 2, name: 'Method2' },
			] );
		} );

		it( 'should apply the "edits" changes to the method list', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1' },
									{ id: 2, name: 'Method2' },
									{ id: 3, name: 'Method3' },
								],
							},
						},
						ui: {
							123: {
								payment: {
									methods: {
										creates: [
											{ id: { index: 0 }, name: 'NewMethod4' },
										],
										updates: [
											{ id: 2, name: 'EditedMethod2' },
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

			expect( getPaymentMethods( state ) ).to.deep.equal( [
				{ id: 2, name: 'EditedMethod2' },
				{ id: 3, name: 'Method3' },
				{ id: { index: 0 }, name: 'NewMethod4' },
			] );
		} );

		it( 'should NOT apply the uncommited changes made in the modal', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1' },
								],
							},
						},
						ui: {
							123: {
								payment: {
									methods: {
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

			expect( getPaymentMethods( state ) ).to.deep.equal( [ { id: 1, name: 'Method1' } ] );
		} );
	} );

	describe( 'get payment method currently being edited', () => {
		it( 'when there is no method being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [
									{ id: 1 },
								],
							},
						},
						ui: {
							123: {
								payment: {
									methods: {
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

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.be.null;
			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.false;
		} );

		it( 'when there is a method being edited, without changes in that method', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'MyMethod' },
									{ id: 2, name: 'Blah Blah' },
								],
							},
						},
						ui: {
							123: {
								payment: {
									methods: {
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

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.deep.equal( { id: 1, name: 'MyMethod' } );
			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.true;
		} );

		it( 'when there is a method being edited, with changes in that method', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'MyMethod' },
								],
							},
						},
						ui: {
							123: {
								payment: {
									methods: {
										creates: [],
										updates: [ { id: 1, name: 'MyNewMethod' } ],
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

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.deep.equal( { id: 1, name: 'MyNewMethod' } );
			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.true;
		} );

		it( 'when there is a newly created method being edited', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [],
							},
						},
						ui: {
							123: {
								payment: {
									methods: {
										creates: [ { id: { index: 0 }, name: 'MyNewMethod' } ],
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

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.deep.equal( { id: { index: 0 }, name: 'MyNewMethod' } );
			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.true;
		} );
	} );

	describe( 'is payment method editable', () => {
		it( 'when it\'s a locally created method', () => {
			const methodId = { index: 0 };
			expect( canChangePaymentMethodTitle( methodId ) ).to.be.true;
			expect( canRemovePaymentMethod( methodId ) ).to.be.true;
			expect( canEditPaymentMethodLocations( methodId ) ).to.be.true;
		} );

		it( 'when it\'s a regular method', () => {
			const methodId = 7;
			expect( canChangePaymentMethodTitle( methodId ) ).to.be.true;
			expect( canRemovePaymentMethod( methodId ) ).to.be.true;
			expect( canEditPaymentMethodLocations( methodId ) ).to.be.true;
		} );

		it( 'when it\'s the "Rest Of The World" method', () => {
			const methodId = 0;
			expect( canChangePaymentMethodTitle( methodId ) ).to.be.false;
			expect( canRemovePaymentMethod( methodId ) ).to.be.false;
			expect( canEditPaymentMethodLocations( methodId ) ).to.be.false;
		} );
	} );
} );
