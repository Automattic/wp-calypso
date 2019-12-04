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

	test( 'should append intervalType to URL when forceInterval is true', () => {
		expect( plansLink( '/plans', 'example.com', 'monthly', true ) ).toBe(
			'/plans/monthly/example.com'
		);
		expect( plansLink( '/plans', 'example.com', 'yearly', true ) ).toBe(
			'/plans/yearly/example.com'
		);
	} );

	test( 'should append site slug if provided', () => {
		expect( plansLink( '/plans', 'example.com' ) ).toBe( '/plans/example.com' );
	} );

	test( 'should append monthly followed by site slug if provided', () => {
		expect( plansLink( '/plans', 'example.com', 'monthly' ) ).toBe( '/plans/monthly/example.com' );
	} );

	test( 'should append site slug if provided and yearly', () => {
		expect( plansLink( '/plans', 'example.com', 'yearly' ) ).toBe( '/plans/example.com' );
	} );

	test( 'should leave query string untouched when modifying url', () => {
		expect( plansLink( '/plans?query-key=query-value', 'example.com', 'monthly' ) ).toBe(
			'/plans/monthly/example.com?query-key=query-value'
		);
	} );
} );
