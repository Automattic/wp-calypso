/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	isActivityLogLoaded,
	isActivityLogLoading,
	getActivityLogEvents,
} from '../selectors';
import config from 'config';

const notesAndLabelsLoadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						notes: {
							isLoading: {
								45: true,
							},
							isSaving: {
								45: true,
							},
							items: {},
							orders: {},
						}
					},
				},
			},
			woocommerceServices: {
				123: {
					shippingLabel: {
						45: {
							isFetching: true,
						}
					}
				}
			}
		},
	},
};

const notesLoadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						notes: {
							isLoading: {
								45: true,
							},
							isSaving: {
								45: true,
							},
							items: {},
							orders: {},
						}
					},
				},
			},
			woocommerceServices: {
				123: {
					shippingLabel: {
						45: {
							isFetching: false,
							loaded: true,
							labels: [],
						}
					}
				}
			}
		},
	},
};

const labelsLoadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						notes: {
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
						}
					},
				},
			},
			woocommerceServices: {
				123: {
					shippingLabel: {
						45: {
							isFetching: true,
						}
					}
				}
			}
		},
	},
};

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						notes: {
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
						}
					},
				},
			},
			woocommerceServices: {
				123: {
					shippingLabel: {
						45: {
							isFetching: false,
							loaded: true,
							labels: [
								{
									label_id: 1,
									refundable_amount: 4.5,
									rate: 5,
									currency: 'USD',
									created_date: 1000000,
									product_names: [ 'bee', 'bee' ],
									package_name: 'bee box',
									tracking: '12345',
								},
								{
									label_id: 2,
									refundable_amount: 7,
									rate: 7,
									currency: 'CAD',
									created_date: 2000000,
									product_names: [ 'blender' ],
									package_name: 'regular box',
									tracking: '12345',
									refund: {
										status: 'pending',
										request_date: 2100000,
									},
								},
								{
									label_id: 3,
									refundable_amount: 7,
									rate: 7,
									currency: 'USD',
									created_date: 3000000,
									product_names: [ 'Autograph' ],
									package_name: 'Small Envelope',
									tracking: '12345',
									refund: {
										status: 'complete',
										request_date: 3100000,
										refund_date: 3200000,
										amount: '6.95',
									},
								},
								{
									label_id: 4,
									refundable_amount: 10,
									rate: 10,
									currency: 'CAD',
									created_date: 4000000,
									product_names: [ 'poutine' ],
									package_name: 'box',
									tracking: '12345',
									refund: {
										status: 'rejected',
										request_date: 4100000,
										refund_date: 4200000,
									},
								},
							],
						}
					}
				}
			}
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#isActivityLogLoaded', () => {
		it( 'should be false when notes are currently being fetched for this order.', () => {
			expect( isActivityLogLoaded( notesAndLabelsLoadingState, 45, 123 ) ).to.be.false;
			expect( isActivityLogLoaded( notesLoadingState, 45, 123 ) ).to.be.false;
		} );

		it( 'should be false when notes are loaded but labels are not.', () => {
			expect( isActivityLogLoaded( labelsLoadingState, 45, 123 ) ).to.be.falsy;
		} );

		it( 'should be true when notes are loaded and the WooCommerce Services extension is disabled.', sinon.test( function() {
			this.stub( config, 'isEnabled' ).withArgs( 'woocommerce/extension-wcservices' ).returns( false );
			expect( isActivityLogLoaded( labelsLoadingState, 45, 123 ) ).to.be.true;
		} ) );

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
	} );

	describe( '#isActivityLogLoading', () => {
		it( 'should be true when notes are currently being fetched for this order.', () => {
			expect( isActivityLogLoading( notesAndLabelsLoadingState, 45, 123 ) ).to.be.true;
			expect( isActivityLogLoading( notesLoadingState, 45, 123 ) ).to.be.true;
		} );

		it( 'should be true when notes are loaded but labels are not.', () => {
			expect( isActivityLogLoading( labelsLoadingState, 45, 123 ) ).to.be.true;
		} );

		it( 'should be false when notes are loaded and the WooCommerce Services extension is disabled.', sinon.test( function() {
			this.stub( config, 'isEnabled' ).withArgs( 'woocommerce/extension-wcservices' ).returns( false );
			expect( isActivityLogLoading( labelsLoadingState, 45, 123 ) ).to.be.false;
		} ) );

		it( 'should be false when notes and labels are loaded for this order.', () => {
			expect( isActivityLogLoading( loadedState, 45, 123 ) ).to.be.false;
		} );

		it( 'should be false when notes are loading only for a different order.', () => {
			expect( isActivityLogLoading( notesLoadingState, 20, 123 ) ).to.be.falsy;
		} );

		it( 'should be false when notes are loading only for a different site.', () => {
			expect( isActivityLogLoading( notesLoadingState, 45, 456 ) ).to.be.falsy;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isActivityLogLoading( loadedStateWithUi, 45 ) ).to.be.false;
		} );
	} );

	describe( '#getActivityLogEvents', () => {
		it( 'should be empty when notes are currently being fetched for this order.', () => {
			expect( getActivityLogEvents( notesAndLabelsLoadingState, 45, 123 ) ).to.be.empty;
			expect( getActivityLogEvents( notesLoadingState, 45, 123 ) ).to.be.empty;
		} );

		it( 'should be empty when notes are loaded but labels are not.', () => {
			expect( getActivityLogEvents( labelsLoadingState, 45, 123 ) ).to.be.empty;
		} );

		it( 'should return just the notes when notes are loaded and the Services extension is disabled.', sinon.test( function() {
			this.stub( config, 'isEnabled' ).withArgs( 'woocommerce/extension-wcservices' ).returns( false );
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
		} ) );

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
					key: 1,
					type: 'LABEL_PURCHASED',
					timestamp: 1000000,
					showDetails: true,
					labelId: 1,
					labelIndex: 0,
					amount: 5,
					currency: 'USD',
					refundableAmount: 4.5,
					packageName: 'bee box',
					productNames: [ 'bee', 'bee' ],
					tracking: '12345',
				},
				{
					key: 2,
					type: 'LABEL_REFUND_REQUESTED',
					timestamp: 2100000,
					labelIndex: 1,
					amount: 7,
					currency: 'CAD',
				},
				{
					key: 2,
					type: 'LABEL_PURCHASED',
					timestamp: 2000000,
					showDetails: false, // Already requested refund
					labelId: 2,
					labelIndex: 1,
					amount: 7,
					currency: 'CAD',
					refundableAmount: 7,
					packageName: 'regular box',
					productNames: [ 'blender' ],
					tracking: '12345',
				},
				{
					key: 3,
					type: 'LABEL_REFUND_COMPLETED',
					timestamp: 3200000,
					labelIndex: 2,
					amount: 6.95,
					currency: 'USD',
				},
				{
					key: 3,
					type: 'LABEL_PURCHASED',
					timestamp: 3000000,
					showDetails: false, // Already requested refund
					labelId: 3,
					labelIndex: 2,
					amount: 7,
					currency: 'USD',
					refundableAmount: 7,
					packageName: 'Small Envelope',
					productNames: [ 'Autograph' ],
					tracking: '12345',
				},
				{
					key: 4,
					type: 'LABEL_REFUND_REJECTED',
					timestamp: 4200000,
					labelIndex: 3,
				},
				{
					key: 4,
					type: 'LABEL_PURCHASED',
					timestamp: 4000000,
					showDetails: true, // Refund rejected, user can refund/reprint again
					labelId: 4,
					labelIndex: 3,
					amount: 10,
					currency: 'CAD',
					refundableAmount: 10,
					packageName: 'box',
					productNames: [ 'poutine' ],
					tracking: '12345',
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
	} );
} );
