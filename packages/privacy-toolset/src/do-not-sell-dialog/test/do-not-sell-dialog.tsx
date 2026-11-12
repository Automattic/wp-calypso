/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import Modal from 'react-modal';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
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
	let modalRoot: HTMLDivElement | null = null;

	beforeEach( () => {
		modalRoot = document.createElement( 'div' );
		modalRoot.setAttribute( 'id', 'modal-root' );
		document.body.appendChild( modalRoot );
		Modal.setAppElement( modalRoot );
	} );

	afterEach( () => {
		if ( null !== modalRoot ) {
			document.body.removeChild( modalRoot );
			modalRoot = null;
		}
	} );

	test( 'renders correctly', () => {
		const { baseElement, getByText } = render(
			<DoNotSellDialog
				content={ genericContent }
				onToggleActive={ vi.fn() }
				onClose={ vi.fn() }
				isOpen
			/>
		);

		expect( getByText( 'title' ) ).toBeInTheDocument();
		expect( getByText( 'paragraph 1' ) ).toBeInTheDocument();
		expect( getByText( 'paragraph 2' ) ).toBeInTheDocument();
		expect( getByText( 'paragraph 3' ) ).toBeInTheDocument();
		expect( getByText( 'toggleLabel' ) ).toBeInTheDocument();
		expect( getByText( 'closeButton' ) ).toBeInTheDocument();
		expect( baseElement ).toMatchSnapshot();
	} );
	test( 'fires onClose() on text button click', () => {
		const onClose = vi.fn();
		const { getByText } = render(
			<DoNotSellDialog
				content={ genericContent }
				onToggleActive={ vi.fn() }
				onClose={ onClose }
				isOpen
			/>
		);

		fireEvent.click( getByText( 'closeButton' ) );
		expect( onClose ).toHaveBeenCalled();
	} );
	test( 'fires onClose() on "x" button click', () => {
		const onClose = vi.fn();
		const { baseElement: container } = render(
			<DoNotSellDialog
				content={ genericContent }
				onToggleActive={ vi.fn() }
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
		const onToggleActive = vi.fn();
		const { getByText } = render(
			<DoNotSellDialog
				content={ genericContent }
				isActive={ false }
				onToggleActive={ onToggleActive }
				onClose={ vi.fn() }
				isOpen
			/>
		);

		fireEvent.click( getByText( 'toggleLabel' ) );
		expect( onToggleActive ).toHaveBeenCalledWith( true );
	} );
	test( 'fires onToggleActive(false) on toggle click when isActive=true', () => {
		const onToggleActive = vi.fn();
		const { getByText } = render(
			<DoNotSellDialog
				content={ genericContent }
				isActive
				onToggleActive={ onToggleActive }
				onClose={ vi.fn() }
				isOpen
			/>
		);

		fireEvent.click( getByText( 'toggleLabel' ) );
		expect( onToggleActive ).toHaveBeenCalledWith( false );
	} );
} );
