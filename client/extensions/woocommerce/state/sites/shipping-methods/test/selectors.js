/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	getShippingMethods,
	areShippingMethodsLoaded,
	areShippingMethodsLoading,
	getShippingMethodNameMap,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';
import * as plugins from 'woocommerce/state/selectors/plugins';

describe( 'selectors', () => {
	let wcsEnabledStub;
	beforeEach( () => {
		wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
	} );

	afterEach( () => {
		wcsEnabledStub.restore();
	} );

	describe( 'shipping methods loading state', () => {
		test( 'when woocommerce state is not available.', () => {
			const state = {
				extensions: {
					woocommerce: {},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.be.undefined;
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.false;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.false;
		} );

		test( 'when methods are loaded.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [],
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.deep.equal( [] );
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.true;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.false;
		} );

		test( 'when methods are currently being fetched.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: LOADING,
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.equal( LOADING );
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.false;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.true;
		} );

		test( 'when methods are loaded only for a different site.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [],
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 456 ) ).to.be.undefined;
			expect( areShippingMethodsLoaded( state, 456 ) ).to.be.false;
			expect( areShippingMethodsLoading( state, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			const stateLoaded = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};
			const stateLoading = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingMethods( stateLoaded ) ).to.deep.equal( [] );
			expect( areShippingMethodsLoaded( stateLoaded ) ).to.be.true;
			expect( areShippingMethodsLoading( stateLoaded ) ).to.be.false;

			expect( getShippingMethods( stateLoading ) ).to.equal( LOADING );
			expect( areShippingMethodsLoaded( stateLoading ) ).to.be.false;
			expect( areShippingMethodsLoading( stateLoading ) ).to.be.true;
		} );

		test( 'when methods are loaded but the method schemas are not, with WooCommerce Services disabled.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [
									{ id: 'free_shipping', title: 'Free Shipping' },
									{ id: 'wc_services_usps' },
								],
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.deep.equal( [
				{ id: 'free_shipping', title: 'Free Shipping' },
			] );
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.true;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.false;
		} );

		test( 'when methods are loaded but the method schemas are not, with WooCommerce Services enabled.', () => {
			wcsEnabledStub.restore();
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( true );
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [ { id: 'wc_services_usps', title: 'USPS (WCS)' } ],
							},
						},
						woocommerceServices: {
							123: {
								shippingMethodSchemas: {
									wc_services_usps: LOADING,
								},
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.deep.equal( [
				{ id: 'wc_services_usps', title: 'USPS' },
			] );
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.false;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.true;
		} );

		test( 'when methods and schemas are loaded.', () => {
			wcsEnabledStub.restore();
			wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( true );
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [ { id: 'wc_services_usps' } ],
							},
						},
						woocommerceServices: {
							123: {
								shippingMethodSchemas: {
									wc_services_usps: {},
								},
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.deep.equal( [
				{ id: 'wc_services_usps', title: 'USPS' },
			] );
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.true;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.false;
		} );
	} );

	describe( 'getShippingMethodNameMap', () => {
		test( 'should return id of the service if the methods are loading', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: LOADING,
							},
						},
					},
				},
			};

			const map = getShippingMethodNameMap( state, 123 );
			expect( map( 'flat_rate' ) ).to.equal( 'flat_rate' );
		} );

		test( 'should return map function', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [
									{
										id: 'flat_rate',
										title: 'Flat rate',
									},
									{
										id: 'local_pickup',
										title: 'Local pickup',
									},
									{
										id: 'free_shipping',
										title: 'Free shipping',
									},
								],
							},
						},
					},
				},
			};

			const map = getShippingMethodNameMap( state, 123 );
			expect( map( 'flat_rate' ) ).to.equal( 'Flat rate' );
			expect( map( 'local_pickup' ) ).to.equal( 'Local pickup' );
			expect( map( 'free_shipping' ) ).to.equal( 'Free shipping' );
			expect( map( 'qwerty' ) ).to.equal( 'qwerty' );
		} );
	} );
} );
