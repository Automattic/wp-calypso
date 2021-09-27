import {
	PLAN_BLOGGER,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_WPCOM_ENTERPRISE,
	PLAN_VIP,
	PLAN_HOST_BUNDLE,
	PLAN_P2_PLUS,
	PLAN_P2_FREE,
	WPCOM_DIFM_LITE,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
} from '../src/constants';
import { isPlan } from '../src/is-plan';

describe( 'isPlan', () => {
	it.each( [
		PLAN_PREMIUM,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PERSONAL_MONTHLY,
		PLAN_BUSINESS,
		PLAN_ECOMMERCE,
		PLAN_BLOGGER,
		PLAN_WPCOM_ENTERPRISE,
		PLAN_HOST_BUNDLE,
		PLAN_P2_PLUS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_SECURITY_DAILY,
		PLAN_JETPACK_SECURITY_REALTIME,
		PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	] )( 'returns true for %s', ( slug ) => {
		expect( isPlan( { product_slug: slug } ) ).toBeTruthy();
		expect( isPlan( { productSlug: slug } ) ).toBeTruthy();
	} );

	it.each( [
		'asdljasdlsjadlasjdlkasjd',
		PLAN_FREE,
		WPCOM_DIFM_LITE,
		PLAN_P2_FREE,
		PLAN_VIP,
		PLAN_JETPACK_FREE,
	] )( 'returns false for %s', ( slug ) => {
		expect( isPlan( { product_slug: slug } ) ).toBeFalsy();
		expect( isPlan( { productSlug: slug } ) ).toBeFalsy();
	} );
} );
