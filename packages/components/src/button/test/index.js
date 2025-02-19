/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Button } from '..';
import Gridicon from '../../gridicon'; // eslint-disable-line no-restricted-imports

describe( 'Button', () => {
	describe( 'renders', () => {
		test( 'with modifiers', () => {
			render( <Button scary primary borderless compact /> );

			const button = screen.getByRole( 'button' );

			expect( button ).toHaveClass( 'is-compact' );
			expect( button ).toHaveClass( 'is-primary' );
			expect( button ).toHaveClass( 'is-scary' );
			expect( button ).toHaveClass( 'is-borderless' );
		} );

		test( 'without modifiers', () => {
			render( <Button /> );

			const button = screen.getByRole( 'button' );

			expect( button ).toHaveClass( 'button' );
			expect( button ).not.toHaveClass( 'is-compact' );
			expect( button ).not.toHaveClass( 'is-primary' );
			expect( button ).not.toHaveClass( 'is-scary' );
			expect( button ).not.toHaveClass( 'is-borderless' );
		} );

		test( 'disabled', () => {
			render( <Button disabled /> );

			expect( screen.getByRole( 'button' ) ).toBeDisabled();
		} );

		test( 'with child', () => {
			const icon = <Gridicon size={ 18 } icon="arrow-left" />;

			const { container, rerender } = render( icon );

			rerender( <Button>{ icon }</Button> );

			expect( screen.getByRole( 'button' ) ).toContainElement( container.firstChild );
		} );
	} );

	describe( 'with href prop', () => {
		test( 'renders as a link', () => {
			render( <Button href="https://wordpress.com/" /> );

			expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', 'https://wordpress.com/' );
		} );

		test( 'ignores type prop and renders a link without type attribute', () => {
			render( <Button href="https://wordpress.com/" type="submit" /> );

			expect( screen.getByRole( 'link' ) ).not.toHaveAttribute( 'type' );
		} );

		test( 'including target and rel props renders a link with target and rel attributes', () => {
			render( <Button href="https://wordpress.com/" target="_blank" rel="noopener noreferrer" /> );

			const button = screen.getByRole( 'link' );

			expect( button ).toHaveAttribute( 'target', '_blank' );
			expect( button ).toHaveAttribute( 'rel', expect.stringMatching( /\bnoopener\b/ ) );
			expect( button ).toHaveAttribute( 'rel', expect.stringMatching( /\bnoreferrer\b/ ) );
		} );

		test( 'adds noopener noreferrer rel if target is specified', () => {
			render( <Button href="https://wordpress.com/" target="_blank" /> );

			const button = screen.getByRole( 'link' );

			expect( button ).toHaveAttribute( 'target', '_blank' );
			expect( button ).toHaveAttribute( 'rel', expect.stringMatching( /\bnoopener\b/ ) );
			expect( button ).toHaveAttribute( 'rel', expect.stringMatching( /\bnoreferrer\b/ ) );
		} );
	} );

	describe( 'without href prop', () => {
		test( 'renders as a button', () => {
			render( <Button target="_blank" rel="noopener noreferrer" /> );

			expect( screen.getByRole( 'button' ) ).not.toHaveAttribute( 'href' );
		} );

		test( 'renders button with type attribute set to "button" by default', () => {
			render( <Button target="_blank" rel="noopener noreferrer" /> );

			expect( screen.getByRole( 'button' ) ).toHaveAttribute( 'type', 'button' );
		} );

		test( 'renders button with type attribute set to type prop if specified', () => {
			const typeProp = 'submit';

			render( <Button target="_blank" rel="noopener noreferrer" type={ typeProp } /> );

			expect( screen.getByRole( 'button' ) ).toHaveAttribute( 'type', typeProp );
		} );

		test( 'renders button without rel and target attributes', () => {
			render( <Button target="_blank" rel="noopener noreferrer" /> );

			const button = screen.getByRole( 'button' );

			expect( button ).not.toHaveAttribute( 'target' );
			expect( button ).not.toHaveAttribute( 'rel' );
		} );
	} );
} );
