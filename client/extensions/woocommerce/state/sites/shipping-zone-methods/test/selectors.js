/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	getShippingZoneMethod,
	areShippingZoneMethodsLoaded,
	areShippingZoneMethodsLoading,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';
import * as plugins from 'woocommerce/state/selectors/plugins';

describe( 'selectors', () => {
	describe( 'get shipping zone method', () => {
		test( 'should return null when the shipping zone method does not exist', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZoneMethods: {},
							},
						},
					},
				},
			};

			expect( getShippingZoneMethod( state, 17, 123 ) ).to.be.undefined;
		} );

		test( 'should return the shipping zone method if it exists', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZoneMethods: {
									17: { id: 17, methodType: 'free_shipping' },
								},
							},
						},
					},
				},
			};

			expect( getShippingZoneMethod( state, 17, 123 ) ).to.deep.equal( {
				id: 17,
				methodType: 'free_shipping',
			} );
		} );
	} );

	describe( 'shipping zone methods loading state', () => {
		let wcsEnabledStub;
		beforeEach( () => {
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
		} );

		afterEach( () => {
			wcsEnabledStub.restore();
		} );

		test( 'when some zone methods are still loading.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingZones: [
									{ id: 1, methodIds: LOADING },
									{ id: 2, methodIds: [ 7, 42 ] },
								],
							},
						},
					},
				},
			};

			expect( areShippingZoneMethodsLoaded( state, 1, 123 ) ).to.be.false;
			expect( areShippingZoneMethodsLoading( state, 1, 123 ) ).to.be.true;
			expect( areShippingZoneMethodsLoaded( state, 2, 123 ) ).to.be.true;
			expect( areShippingZoneMethodsLoading( state, 2, 123 ) ).to.be.false;
		} );

		test( 'when all methods are loaded but some WCS method settings are not.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [ { id: 'wc_services_usps' }, { id: 'free_shipping' } ],
								shippingZoneMethods: {
									7: { id: 7, methodType: 'wc_services_usps' },
									8: { id: 8, methodType: 'wc_services_usps' },
									9: { id: 9, methodType: 'wc_services_usps' },
								},
								shippingZones: [
									{ id: 1, methodIds: [ 7, 8 ] },
									{ id: 2, methodIds: [ 9 ] },
								],
							},
						},
						woocommerceServices: {
							123: {
								shippingZoneMethodSettings: {
									7: LOADING,
									8: true,
									9: true,
								},
							},
						},
					},
				},
			};

			// With WCS disabled, none of the WCS-specific checks matter
			expect( areShippingZoneMethodsLoaded( state, 1, 123 ) ).to.be.true;
			expect( areShippingZoneMethodsLoading( state, 1, 123 ) ).to.be.false;
			expect( areShippingZoneMethodsLoaded( state, 2, 123 ) ).to.be.true;
			expect( areShippingZoneMethodsLoading( state, 2, 123 ) ).to.be.false;

			wcsEnabledStub.restore();
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( true );
			expect( areShippingZoneMethodsLoaded( state, 1, 123 ) ).to.be.false;
			expect( areShippingZoneMethodsLoading( state, 1, 123 ) ).to.be.true;
			expect( areShippingZoneMethodsLoaded( state, 2, 123 ) ).to.be.true;
			expect( areShippingZoneMethodsLoading( state, 2, 123 ) ).to.be.false;
		} );
	} );
} );
