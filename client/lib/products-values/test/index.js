/**
 * Internal dependencies
 */
import {
	isJetpackPlan,
	isJetpackPlanSlug,
	isJetpackProduct,
	isJetpackProductSlug,
	isJetpackBackup,
	isJetpackBackupSlug,
	isMonthly,
	isYearly,
	isBiennially,
	isPersonal,
	isPremium,
	isBusiness,
	isEcommerce,
	isPlan,
	getJetpackProductDisplayName,
	getJetpackProductTagline,
} from '..';
import { getJetpackProductsDisplayNames, getJetpackProductsTaglines } from '../translations';
import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	JETPACK_PLANS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';

/**
 * Test helper to build a product object
 *
 * @param   {string} product_slug Product slug
 * @returns {object}              Object containing product_slug
 */
const makeProductFromSlug = ( product_slug ) => ( { product_slug } );

describe( 'isPlan', () => {
	test( 'should return true for paid products', () => {
		[
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE,
			PLAN_ECOMMERCE_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isPlan( product ) ).toBe( true ) );
	} );

	test( 'should return false for free products', () => {
		expect( isPlan( makeProductFromSlug( PLAN_FREE ) ) ).toBe( false );
	} );
} );

describe( 'isJetpackPlanSlug', () => {
	test( 'should return true for Jetpack plan slugs', () => {
		JETPACK_PLANS.forEach( ( planSlug ) => expect( isJetpackPlanSlug( planSlug ) ).toBe( true ) );
	} );

	test( 'should return false for non-Jetpack plan slugs', () => {
		const nonJetpackPlans = [ PLAN_BUSINESS, PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ];

		nonJetpackPlans.forEach( ( planSlug ) =>
			expect( isJetpackPlanSlug( planSlug ) ).toBe( false )
		);
	} );
} );

describe( 'isJetpackPlan', () => {
	test( 'should return true for Jetpack plans', () => {
		JETPACK_PLANS.map( makeProductFromSlug ).forEach( ( plan ) =>
			expect( isJetpackPlan( plan ) ).toBe( true )
		);
	} );

	test( 'should return false for non-Jetpack products', () => {
		const nonJetpackPlans = [ PLAN_BUSINESS, PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ];

		nonJetpackPlans
			.map( makeProductFromSlug )
			.forEach( ( plan ) => expect( isJetpackPlan( plan ) ).toBe( false ) );
	} );
} );

describe( 'isJetpackProductSlug', () => {
	test( 'should return true for Jetpack product slugs', () => {
		JETPACK_PRODUCTS_LIST.forEach( ( productSlug ) =>
			expect( isJetpackProductSlug( productSlug ) ).toBe( true )
		);
	} );

	test( 'should return false for non-Jetpack product slugs', () => {
		const nonJetpackProducts = [
			PLAN_BUSINESS,
			PLAN_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PREMIUM,
		];

		nonJetpackProducts.forEach( ( productSlug ) =>
			expect( isJetpackProductSlug( productSlug ) ).toBe( false )
		);
	} );
} );

describe( 'isJetpackProduct', () => {
	test( 'should return true for Jetpack products', () => {
		JETPACK_PRODUCTS_LIST.map( makeProductFromSlug ).forEach( ( product ) =>
			expect( isJetpackProduct( product ) ).toBe( true )
		);
	} );

	test( 'should return false for non-Jetpack products', () => {
		const nonJetpackProducts = [
			PLAN_BUSINESS,
			PLAN_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PREMIUM,
		];

		nonJetpackProducts
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isJetpackProduct( product ) ).toBe( false ) );
	} );
} );

describe( 'isJetpackBackupSlug', () => {
	test( 'should return true for Jetpack Backup product slugs', () => {
		JETPACK_BACKUP_PRODUCTS.forEach( ( productSlug ) =>
			expect( isJetpackBackupSlug( productSlug ) ).toBe( true )
		);
	} );

	test( 'should return false for non-Jetpack Backup product slugs', () => {
		const nonJetpackProducts = [
			PLAN_BUSINESS,
			PLAN_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PREMIUM,
		];

		nonJetpackProducts.forEach( ( productSlug ) =>
			expect( isJetpackBackupSlug( productSlug ) ).toBe( false )
		);
	} );
} );

