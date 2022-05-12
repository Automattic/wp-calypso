/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { HiddenInput } from '../hidden-input';

describe( 'HiddenInput', () => {
	let originalScroll;
	const noop = () => {};
	const defaultProps = {
		text: 'Love cannot be hidden.',
		label: 'Your name',
	};

	beforeAll( () => {
		originalScroll = window.scroll;
		window.scroll = noop;
	} );

	afterAll( () => {
		window.scroll = originalScroll;
	} );

	test( 'it should return expected elements with defaultProps and no props value', () => {
		render( <HiddenInput { ...defaultProps } /> );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).toBeVisible();
		expect( screen.queryByPlaceholderText( 'Your name' ) ).not.toBeInTheDocument();
	} );

	test( 'it should hide toggle link and render a full input field when the field value is not empty', () => {
		const fieldValue = 'Not empty';
		render( <HiddenInput { ...defaultProps } value={ fieldValue } /> );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).not.toBeInTheDocument();
		expect( screen.queryByPlaceholderText( 'Your name' ) ).toHaveValue( fieldValue );
	} );

	test( 'it should toggle input field when the toggle link is clicked', () => {
		const { container } = render( <HiddenInput { ...defaultProps } /> );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).toBeVisible();
		fireEvent.click( container.getElementsByTagName( 'a' )[ 0 ] );
		expect( screen.queryByText( 'Love cannot be hidden.' ) ).not.toBeInTheDocument();
		expect( screen.queryByPlaceholderText( 'Your name' ) ).toBeVisible();
	} );
} );
