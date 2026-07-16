/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import MiddleTruncate from '../index';

describe( 'MiddleTruncate', () => {
	test( 'pins the registrable domain and keeps the subdomain as the head', () => {
		render( <MiddleTruncate text="myverylongdomain.example.com" /> );

		expect( screen.getByText( 'myverylongdomain' ) ).toBeVisible();
		expect( screen.getByText( '.example.com' ) ).toBeVisible();
	} );

	test( 'keeps a multi-level public suffix whole', () => {
		render( <MiddleTruncate text="my.shop.domain.co.jp" /> );

		expect( screen.getByText( 'my.shop' ) ).toBeVisible();
		expect( screen.getByText( '.domain.co.jp' ) ).toBeVisible();
	} );

	test( 'pins only the public suffix for a bare registrable domain', () => {
		render( <MiddleTruncate text="myverylongstore.com" /> );

		expect( screen.getByText( 'myverylongstore' ) ).toBeVisible();
		expect( screen.getByText( '.com' ) ).toBeVisible();
	} );

	test( 'leaves a short domain intact', () => {
		render( <MiddleTruncate text="x.com" /> );

		expect( screen.getByText( 'x' ) ).toBeVisible();
		expect( screen.getByText( '.com' ) ).toBeVisible();
	} );

	test( 'pins the domain of an email from the @ sign', () => {
		render( <MiddleTruncate text="myverylongemail@example.com" /> );

		expect( screen.getByText( 'myverylongemail' ) ).toBeVisible();
		expect( screen.getByText( '@example.com' ) ).toBeVisible();
	} );

	test( 'exposes the full text via a title tooltip', () => {
		const { container } = render( <MiddleTruncate text="my.shop.domain.co.jp" /> );

		expect( container.querySelector( '.dashboard-middle-truncate' ) ).toHaveAttribute(
			'title',
			'my.shop.domain.co.jp'
		);
	} );

	test( 'reads the text from children so it can be used in interpolation mappings', () => {
		render( <MiddleTruncate>another-domain.blog</MiddleTruncate> );

		expect( screen.getByText( 'another-domain' ) ).toBeVisible();
		expect( screen.getByText( '.blog' ) ).toBeVisible();
	} );

	test( 'renders text with no natural boundary as-is, with no tail', () => {
		const { container } = render( <MiddleTruncate text="localhost" /> );

		expect( screen.getByText( 'localhost' ) ).toBeVisible();
		expect( container.querySelector( '.dashboard-middle-truncate__tail' ) ).toBeNull();
	} );

	test( 'forwards a custom className onto the wrapper', () => {
		const { container } = render( <MiddleTruncate text="example.com" className="custom-class" /> );

		expect( container.querySelector( '.dashboard-middle-truncate' ) ).toHaveClass( 'custom-class' );
	} );
} );
