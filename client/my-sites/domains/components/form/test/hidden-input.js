/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { HiddenInput } from '../hidden-input';

describe( 'HiddenInput', () => {
	const defaultProps = {
		text: 'Love cannot be hidden.',
		label: 'Your name',
	};
	window.scroll = jest.fn();

	test( 'it should return expected elements with defaultProps and no props value', () => {
		render( <HiddenInput { ...defaultProps } /> );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).toBeVisible();
		expect( screen.queryByPlaceholderText( 'Your name' ) ).not.toBeInTheDocument();
	} );

	test( 'it should hide toggle link and render a full input field when the field value is not empty', () => {
		const fieldValue = 'Not empty';
		render( <HiddenInput { ...defaultProps } value={ fieldValue } /> );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).not.toBeInTheDocument();
		expect( screen.queryByPlaceholderText( 'Your name' ).getAttribute( 'value' ) ).toEqual(
			fieldValue
		);
	} );

	test( 'it should toggle input field when the toggle link is clicked', () => {
		const { container } = render( <HiddenInput { ...defaultProps } /> );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).toBeVisible();
		fireEvent.click( container.getElementsByTagName( 'a' )[ 0 ] );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).not.toBeInTheDocument();
		expect( screen.queryByPlaceholderText( 'Your name' ) ).toBeVisible();
	} );
} );
