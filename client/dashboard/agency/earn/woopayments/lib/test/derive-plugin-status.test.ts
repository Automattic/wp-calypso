/**
 * @jest-environment node
 */
import { WOOCOMMERCE_PLUGIN, WOOCOMMERCE_PAYMENTS_PLUGIN } from '../constants';
import { derivePluginStatus } from '../derive-plugin-status';
import type { CorePlugin } from '@automattic/api-core';

const plugin = ( overrides: Partial< CorePlugin > ): CorePlugin =>
	( {
		plugin: '',
		status: 'active',
		name: '',
		...overrides,
	} ) as CorePlugin;

describe( 'derivePluginStatus', () => {
	it( 'reports both plugins missing when the list is empty', () => {
		expect( derivePluginStatus( [] ) ).toEqual( {
			hasWooCommerce: false,
			hasWooPayments: false,
			woocommerceStatus: undefined,
			woocommercePaymentsStatus: undefined,
			isWooCommerceInactive: false,
			isWooPaymentsActive: false,
			isWooPaymentsInactive: false,
		} );
	} );

	it( 'defaults to an empty list when called with no argument', () => {
		expect( derivePluginStatus().hasWooCommerce ).toBe( false );
	} );

	it( 'flags an inactive WooCommerce install', () => {
		const status = derivePluginStatus( [
			plugin( { plugin: WOOCOMMERCE_PLUGIN, status: 'inactive' } ),
		] );

		expect( status.hasWooCommerce ).toBe( true );
		expect( status.woocommerceStatus ).toBe( 'inactive' );
		expect( status.isWooCommerceInactive ).toBe( true );
	} );

	it( 'flags an active WooPayments install', () => {
		const status = derivePluginStatus( [
			plugin( { plugin: WOOCOMMERCE_PAYMENTS_PLUGIN, status: 'active' } ),
		] );

		expect( status.hasWooPayments ).toBe( true );
		expect( status.isWooPaymentsActive ).toBe( true );
		expect( status.isWooPaymentsInactive ).toBe( false );
	} );

	it( 'flags an inactive WooPayments install', () => {
		const status = derivePluginStatus( [
			plugin( { plugin: WOOCOMMERCE_PAYMENTS_PLUGIN, status: 'inactive' } ),
		] );

		expect( status.isWooPaymentsActive ).toBe( false );
		expect( status.isWooPaymentsInactive ).toBe( true );
	} );

	it( 'resolves both plugins when both are present', () => {
		const status = derivePluginStatus( [
			plugin( { plugin: WOOCOMMERCE_PLUGIN, status: 'active' } ),
			plugin( { plugin: WOOCOMMERCE_PAYMENTS_PLUGIN, status: 'active' } ),
		] );

		expect( status.hasWooCommerce ).toBe( true );
		expect( status.hasWooPayments ).toBe( true );
		expect( status.isWooCommerceInactive ).toBe( false );
		expect( status.isWooPaymentsActive ).toBe( true );
	} );
} );
