/* @format */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import CheckoutStep from '../../src/components/checkout-step';

describe( 'CheckoutStep rendering', function() {
	const componentWithDefaults = <CheckoutStep title={ 'Step' } stepNumber={ 1 } />;
	it( "Default is selectable by '.checkout-step'", function() {
		expect( shallow( componentWithDefaults ).is( '.checkout-step' ) ).toBe( true );
	} );

	const componentWithCustomClass = (
		<CheckoutStep title={ 'Step' } stepNumber={ 1 } className={ 'custom-class' } /> // eslint-disable-line wpcalypso/jsx-classname-namespace
	);
	it( "Custom class is selectable by '.checkout-step'", function() {
		expect( shallow( componentWithCustomClass ).is( '.checkout-step' ) ).toBe( true );
	} );
	it( 'Custom class is selectable by custom class name', function() {
		expect( shallow( componentWithCustomClass ).is( '.custom-class' ) ).toBe( true );
	} );

	const componentWithChild = (
		<CheckoutStep title={ 'Step' } stepNumber={ 1 }>
			<br class="child-span" />
		</CheckoutStep>
	);
	it( 'Children are rendered', function() {
		expect( shallow( componentWithChild ).contains( <br class="child-span" /> ) ).toBe( true );
	} );
} );
