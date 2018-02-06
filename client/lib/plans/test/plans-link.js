/** @format */
/**
 * Internal dependencies
 */
import { plansLink } from '..';

describe( 'plansLink', () => {
	test( 'should return url unchanged for yearly no-site', () => {
		expect( plansLink( '/plans' ) ).toBe( '/plans' );
	} );

	test( 'should append monthly to url when required', () => {
		expect( plansLink( '/plans', undefined, 'monthly' ) ).toBe( '/plans/monthly' );
	} );

	test( 'should append site slug if provided', () => {
		expect( plansLink( '/plans', { slug: 'example.com' } ) ).toBe( '/plans/example.com' );
	} );

	test( 'should append monthly followed by site slug if provided', () => {
		expect( plansLink( '/plans', { slug: 'example.com' }, 'monthly' ) ).toBe(
			'/plans/monthly/example.com'
		);
	} );

	test( 'should append site slug if provided and yearly', () => {
		expect( plansLink( '/plans', { slug: 'example.com' }, 'yearly' ) ).toBe( '/plans/example.com' );
	} );
} );
