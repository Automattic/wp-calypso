/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatImage } from '../chat-image';
import CustomALink from '../custom-a-link';

const IMAGE = { src: 'https://example.com/shot.png', alt: 'Storefront' };

// jsdom has `<dialog>` but not its modal API.
beforeAll( () => {
	HTMLDialogElement.prototype.showModal = function ( this: HTMLDialogElement ) {
		this.open = true;
	};

	HTMLDialogElement.prototype.close = function ( this: HTMLDialogElement ) {
		this.open = false;
		this.dispatchEvent( new Event( 'close' ) );
	};
} );

afterAll( () => {
	delete ( HTMLDialogElement.prototype as Partial< HTMLDialogElement > ).showModal;
	delete ( HTMLDialogElement.prototype as Partial< HTMLDialogElement > ).close;
} );

function openLightbox() {
	render( <ChatImage { ...IMAGE } /> );

	fireEvent.click( screen.getByRole( 'img', { name: IMAGE.alt } ) );

	return screen.getByRole( 'dialog', { name: IMAGE.alt } );
}

describe( 'ChatImage', () => {
	it( 'opens the full-size image in a dialog on click', () => {
		const dialog = openLightbox();

		expect( within( dialog ).getByRole( 'img', { name: IMAGE.alt } ) ).toHaveAttribute(
			'src',
			IMAGE.src
		);
	} );

	it( 'closes the lightbox on Escape without letting the chat close too', () => {
		const dialog = openLightbox();

		const isEscapeHandled = ! fireEvent.keyDown( dialog, { key: 'Escape' } );

		expect( isEscapeHandled ).toBe( true );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[ 'the backdrop', ( dialog: HTMLElement ) => dialog ],
		[ 'the image', ( dialog: HTMLElement ) => within( dialog ).getByRole( 'img' ) ],
		[
			'the close button',
			( dialog: HTMLElement ) => within( dialog ).getByRole( 'button', { name: 'Close' } ),
		],
	] )( 'closes the lightbox on a click on %s', ( _, getTarget ) => {
		const dialog = openLightbox();

		fireEvent.click( getTarget( dialog ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'leaves the click to the link when the image is inside one', () => {
		render(
			<MemoryRouter>
				<CustomALink href="https://example.com/store">
					<ChatImage { ...IMAGE } />
				</CustomALink>
			</MemoryRouter>
		);

		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link' ) ).toContainElement(
			screen.getByRole( 'img', { name: IMAGE.alt } )
		);
	} );
} );
