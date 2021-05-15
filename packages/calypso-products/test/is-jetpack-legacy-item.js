/**
 * Internal dependencies
 */
import isJetpackLegacyItem from '../src/is-jetpack-legacy-item';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from '../src/constants';

describe( 'isJetpackLegacyItem', () => {
	it( 'should return true if the item is a Jetpack legacy item', () => {
		expect( isJetpackLegacyItem( PLAN_JETPACK_PERSONAL ) ).toEqual( true );
		expect( isJetpackLegacyItem( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( true );
	} );

	it( 'should return false otherwise', () => {
		expect( isJetpackLegacyItem( PRODUCT_JETPACK_ANTI_SPAM ) ).toEqual( false );
		expect( isJetpackLegacyItem( PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ) ).toEqual( false );
		expect( isJetpackLegacyItem( PLAN_JETPACK_COMPLETE ) ).toEqual( false );
		expect( isJetpackLegacyItem( PLAN_JETPACK_COMPLETE_MONTHLY ) ).toEqual( false );
	} );
} );
