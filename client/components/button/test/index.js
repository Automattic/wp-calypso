/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
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
			expect( button ).to.have.className( 'is-compact' );
			expect( button ).to.have.className( 'is-primary' );
			expect( button ).to.have.className( 'is-scary' );
			expect( button ).to.have.className( 'is-borderless' );
		} );

		test( 'without modifiers', () => {
			const button = shallow( <Button /> );
			expect( button ).to.have.className( 'button' );
			expect( button ).to.not.have.className( 'is-compact' );
			expect( button ).to.not.have.className( 'is-primary' );
			expect( button ).to.not.have.className( 'is-scary' );
			expect( button ).to.not.have.className( 'is-borderless' );
		} );

		test( 'disabled', () => {
			const button = shallow( <Button disabled /> );
			expect( button ).to.be.disabled;
		} );

		test( 'with child', () => {
			const iconType = 'arrow-left';
			const icon = <Gridicon size={ 18 } icon={ iconType } />;
			const button = shallow( <Button>{ icon }</Button> );
			expect( button ).to.contain( icon );
			expect( button.find( Gridicon ) )
				.to.have.prop( 'icon' )
				.equal( iconType );
		} );
	} );

	describe( 'with href prop', () => {
		test( 'renders as a link', () => {
			const button = shallow( <Button href="https://wordpress.com/" /> );

			expect( button ).to.match( 'a' );
			expect( button )
				.to.have.prop( 'href' )
				.equal( 'https://wordpress.com/' );
		} );

		test( 'ignores type prop and renders a link without type attribute', () => {
			const button = shallow( <Button href="https://wordpress.com/" type="submit" /> );

			expect( button ).to.not.have.prop( 'type' );
		} );

		test( 'including target and rel props renders a link with target and rel attributes', () => {
			const button = shallow(
				<Button href="https://wordpress.com/" target="_blank" rel="noopener noreferrer" />
			);

			expect( button )
				.to.have.prop( 'target' )
				.equal( '_blank' );
			expect( button )
				.to.have.prop( 'rel' )
				.match( /\bnoopener\b/ );
			expect( button )
				.to.have.prop( 'rel' )
				.match( /\bnoreferrer\b/ );
		} );

		test( 'adds noopener noreferrer rel if target is specified', () => {
			const button = shallow( <Button href="https://wordpress.com/" target="_blank" /> );

			expect( button )
				.to.have.prop( 'target' )
				.equal( '_blank' );
			expect( button )
				.to.have.prop( 'rel' )
				.match( /\bnoopener\b/ );
			expect( button )
				.to.have.prop( 'rel' )
				.match( /\bnoreferrer\b/ );
		} );
	} );

	describe( 'without href prop', () => {
		const button = shallow( <Button target="_blank" rel="noopener noreferrer" /> );

		test( 'renders as a button', () => {
			expect( button ).to.match( 'button' );
			expect( button ).to.not.have.prop( 'href' );
		} );

		test( 'renders button with type attribute set to "button" by default', () => {
			expect( button )
				.to.have.prop( 'type' )
				.equal( 'button' );
		} );

		test( 'renders button with type attribute set to type prop if specified', () => {
			const typeProp = 'submit';
			const submitButton = shallow(
				<Button target="_blank" rel="noopener noreferrer" type={ typeProp } />
			);

			expect( submitButton )
				.to.have.prop( 'type' )
				.equal( typeProp );
		} );

		test( 'renders button without rel and target attributes', () => {
			expect( button ).to.not.have.prop( 'target' );
			expect( button ).to.not.have.prop( 'rel' );
		} );
	} );
} );
