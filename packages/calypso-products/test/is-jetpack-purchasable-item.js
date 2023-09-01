import {
	PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PLAN_JETPACK_COMPLETE_BI_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from '../src/constants';
import isJetpackPurchasableItem from '../src/is-jetpack-purchasable-item';

describe( 'isJetpackPurchasableItem', () => {
	it( 'should return true if the item is a Jetpack product', () => {
		expect( isJetpackPurchasableItem( PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ) ).toEqual( true );
		expect( isJetpackPurchasableItem( PRODUCT_JETPACK_ANTI_SPAM ) ).toEqual( true );
		expect( isJetpackPurchasableItem( PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ) ).toEqual( true );
	} );

	it( 'should return true if the item is a Jetpack plan', () => {
		expect( isJetpackPurchasableItem( PLAN_JETPACK_COMPLETE_BI_YEARLY ) ).toEqual( true );
		expect( isJetpackPurchasableItem( PLAN_JETPACK_COMPLETE ) ).toEqual( true );
		expect( isJetpackPurchasableItem( PLAN_JETPACK_COMPLETE_MONTHLY ) ).toEqual( true );
	} );

	it( 'should return false if the item is a Jetpack legacy plan', () => {
		expect( isJetpackPurchasableItem( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isJetpackPurchasableItem( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
	} );

	it( 'should return true if the item is a Jetpack legacy plan and the `includeLegacy` option is set', () => {
		const options = { includeLegacy: true };

		expect( isJetpackPurchasableItem( PLAN_JETPACK_PERSONAL, options ) ).toEqual( true );
		expect( isJetpackPurchasableItem( PLAN_JETPACK_PERSONAL_MONTHLY, options ) ).toEqual( true );
	} );
} );
