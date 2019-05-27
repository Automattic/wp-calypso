/** @format */
/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import Gridicon from 'gridicons';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from '../';

describe( 'Button', () => {
	describe( 'renders', () => {
		test( 'with modifiers', () => {
			const button = shallow( <Button scary primary borderless compact /> );
			expect( button.hasClass( 'is-compact' ) ).toBe( true );
			expect( button.hasClass( 'is-primary' ) ).toBe( true );
			expect( button.hasClass( 'is-scary' ) ).toBe( true );
			expect( button.hasClass( 'is-borderless' ) ).toBe( true );
		} );

		test( 'without modifiers', () => {
			const button = shallow( <Button /> );
			expect( button.hasClass( 'button' ) ).toBe( true );
			expect( button.hasClass( 'is-compact' ) ).toBe( false );
			expect( button.hasClass( 'is-primary' ) ).toBe( false );
			expect( button.hasClass( 'is-scary' ) ).toBe( false );
			expect( button.hasClass( 'is-borderless' ) ).toBe( false );
		} );

		test( 'disabled', () => {
			const button = shallow( <Button disabled /> );
			expect( button.prop( 'disabled' ) ).toBe( true );
		} );

		test( 'with child', () => {
			const iconType = 'arrow-left';
			const icon = <Gridicon size={ 18 } icon={ iconType } />;
			const button = shallow( <Button>{ icon }</Button> );
			expect( button.contains( icon ) ).toBe( true );
			expect( button.find( Gridicon ).prop( 'icon' ) ).toBe( iconType );
		} );
	} );

	describe( 'with href prop', () => {
		test( 'renders as a link', () => {
			const button = shallow( <Button href="https://wordpress.com/" /> );

			expect( button.type() ).toBe( 'a' );
			expect( button.prop( 'href' ) ).toBe( 'https://wordpress.com/' );
		} );

		test( 'ignores type prop and renders a link without type attribute', () => {
			const button = shallow( <Button href="https://wordpress.com/" type="submit" /> );

			expect( button.prop( 'type' ) ).toBeUndefined();
		} );

		test( 'including target and rel props renders a link with target and rel attributes', () => {
			const button = shallow(
				<Button href="https://wordpress.com/" target="_blank" rel="noopener noreferrer" />
			);

			expect( button.prop( 'target' ) ).toBe( '_blank' );
			expect( button.prop( 'rel' ) ).toMatch( /\bnoopener\b/ );
			expect( button.prop( 'rel' ) ).toMatch( /\bnoreferrer\b/ );
		} );

		test( 'adds noopener noreferrer rel if target is specified', () => {
			const button = shallow( <Button href="https://wordpress.com/" target="_blank" /> );

			expect( button.prop( 'target' ) ).toBe( '_blank' );
			expect( button.prop( 'rel' ) ).toMatch( /\bnoopener\b/ );
			expect( button.prop( 'rel' ) ).toMatch( /\bnoreferrer\b/ );
		} );
	} );

	describe( 'without href prop', () => {
		const button = shallow( <Button target="_blank" rel="noopener noreferrer" /> );

		test( 'renders as a button', () => {
			expect( button.type() ).toBe( 'button' );
			expect( button.prop( 'href' ) ).toBeUndefined();
		} );

		test( 'renders button with type attribute set to "button" by default', () => {
			expect( button.prop( 'type' ) ).toBe( 'button' );
		} );

		test( 'renders button with type attribute set to type prop if specified', () => {
			const typeProp = 'submit';
			const submitButton = shallow(
				<Button target="_blank" rel="noopener noreferrer" type={ typeProp } />
			);

			expect( submitButton.prop( 'type' ) ).toBe( typeProp );
		} );

		test( 'renders button without rel and target attributes', () => {
			expect( button.prop( 'target' ) ).toBeUndefined();
			expect( button.prop( 'rel' ) ).toBeUndefined();
		} );
	} );
} );
