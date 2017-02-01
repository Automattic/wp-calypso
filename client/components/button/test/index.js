/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from '../';

describe( 'Button', () => {
	describe( 'renders', () => {
		it( 'with modifiers', () => {
			const button = shallow( <Button scary primary borderless compact /> );
			expect( button ).to.have.className( 'is-compact' );
			expect( button ).to.have.className( 'is-primary' );
			expect( button ).to.have.className( 'is-scary' );
			expect( button ).to.have.className( 'is-borderless' );
		} );

		it( 'without modifiers', () => {
			const button = shallow( <Button /> );
			expect( button ).to.have.className( 'button' );
			expect( button ).to.not.have.className( 'is-compact' );
			expect( button ).to.not.have.className( 'is-primary' );
			expect( button ).to.not.have.className( 'is-scary' );
			expect( button ).to.not.have.className( 'is-borderless' );
		} );

		it( 'disabled', () => {
			const button = shallow( <Button disabled /> );
			expect( button ).to.be.disabled;
		} );

		it( 'with child', () => {
			const iconType = 'arrow-left';
			const icon = <Gridicon size={ 18 } icon={ iconType } />;
			const button = shallow( <Button>{ icon }</Button> );
			expect( button ).to.contain( icon );
			expect( button.find( Gridicon ) ).to.have.prop( 'icon' ).equal( iconType );
		} );
	} );

	describe( 'with href prop', () => {
		it( 'renders as a link', () => {
			const button = shallow( <Button href="https://wordpress.com/" /> );

			expect( button ).to.match( 'a' );
			expect( button ).to.have.prop( 'href' ).equal( 'https://wordpress.com/' );
		} );

		it( 'ignores type prop and renders a link without type attribute', () => {
			const button = shallow( <Button href="https://wordpress.com/" type="submit" /> );

			expect( button ).to.not.have.prop( 'type' );
		} );

		it( 'including target and rel props renders a link with target and rel attributes', () => {
			const button = shallow( <Button href="https://wordpress.com/" target="_blank" rel="noopener noreferrer" /> );

			expect( button ).to.have.prop( 'target' ).equal( '_blank' );
			expect( button ).to.have.prop( 'rel' ).equal( 'noopener noreferrer' );
		} );

		it( 'adds noopener noreferrer rel if target is specified', () => {
			const button = shallow( <Button href="https://wordpress.com/" target="_blank" /> );

			expect( button ).to.have.prop( 'target' ).equal( '_blank' );
			expect( button ).to.have.prop( 'rel' ).equal( 'noopener noreferrer' );
		} );
	} );

	describe( 'without href prop', () => {
		const button = shallow( <Button target="_blank" rel="noopener noreferrer" /> );

		it( 'renders as a button', () => {
			expect( button ).to.match( 'button' );
			expect( button ).to.not.have.prop( 'href' );
		} );

		it( 'renders button with type attribute set to "button" by default', () => {
			expect( button ).to.have.prop( 'type' ).equal( 'button' );
		} );

		it( 'renders button with type attribute set to type prop if specified', () => {
			const typeProp = 'submit';
			const submitButton = shallow( <Button target="_blank" rel="noopener noreferrer" type={ typeProp } /> );

			expect( submitButton ).to.have.prop( 'type' ).equal( typeProp );
		} );

		it( 'renders button without rel and target attributes', () => {
			expect( button ).to.not.have.prop( 'target' );
			expect( button ).to.not.have.prop( 'rel' );
		} );
	} );
} );
