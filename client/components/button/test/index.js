/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Button from '../';
import Gridicon from 'components/gridicon';

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

	describe( 'link', () => {
		const blank = '_blank';
		const relString = 'noopener noreferrer';

		describe( '< a > element', () => {
			const address = 'https://wordpress.com/';
			const button = shallow( <Button href={ address } target={ blank } rel={ relString } type='submit' /> );

			it( 'is rendered', () => {
				expect( button ).to.match( 'a' );
			} );

			it( 'omits type property', () => {
				expect( button ).to.not.have.prop( 'type' );
			} );

			it( 'has href, target and rel property', () => {
				expect( button ).to.have.prop( 'href' ).equal( address );
				expect( button ).to.have.prop( 'target' ).equal( blank );
				expect( button ).to.have.prop( 'rel' ).equal( relString );
			} );
		} );

		describe( '< button > element', () => {
			const button = shallow( <Button target={ blank } rel={ relString } /> );

			it( 'is rendered', () => {
				expect( button ).to.match( 'button' );
			} );

			it( 'renders with `type` prop assigned to `button` by default', () => {
				expect( button ).to.have.prop( 'type' ).equal( 'button' );
			} );

			it( '`type` prop changes when overridden', () => {
				const typeProp = 'submit';
				const submitButton = shallow( <Button target={ blank } rel={ relString } type={ typeProp } /> );

				expect( submitButton ).to.have.prop( 'type' ).equal( typeProp );
			} );

			it( 'omits rel and target property', () => {
				expect( button ).to.not.have.prop( 'target' );
				expect( button ).to.not.have.prop( 'rel' );
			} );

			it( 'has not href property', () => {
				expect( button ).to.not.have.prop( 'href' );
			} );
		} );
	} );
} );
