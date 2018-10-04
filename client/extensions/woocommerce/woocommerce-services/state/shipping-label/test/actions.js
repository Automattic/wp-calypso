/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';

/**
 * Internal dependencies
 */
import { openPrintingFlow, convertToApiPackage } from '../actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
} from '../../action-types';
import * as selectors from '../selectors';

const orderId = 1;
const siteId = 123456;

function createGetStateFn( newProps = { origin: {}, destination: {} } ) {
	const defaultProps = {
		ignoreValidation: false,
		selectNormalized: false,
		isNormalized: false, // hack to prevent getLabelRates() in openPrintingFlow
		normalized: '',
		expanded: true, // hack to prevent getLabelRates() in openPrintingFlow
		values: {
			address: 'Some street',
			postcode: '',
			state: 'CA',
			country: 'US',
			phone: '123',
		},
	};

	const origin = Object.assign( {}, defaultProps, newProps.origin );
	const destination = Object.assign( {}, defaultProps, newProps.destination );

	return function() {
		return {
			extensions: {
				woocommerce: {
					woocommerceServices: {
						[ siteId ]: {
							shippingLabel: {
								[ orderId ]: {
									form: {
										origin,
										destination,
										packages: {
											selected: {},
										},
										rates: {
											values: {},
										},
									},
								},
							},
						},
					},
				},
			},
		};
	};
}

describe( 'Shipping label Actions', () => {
	describe( '#openPrintingFlow', () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
			.reply( 200, {
				data: {
					status: 200,
					body: {
						normalized: true,
						is_trivial_normalization: true,
					},
				},
			} );

		describe( 'origin validation ignored', () => {
			const dispatchSpy = sinon.spy();

			openPrintingFlow( orderId, siteId )(
				dispatchSpy,
				createGetStateFn( { origin: { ignoreValidation: true } } )
			);

			it( 'toggle origin', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'origin',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );
			it( 'do not toggle destination', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'destination',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect(
					dispatchSpy.calledWith( {
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );
		} );

		describe( 'origin errors exist', () => {
			const dispatchSpy = sinon.spy();

			const errorStub = sinon.stub( selectors, 'getFormErrors' ).returns( { origin: true } );

			openPrintingFlow( orderId, siteId )( dispatchSpy, createGetStateFn() );

			it( 'toggles origin', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'origin',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );
			it( 'do not toggle destination', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'destination',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect(
					dispatchSpy.calledWith( {
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );

			errorStub.restore();
		} );

		describe( 'destination validation ignored', () => {
			const dispatchSpy = sinon.spy();

			openPrintingFlow( orderId, siteId )(
				dispatchSpy,
				createGetStateFn( {
					destination: { ignoreValidation: true },
				} )
			);

			it( 'toggle destination', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'destination',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );
			it( 'do not toggle origin', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'origin',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect(
					dispatchSpy.calledWith( {
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );
		} );

		describe( 'destination errors exist', () => {
			const dispatchSpy = sinon.spy();

			const errorStub = sinon.stub( selectors, 'getFormErrors' ).returns( { destination: true } );

			openPrintingFlow( orderId, siteId )( dispatchSpy, createGetStateFn() );

			it( 'toggle destination', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'destination',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );
			it( 'do not toggle origin', () => {
				expect(
					dispatchSpy.calledWith( {
						stepName: 'origin',
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						orderId,
						siteId,
					} )
				).to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect(
					dispatchSpy.calledWith( {
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );

			errorStub.restore();
		} );

		nock.cleanAll();
	} );

	describe( '#convertToApiPackage', () => {
		it( 'totals value correctly (by quantity)', () => {
			const pckg = {
				id: 'id',
				box_id: 'box_id',
				service_id: 'service_id',
				length: 5,
				width: 6,
				height: 7,
				weight: 8,
				signature: 'signature',
				items: [
					{
						product_id: 123,
						quantity: 2,
					},
				],
			};

			const customsItems = {
				123: {
					weight: 4,
					value: 3,
					description: 'Product',
					tariffNumber: '098',
					originCountry: 'US',
				},
			};

			expect( convertToApiPackage( pckg, customsItems ) ).to.deep.equal( {
				id: 'id',
				box_id: 'box_id',
				service_id: 'service_id',
				length: 5,
				width: 6,
				height: 7,
				weight: 8,
				signature: 'signature',
				contents_type: 'merchandise',
				restriction_type: 'none',
				non_delivery_option: 'return',
				itn: '',
				items: [
					{
						product_id: 123,
						description: 'Product',
						quantity: 2,
						value: 6,
						weight: 8,
						hs_tariff_number: '098',
						origin_country: 'US',
					},
				],
			} );
		} );
	} );
} );
