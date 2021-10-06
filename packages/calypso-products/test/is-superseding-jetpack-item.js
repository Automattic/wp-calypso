import {
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
} from '../src';
import isSupersedingJetpackItem from '../src/is-superseding-jetpack-item';

describe( 'isSupersedingJetpackItem', () => {
	test( 'should return undefined if any slug is invalid', () => {
		const invalidSlug = 'jetpack_invalid';

		expect(
			isSupersedingJetpackItem( invalidSlug, PLAN_JETPACK_SECURITY_REALTIME )
		).toBeUndefined();
		expect( isSupersedingJetpackItem( PLAN_JETPACK_COMPLETE, invalidSlug ) ).toBeUndefined();
	} );

	test( 'should return true if the first item supersedes the second one', () => {
		expect(
			isSupersedingJetpackItem( PRODUCT_JETPACK_BACKUP_REALTIME, PRODUCT_JETPACK_BACKUP_DAILY )
		).toEqual( true );
		expect(
			isSupersedingJetpackItem( PLAN_JETPACK_COMPLETE, PLAN_JETPACK_SECURITY_REALTIME )
		).toEqual( true );
		expect(
			isSupersedingJetpackItem( PLAN_JETPACK_COMPLETE, PLAN_JETPACK_SECURITY_DAILY )
		).toEqual( true );
		expect(
			isSupersedingJetpackItem( PLAN_JETPACK_COMPLETE, PRODUCT_JETPACK_BACKUP_DAILY )
		).toEqual( true );
	} );

	test( 'should return false if the first item does not supersede the second one', () => {
		expect(
			isSupersedingJetpackItem( PLAN_JETPACK_SECURITY_REALTIME, PLAN_JETPACK_COMPLETE )
		).toEqual( false );
	} );

	test( 'should use yearly variants of items', () => {
		expect(
			isSupersedingJetpackItem(
				PLAN_JETPACK_COMPLETE_MONTHLY,
				PLAN_JETPACK_SECURITY_REALTIME_MONTHLY
			)
		).toEqual( true );
	} );
} );
