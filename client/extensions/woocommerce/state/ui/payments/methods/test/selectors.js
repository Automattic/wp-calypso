/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPaymentMethodEdits,
	getPaymentMethods,
	getCurrentlyEditingPaymentMethod,
	getPaymentMethodsGroup,
	isCurrentlyEditingPaymentMethod,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

describe( 'selectors', () => {
	describe( 'get payment methods', () => {
		it( 'when the methods are being loaded', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
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
						sites: {
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
						sites: {
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
						sites: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1' },
									{ id: 2, name: 'Method2' },
									{ id: 3, name: 'Method3' },
								],
							},
						},
						ui: {
							payments: {
								123: {
									methods: {
										creates: [
											{ id: { index: 0 }, name: 'Method4' },
										],
										updates: [
											{ id: 2, name: { value: 'EditedMethod2' } },
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
				{ id: { index: 0 }, name: 'Method4' },
			] );
		} );

		it( 'should NOT apply the uncommited changes made in the modal', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1' },
								],
							},
						},
						ui: {
							payments: {
								123: {
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
						sites: {
							123: {
								paymentMethods: [
									{ id: 1 },
								],
							},
						},
						ui: {
							payments: {
								123: {
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
						sites: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1' },
									{ id: 2, name: 'Method2' },
								],
							},
						},
						ui: {
							payments: {
								123: {
									methods: {
										creates: [],
										updates: [ { id: 2, settings: { name: 'Foo' } } ],
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

			expect( getCurrentlyEditingPaymentMethod( state ) ).to.deep.equal( { id: 1, name: 'Method1' } );
			expect( isCurrentlyEditingPaymentMethod( state ) ).to.be.true;
		} );

		it( 'when there is a method being edited, with changes in that method', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'MyMethod' },
								],
							},
						},
						ui: {
							payments: {
								123: {
									methods: {
										creates: [],
										updates: [ { id: 1, name: { value: 'MyNewMethod' } } ],
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
						sites: {
							123: {
								paymentMethods: [],
							},
						},
						ui: {
							payments: {
								123: {
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

	describe( 'get payment methods group', () => {
		it( 'when no methods in group exist', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1', methodType: 'foo' },
									{ id: 2, name: 'Method2', methodType: 'bar' },
								],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getPaymentMethodsGroup( state, 'bang' ) ).to.deep.equal( [] );
		} );
		it( 'when method in group exists', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1', methodType: 'foo' },
									{ id: 2, name: 'Method2', methodType: 'bang' },
								],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getPaymentMethodsGroup( state, 'bang' ) ).to.deep.equal( [ { id: 2, name: 'Method2', methodType: 'bang' } ] );
		} );
		it( 'when methods in group exists', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								paymentMethods: [
									{ id: 1, name: 'Method1', methodType: 'bang' },
									{ id: 2, name: 'Method2', methodType: 'bang' },
								],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getPaymentMethodsGroup( state, 'bang' ) ).to.deep.equal( [
				{ id: 1, name: 'Method1', methodType: 'bang' },
				{ id: 2, name: 'Method2', methodType: 'bang' },
			] );
		} );
	} );

	describe( 'get payment method edits', () => {
		it( 'should return currently editing payment method changes when given populated state tree.', () => {
			const state = {
				extensions: {
					woocommerce: {
						ui: {
							payments: {
								123: {
									methods: {
										currentlyEditingChanges: {
											title: 'Foo'
										}
									}
								}
							}
						}
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};
			expect( getPaymentMethodEdits( state, 123 ) )
				.to.deep.equal(
					state.extensions.woocommerce.ui.payments[ 123 ].methods.currentlyEditingChanges
				);
		} );

		it( 'should return undefined when given a state tree without currently editing changes.', () => {
			const state = {
				extensions: {
					woocommerce: {
						ui: {
							payments: {
								123: {
									methods: {}
								}
							}
						}
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};
			expect( getPaymentMethodEdits( state, 123 ) ).to.be.undefined;
		} );
	} );
} );