describe( 'isJetpackBackup', () => {
	test( 'should return true for Jetpack Backup products', () => {
		JETPACK_BACKUP_PRODUCTS.map( makeProductFromSlug ).forEach( ( product ) =>
			expect( isJetpackBackup( product ) ).toBe( true )
		);
	} );

	test( 'should return false for non-Jetpack Backup products', () => {
		const nonJetpackProducts = [
			PLAN_BUSINESS,
			PLAN_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PREMIUM,
		];

		nonJetpackProducts
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isJetpackBackup( product ) ).toBe( false ) );
	} );
} );

describe( 'getJetpackProductDisplayName', () => {
	test( 'should return Jetpack Backup product display name', () => {
		const jetpackProductsDisplayNames = getJetpackProductsDisplayNames();
		JETPACK_BACKUP_PRODUCTS.map( makeProductFromSlug ).forEach( ( product ) =>
			expect( getJetpackProductDisplayName( product ) ).toStrictEqual(
				jetpackProductsDisplayNames[ product.product_slug ]
			)
		);
	} );
} );

describe( 'getJetpackProductTagline', () => {
	test( 'should return Jetpack Backup product default tagline', () => {
		const jetpackProductsTaglines = getJetpackProductsTaglines();
		JETPACK_BACKUP_PRODUCTS.map( makeProductFromSlug ).forEach( ( product ) =>
			expect( getJetpackProductTagline( product ) ).toBe(
				jetpackProductsTaglines[ product.product_slug ].default
			)
		);
	} );

	test( 'should return Jetpack Backup owned product tagline', () => {
		const jetpackProductsTaglines = getJetpackProductsTaglines();
		JETPACK_BACKUP_PRODUCTS.map( makeProductFromSlug ).forEach( ( product ) =>
			expect( getJetpackProductTagline( product, true ) ).toBe(
				jetpackProductsTaglines[ product.product_slug ].owned
			)
		);
	} );
} );

describe( 'isPersonal', () => {
	test( 'should return true for personal products', () => {
		[ PLAN_PERSONAL, PLAN_PERSONAL_2_YEARS, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isPersonal( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-personal products', () => {
		[ PLAN_BUSINESS, PLAN_JETPACK_PREMIUM ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isPersonal( product ) ).toBe( false ) );
	} );
} );

describe( 'isPremium', () => {
	test( 'should return true for premium products', () => {
		[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isPremium( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-premium products', () => {
		[ PLAN_BUSINESS, PLAN_JETPACK_PERSONAL ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isPremium( product ) ).toBe( false ) );
	} );
} );

describe( 'isBusiness', () => {
	test( 'should return true for business products', () => {
		[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isBusiness( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-business products', () => {
		[ PLAN_PREMIUM, PLAN_JETPACK_PERSONAL ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isBusiness( product ) ).toBe( false ) );
	} );
} );

describe( 'isEcommerce', () => {
	test( 'should return true for eCommerce products', () => {
		[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isEcommerce( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-eCommerec products', () => {
		[ PLAN_PREMIUM, PLAN_JETPACK_PERSONAL, PLAN_BUSINESS ]
			.map( makeProductFromSlug )
			.forEach( ( product ) => expect( isEcommerce( product ) ).toBe( false ) );
	} );
} );

describe( 'isMonthly', () => {
	test( 'should return true for monthly products', () => {
		expect( isMonthly( { bill_period: 31 } ) ).toBe( true );
	} );
	test( 'should return true for other products', () => {
		expect( isMonthly( { bill_period: 30 } ) ).toBe( false );
		expect( isMonthly( { bill_period: 32 } ) ).toBe( false );
		expect( isMonthly( { bill_period: 365 } ) ).toBe( false );
	} );
} );

describe( 'isYearly', () => {
	test( 'should return true for yearly products', () => {
		expect( isYearly( { bill_period: 365 } ) ).toBe( true );
	} );
	test( 'should return true for other products', () => {
		expect( isYearly( { bill_period: 700 } ) ).toBe( false );
		expect( isYearly( { bill_period: 31 } ) ).toBe( false );
		expect( isYearly( { bill_period: 364 } ) ).toBe( false );
	} );
} );

describe( 'isBiennially', () => {
	test( 'should return true for biennial products', () => {
		expect( isBiennially( { bill_period: 730 } ) ).toBe( true );
	} );
	test( 'should return true for other products', () => {
		expect( isBiennially( { bill_period: 365 } ) ).toBe( false );
		expect( isBiennially( { bill_period: 31 } ) ).toBe( false );
		expect( isBiennially( { bill_period: 731 } ) ).toBe( false );
	} );
} );
