jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'config', () => {
	const defaultExport = jest.fn();
	defaultExport.isEnabled = jest.fn();
	defaultExport.default = jest.fn();
	return defaultExport;
} );

jest.mock( 'lib/site/utils', () => ( {
	userCan: jest.fn(),
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { isATEnabled } from '../index';

const config = require( 'config' );
const utils = require( 'lib/site/utils' );

const site = {
	options: {
		is_automated_transfer: false,
	},
	plan: {
		product_slug: PLAN_FREE,
	},
};

const site_at = {
	options: {
		is_automated_transfer: true,
	},
};

describe( 'isATEnabled basic tests', () => {
	let beforeWindow;
	beforeAll( function () {
		beforeWindow = global.window;
		global.window = {};
	} );

	afterAll( function () {
		global.window = beforeWindow;
	} );

	beforeEach( () => {
		config.mockImplementation( () => 'some_env' );
		config.isEnabled.mockImplementation( () => true );
		utils.userCan.mockImplementation( () => true );
	} );

	test( 'should not blow up', () => {
		assert.equal( isATEnabled( site ), false );
	} );

	test( 'should return false if window is undefined', () => {
		delete global.window;
		assert.equal( isATEnabled( site_at ), false );
		global.window = {};
	} );

	test( 'should return true if AT option is enabled', () => {
		assert.equal( isATEnabled( site_at ), true );
	} );

	test( 'should return false if AT feature is disabled', () => {
		config.isEnabled.mockImplementation( () => false );
		assert.equal( isATEnabled( site ), false );
	} );

	test( 'should return true if env is wpcalypso', () => {
		config.mockImplementation( () => 'wpcalypso' );
		config.isEnabled.mockImplementation( () => true );
		assert.equal( isATEnabled( site ), true );
	} );

	test( 'should return false if site does not have a business or ecommerce plan', () => {
		const plans = [
			PLAN_FREE,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		];

		plans.forEach( ( product_slug ) => {
			const mySite = {
				...site,
				plan: { product_slug },
			};
			assert.equal( isATEnabled( mySite ), false );
		} );
	} );

	test( "should return false if user can't manage site", () => {
		utils.userCan.mockImplementation( () => false );
		assert.equal( isATEnabled( site ), false );
	} );

	test( 'should return true otherwise', () => {
		const plans = [ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS, PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ];
		plans.forEach( ( product_slug ) => {
			const mySite = {
				...site,
				plan: { product_slug },
			};
			assert.equal( isATEnabled( mySite ), true );
		} );
	} );
} );
