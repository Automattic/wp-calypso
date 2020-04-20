/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	openPrintingFlow,
	convertToApiPackage,
	submitAddressForNormalization,
	confirmAddressSuggestion,
} from '../actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION,
} from '../../action-types';
import * as selectors from '../selectors';

const orderId = 1;
const siteId = 123456;
const defaultAddress = {
	address: 'Some street',
	postcode: '',
	state: 'CA',
	country: 'US',
	phone: '123',
};

function createGetStateFn( newProps = { origin: {}, destination: {} } ) {
	const defaultProps = {
		ignoreValidation: false,
		selectNormalized: false,
		isNormalized: false, // hack to prevent getLabelRates() in openPrintingFlow
		normalized: '',
		expanded: true, // hack to prevent getLabelRates() in openPrintingFlow
		values: defaultAddress,
	};

	const origin = Object.assign( {}, defaultProps, newProps.origin );
	const destination = Object.assign( {}, defaultProps, newProps.destination );

	return function () {
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

const mockNormalizationRequest = ( valid = true, persist = false ) => {
	const status = valid ? 200 : 500;

	let request = nock( 'https://public-api.wordpress.com:443' );

	if ( persist ) {
		request = request.persist();
	}

	return request.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` ).reply( status, {
		data: {
			status,
			body: {
				normalized: valid,
				is_trivial_normalization: valid,
			},
		},
	} );
};

describe( 'Shipping label Actions', () => {
	describe( '#openPrintingFlow', () => {
		mockNormalizationRequest( true, true );

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

	describe( '#submitAddressForNormalization', () => {
		/**
		 * `values` and `normalized` contain the same address.
		 *
		 * During the initial `submitAddressForNormalization` call,
		 * the function will still make a request because `isNormalized`
		 * is set to false, and blindly call the success callback afterwards,
		 * assuming that `normalizeAddress` has already changed the flag.
		 */
		const getState = createGetStateFn( {
			destination: {
				values: defaultAddress,
				normalized: defaultAddress,
			},
		} );

		it( 'Verifying a valid address proceeds to the next step', () => {
			const dispatchSpy = sinon.spy();

			// Mock a successful response
			mockNormalizationRequest( true );

			return submitAddressForNormalization(
				orderId,
				siteId,
				'destination'
			)( dispatchSpy, getState ).then( () => {
				expect(
					dispatchSpy.calledWith( {
						type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
						stepName: 'destination',
						orderId,
						siteId,
					} )
				).to.equal( true );
			} );
		} );

		it( 'Validation request failure returns a false promise', () => {
			// Mock an unsuccessful response
			mockNormalizationRequest( false );

			return new Promise( ( resolve ) => {
				submitAddressForNormalization(
					orderId,
					siteId,
					'destination'
				)( () => {}, getState ).catch( resolve );
			} );
		} );
	} );

	describe( '#confirmAddressSuggestion', () => {
		it( 'dispatches the correct action', () => {
			const dispatchSpy = sinon.spy();
			const group = 'destination';

			confirmAddressSuggestion( orderId, siteId, group )( dispatchSpy, createGetStateFn() );

			expect(
				dispatchSpy.calledWith( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION,
					orderId,
					siteId,
					group,
				} )
			).to.equal( true );
		} );
	} );
} );
