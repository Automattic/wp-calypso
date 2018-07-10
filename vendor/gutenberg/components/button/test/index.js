/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import TestUtils from 'react-dom/test-utils';

/**
 * WordPress dependencies
 */
import { createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ButtonWithForwardedRef, { Button } from '../';

// [TEMPORARY]: Only needed so long as Enzyme does not support React.forwardRef
jest.unmock( '../' );

describe( 'Button', () => {
	describe( 'basic rendering', () => {
		it( 'should render a button element with only one class', () => {
			const button = shallow( <Button /> );
			expect( button.hasClass( 'components-button' ) ).toBe( true );
			expect( button.hasClass( 'is-large' ) ).toBe( false );
			expect( button.hasClass( 'is-primary' ) ).toBe( false );
			expect( button.hasClass( 'is-toggled' ) ).toBe( false );
			expect( button.prop( 'disabled' ) ).toBeUndefined();
			expect( button.prop( 'type' ) ).toBe( 'button' );
			expect( button.type() ).toBe( 'button' );
		} );

		it( 'should render a button element with button-primary class', () => {
			const button = shallow( <Button isPrimary /> );
			expect( button.hasClass( 'is-large' ) ).toBe( false );
			expect( button.hasClass( 'is-primary' ) ).toBe( true );
			expect( button.hasClass( 'is-button' ) ).toBe( true );
		} );

		it( 'should render a button element with button-large class', () => {
			const button = shallow( <Button isLarge /> );
			expect( button.hasClass( 'is-large' ) ).toBe( true );
			expect( button.hasClass( 'is-default' ) ).toBe( true );
			expect( button.hasClass( 'is-button' ) ).toBe( true );
			expect( button.hasClass( 'is-primary' ) ).toBe( false );
		} );

		it( 'should render a button element with button-small class', () => {
			const button = shallow( <Button isSmall /> );
			expect( button.hasClass( 'is-default' ) ).toBe( true );
			expect( button.hasClass( 'is-button' ) ).toBe( true );
			expect( button.hasClass( 'is-large' ) ).toBe( false );
			expect( button.hasClass( 'is-small' ) ).toBe( true );
			expect( button.hasClass( 'is-primary' ) ).toBe( false );
		} );

		it( 'should render a button element with is-toggled without button class', () => {
			const button = shallow( <Button isToggled /> );
			expect( button.hasClass( 'is-button' ) ).toBe( false );
			expect( button.hasClass( 'is-toggled' ) ).toBe( true );
		} );

		it( 'should add a disabled prop to the button', () => {
			const button = shallow( <Button disabled /> );
			expect( button.prop( 'disabled' ) ).toBe( true );
		} );

		it( 'should not poss the prop target into the element', () => {
			const button = shallow( <Button target="_blank" /> );
			expect( button.prop( 'target' ) ).toBeUndefined();
		} );

		it( 'should render with an additional className', () => {
			const button = shallow( <Button className="gutenberg" /> );

			expect( button.hasClass( 'gutenberg' ) ).toBe( true );
		} );

		it( 'should render and additional WordPress prop of value awesome', () => {
			const button = shallow( <Button WordPress="awesome" /> );

			expect( button.prop( 'WordPress' ) ).toBe( 'awesome' );
		} );
	} );

	describe( 'with href property', () => {
		it( 'should render a link instead of a button with href prop', () => {
			const button = shallow( <Button href="https://wordpress.org/" /> );

			expect( button.type() ).toBe( 'a' );
			expect( button.prop( 'href' ) ).toBe( 'https://wordpress.org/' );
		} );

		it( 'should allow for the passing of the target prop when a link is created', () => {
			const button = shallow( <Button href="https://wordpress.org/" target="_blank" /> );

			expect( button.prop( 'target' ) ).toBe( '_blank' );
		} );

		it( 'should become a button again when disabled is supplied', () => {
			const button = shallow( <Button href="https://wordpress.org/" disabled /> );

			expect( button.type() ).toBe( 'button' );
		} );
	} );

	describe( 'ref forwarding', () => {
		it( 'should enable access to DOM element', () => {
			const ref = createRef();

			TestUtils.renderIntoDocument( <ButtonWithForwardedRef ref={ ref } /> );
			expect( ref.current.type ).toBe( 'button' );
		} );
	} );
} );
