/**
 * @jest-environment jsdom
 */
import { render, fireEvent, getByText } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DoNotSellDialog } from '..';

const genericContent = {
	title: 'title',
	longDescription: (
		<>
			<p>paragraph 1</p>
			<p>paragraph 2</p>
			<p>paragraph 3</p>
		</>
	),
	toggleLabel: 'toggleLabel',
	closeButton: 'closeButton',
};

describe( 'DoNotSellDialog', () => {
	test( 'renders correctly', () => {
		const { container } = render(
			<DoNotSellDialog
				content={ genericContent }
				onToggleActive={ jest.fn() }
				onClose={ jest.fn() }
				isOpen
			/>
		);

		expect( getByText( container, 'title' ) ).toBeInTheDocument();
		expect( getByText( container, 'paragraph 1' ) ).toBeInTheDocument();
		expect( getByText( container, 'paragraph 2' ) ).toBeInTheDocument();
		expect( getByText( container, 'paragraph 3' ) ).toBeInTheDocument();
		expect( getByText( container, 'toggleLabel' ) ).toBeInTheDocument();
		expect( getByText( container, 'closeButton' ) ).toBeInTheDocument();
		expect( container ).toMatchSnapshot();
	} );
	test( 'fires onClose() on text button click', () => {
		const onClose = jest.fn();
		const { container } = render(
			<DoNotSellDialog
				content={ genericContent }
				onToggleActive={ jest.fn() }
				onClose={ onClose }
				isOpen
			/>
		);
		fireEvent.click( getByText( container, 'closeButton' ) );
		expect( onClose ).toHaveBeenCalled();
	} );
	test( 'fires onClose() on "x" button click', () => {
		const onClose = jest.fn();
		const { container } = render(
			<DoNotSellDialog
				content={ genericContent }
				onToggleActive={ jest.fn() }
				onClose={ onClose }
				isOpen
			/>
		);
		const closeButton = container.querySelector( '.do-not-sell__close-button' );
		expect( closeButton ).not.toBeNull();

		fireEvent.click( closeButton! );
		expect( onClose ).toHaveBeenCalled();
	} );
	test( 'fires onToggleActive(true) on toggle click when isActive=false', () => {
		const onToggleActive = jest.fn();
		const { container } = render(
			<DoNotSellDialog
				content={ genericContent }
				isActive={ false }
				onToggleActive={ onToggleActive }
				onClose={ jest.fn() }
				isOpen
			/>
		);
		fireEvent.click( getByText( container, 'toggleLabel' ) );
		expect( onToggleActive ).toHaveBeenCalledWith( true );
	} );
	test( 'fires onToggleActive(false) on toggle click when isActive=true', () => {
		const onToggleActive = jest.fn();
		const { container } = render(
			<DoNotSellDialog
				content={ genericContent }
				isActive={ true }
				onToggleActive={ onToggleActive }
				onClose={ jest.fn() }
				isOpen
			/>
		);
		fireEvent.click( getByText( container, 'toggleLabel' ) );
		expect( onToggleActive ).toHaveBeenCalledWith( false );
	} );
} );
