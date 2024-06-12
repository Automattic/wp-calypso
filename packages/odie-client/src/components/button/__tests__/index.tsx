/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import Button from './../index';

describe( 'Button', () => {
	it( 'renders the button', () => {
		const { getByRole } = render( <Button>Click me</Button> );
		const button = getByRole( 'button' );
		expect( button ).toBeInTheDocument();
	} );

	it( 'handles click events', () => {
		const handleClick = jest.fn();
		const { getByRole } = render( <Button onClick={ handleClick }>Click me</Button> );
		const button = getByRole( 'button' );
		fireEvent.click( button );
		expect( handleClick ).toHaveBeenCalled();
	} );

	it( 'applies the compact class when the compact prop is true', () => {
		const { getByRole } = render( <Button compact>Click me</Button> );
		const button = getByRole( 'button' );
		expect( button ).toHaveClass( 'odie-button-compact' );
	} );

	it( 'applies the borderless class when the borderless prop is true', () => {
		const { getByRole } = render( <Button borderless>Click me</Button> );
		const button = getByRole( 'button' );
		expect( button ).toHaveClass( 'odie-button-borderless' );
	} );
} );
