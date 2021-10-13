import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
} from '../src/constants';
import { getJetpackItemTermVariants } from '../src/get-jetpack-item-term-variants';

const securityVariants = {
	yearly: PLAN_JETPACK_SECURITY_DAILY,
	monthly: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
};

const backupVariants = {
	yearly: PRODUCT_JETPACK_BACKUP_DAILY,
	monthly: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
};

describe( 'getJetpackItemTermVariants', () => {
	test( 'should return the term variants for a yearly plan', () => {
		expect( getJetpackItemTermVariants( PLAN_JETPACK_SECURITY_DAILY ) ).toEqual(
			expect.objectContaining( securityVariants )
		);
	} );

	test( 'should return the term variants for a monthly plan', () => {
		expect( getJetpackItemTermVariants( PLAN_JETPACK_SECURITY_DAILY_MONTHLY ) ).toEqual(
			expect.objectContaining( securityVariants )
		);
	} );

	test( 'should return the term variants for a yearly product', () => {
		expect( getJetpackItemTermVariants( PRODUCT_JETPACK_BACKUP_DAILY ) ).toEqual(
			expect.objectContaining( backupVariants )
		);
	} );

	test( 'should return the term variants for a monthly product', () => {
		expect( getJetpackItemTermVariants( PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ) ).toEqual(
			expect.objectContaining( backupVariants )
		);
	} );
} );
