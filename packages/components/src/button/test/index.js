/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons'; // eslint-disable-line no-restricted-imports
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Button from '..';

describe( 'Button', () => {
	describe( 'renders', () => {
		test( 'with modifiers', () => {
			const button = shallow( <Button scary primary borderless compact /> );
			expect( button ).toHaveClassName( 'is-compact' );
			expect( button ).toHaveClassName( 'is-primary' );
			expect( button ).toHaveClassName( 'is-scary' );
			expect( button ).toHaveClassName( 'is-borderless' );
		} );

		test( 'without modifiers', () => {
			const button = shallow( <Button /> );
			expect( button ).toHaveClassName( 'button' );
			expect( button ).not.toHaveClassName( 'is-compact' );
			expect( button ).not.toHaveClassName( 'is-primary' );
			expect( button ).not.toHaveClassName( 'is-scary' );
			expect( button ).not.toHaveClassName( 'is-borderless' );
		} );

		test( 'disabled', () => {
			const button = shallow( <Button disabled /> );
			expect( button ).toBeDisabled();
		} );

		test( 'with child', () => {
			const iconType = 'arrow-left';
			const icon = <Gridicon size={ 18 } icon={ iconType } />;
			const button = shallow( <Button>{ icon }</Button> );
			expect( button ).toContainReact( icon );
			expect( button.find( Gridicon ) ).toHaveProp( 'icon', iconType );
		} );
	} );

	describe( 'with href prop', () => {
		test( 'renders as a link', () => {
			const button = shallow( <Button href="https://wordpress.com/" /> );

			expect( button ).toMatchSelector( 'a' );
			expect( button ).toHaveProp( 'href', 'https://wordpress.com/' );
		} );

		test( 'ignores type prop and renders a link without type attribute', () => {
			const button = shallow( <Button href="https://wordpress.com/" type="submit" /> );

			expect( button ).not.toHaveProp( 'type' );
		} );

		test( 'including target and rel props renders a link with target and rel attributes', () => {
			const button = shallow(
				<Button href="https://wordpress.com/" target="_blank" rel="noopener noreferrer" />
			);

			expect( button ).toHaveProp( 'target', '_blank' );
			expect( button ).toHaveProp( 'rel', expect.stringMatching( /\bnoopener\b/ ) );
			expect( button ).toHaveProp( 'rel', expect.stringMatching( /\bnoreferrer\b/ ) );
		} );

		test( 'adds noopener noreferrer rel if target is specified', () => {
			const button = shallow( <Button href="https://wordpress.com/" target="_blank" /> );

			expect( button ).toHaveProp( 'target', '_blank' );
			expect( button ).toHaveProp( 'rel', expect.stringMatching( /\bnoopener\b/ ) );
			expect( button ).toHaveProp( 'rel', expect.stringMatching( /\bnoreferrer\b/ ) );
		} );
	} );

	describe( 'without href prop', () => {
		const button = shallow( <Button target="_blank" rel="noopener noreferrer" /> );

		test( 'renders as a button', () => {
			expect( button ).toMatchSelector( 'button' );
			expect( button ).not.toHaveProp( 'href' );
		} );

		test( 'renders button with type attribute set to "button" by default', () => {
			expect( button ).toHaveProp( 'type', 'button' );
		} );

		test( 'renders button with type attribute set to type prop if specified', () => {
			const typeProp = 'submit';
			const submitButton = shallow(
				<Button target="_blank" rel="noopener noreferrer" type={ typeProp } />
			);

			expect( submitButton ).toHaveProp( 'type', typeProp );
		} );

		test( 'renders button without rel and target attributes', () => {
			expect( button ).not.toHaveProp( 'target' );
			expect( button ).not.toHaveProp( 'rel' );
		} );
	} );
} );
