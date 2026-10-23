import { isStandardEntryPoint, isUnifiedFlow } from '../entry-points';

describe( 'isStandardEntryPoint', () => {
	test.each( [
		[ 'jetpack_premium_analytics_onboarding', true ],
		[ 'jetpack_premium_analytics_upsell', true ],
		[ 'delete_connection_owner_notice', true ],
		[ 'a_b', true ],
		[ 'jetpack2_stats_v2', true ],
		[ `a_${ 'b'.repeat( 62 ) }`, true ],
		[ `a_${ 'b'.repeat( 63 ) }`, false ],
		[ 'jetpack-connector', false ],
		[ 'jetpack-onboarding', false ],
		[ 'jetpack-newsletter', false ],
		[ 'my-jetpack', false ],
		[ 'woocommerce-core-profiler', false ],
		[ 'jetpack-x_y', false ],
		[ 'jetpack', false ],
		[ 'Jetpack_stats', false ],
		[ '2fa_notice', false ],
		[ '_jetpack_stats', false ],
		[ 'jetpack_stats_', false ],
		[ 'jetpack__stats', false ],
		[ '', false ],
		[ '[unknown]', false ],
		[ null, false ],
		[ undefined, false ],
	] )( '%p → %p', ( from, expected ) => {
		expect( isStandardEntryPoint( from ) ).toBe( expected );
	} );
} );

describe( 'isUnifiedFlow', () => {
	test.each( [
		[ 'jetpack-connector', true ],
		[ 'jetpack_premium_analytics_onboarding', true ],
		[ 'delete_connection_owner_notice', true ],
		[ 'jetpack-connector-v2', false ],
		[ 'jetpack-onboarding', false ],
		[ 'jetpack-newsletter', false ],
		[ 'my-jetpack', false ],
		[ 'jetpack-x_y', false ],
		[ null, false ],
	] )( '%p → %p', ( from, expected ) => {
		expect( isUnifiedFlow( from ) ).toBe( expected );
	} );
} );
