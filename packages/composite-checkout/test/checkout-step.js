/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import CheckoutStep from '../src/components/checkout-step';

describe( 'CheckoutStep', function() {
	describe( 'inactive and incomplete', function() {
		const component = (
			<CheckoutStep
				title={ 'Step' }
				stepNumber={ 1 }
				isActive={ false }
				isComplete={ false }
				stepContent={ <span>empty</span> }
			/>
		);
		it( 'displays a checkout step', function() {
			expect( shallow( component ).is( '.checkout-step' ) ).toBe( true );
		} );
		it( 'does not display an active step', function() {
			expect( shallow( component ).is( '.checkout-step--is-active' ) ).toBe( false );
		} );
		it( 'does not display a complete step', function() {
			expect( shallow( component ).is( '.checkout-step--is-complete' ) ).toBe( false );
		} );
	} );

	describe( 'active and incomplete', function() {
		const component = (
			<CheckoutStep
				title={ 'Step' }
				stepNumber={ 1 }
				isActive={ true }
				isComplete={ false }
				stepContent={ <span>empty</span> }
			/>
		);
		it( 'displays a checkout step', function() {
			expect( shallow( component ).is( '.checkout-step' ) ).toBe( true );
		} );
		it( 'displays an active step', function() {
			expect( shallow( component ).is( '.checkout-step--is-active' ) ).toBe( true );
		} );
		it( 'does not display a complete step', function() {
			expect( shallow( component ).is( '.checkout-step--is-complete' ) ).toBe( false );
		} );
	} );

	describe( 'with custom class name', function() {
		const component = (
			<CheckoutStep
				title={ 'Step' }
				stepNumber={ 1 }
				className={ 'custom-class' } // eslint-disable-line wpcalypso/jsx-classname-namespace
				isActive={ false }
				isComplete={ false }
				stepContent={ <span>empty</span> }
			/>
		);
		it( 'displays a checkout step when a custom class is used', function() {
			expect( shallow( component ).is( '.checkout-step' ) ).toBe( true );
		} );
		it( 'is selectable by the custom class name if one is set', function() {
			expect( shallow( component ).is( '.custom-class' ) ).toBe( true );
		} );
	} );

	describe( 'with two custom class names', function() {
		const component = (
			<CheckoutStep
				title={ 'Step' }
				stepNumber={ 1 }
				className={ 'custom-class-1 custom-class-2' } // eslint-disable-line wpcalypso/jsx-classname-namespace
				isActive={ false }
				isComplete={ false }
				stepContent={ <span>empty</span> }
			/>
		);
		it( 'displays a checkout step with a custom class is used', function() {
			expect( shallow( component ).is( '.checkout-step' ) ).toBe( true );
		} );
		it( 'is selectable by the first custom class name if one is set', function() {
			expect( shallow( component ).is( '.custom-class-1' ) ).toBe( true );
		} );
		it( 'is selectable by the second custom class name if one is set', function() {
			expect( shallow( component ).is( '.custom-class-2' ) ).toBe( true );
		} );
	} );

	describe( 'with children', function() {
		const component = (
			<CheckoutStep
				title={ 'Step' }
				stepNumber={ 1 }
				isActive={ false }
				isComplete={ false }
				stepContent={ <br class="child-span" /> }
			/>
		);
		it( 'renders its children', function() {
			expect( shallow( component ).contains( <br class="child-span" /> ) ).toBe( true );
		} );
	} );
} );
