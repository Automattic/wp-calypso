/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostPhoto from '../photo';

// jsdom cannot navigate, so keep link clicks from logging "Not implemented" errors.
const preventNavigation = ( event ) => event.preventDefault();

describe( 'PostPhoto', () => {
	let measuredCardWidth;

	beforeAll( () => {
		document.addEventListener( 'click', preventNavigation );
	} );

	afterAll( () => {
		document.removeEventListener( 'click', preventNavigation );
	} );

	beforeEach( () => {
		measuredCardWidth = 560;
		// Max expanded photo height is 900 - 176 = 724px.
		Object.defineProperty( window, 'innerHeight', { configurable: true, value: 900 } );
		// Only the post container reports the card width, so measuring any other element fails the tests.
		jest.spyOn( Element.prototype, 'getClientRects' ).mockImplementation( function () {
			if ( ! this.classList.contains( 'reader-post-card__post' ) ) {
				return [];
			}

			return [ { width: measuredCardWidth, height: 300, top: 0, left: 0 } ];
		} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	const renderPhoto = ( { width, height, canonicalMedia, ...props } = {} ) =>
		render(
			<PostPhoto
				post={ {
					ID: 1,
					URL: 'https://example.com/post',
					title: 'Photo post',
					canonical_media: canonicalMedia ?? {
						src: 'https://example.com/photo.jpg',
						width,
						height,
					},
				} }
				title="Photo post"
				{ ...props }
			/>
		);

	const getPhoto = () =>
		screen
			.getAllByRole( 'link' )
			.find( ( link ) => link.classList.contains( 'reader-post-card__photo' ) );

	it( 'covers a large photo and expands it on click', async () => {
		const user = userEvent.setup();
		const expandCard = jest.fn();
		const onClick = jest.fn();
		renderPhoto( { width: 1600, height: 1200, expandCard, onClick } );

		const photo = getPhoto();
		expect( photo ).toHaveStyle( { backgroundSize: 'cover' } );
		expect( photo ).toHaveClass( 'is-zoomable' );
		expect( photo.style.width ).toBe( '' );

		await user.click( photo );
		expect( expandCard ).toHaveBeenCalled();
		expect( onClick ).not.toHaveBeenCalled();
	} );

	it( 'shrinks the frame to a small photo instead of upscaling it', () => {
		renderPhoto( { width: 480, height: 360 } );

		const photo = getPhoto();
		expect( photo ).toHaveStyle( { backgroundSize: 'contain', width: '400px', height: '300px' } );
		expect( photo.parentElement ).toHaveStyle( { width: '400px' } );
	} );

	it( 'expands a small photo that is cut down to fit the collapsed frame', async () => {
		const user = userEvent.setup();
		const expandCard = jest.fn();
		renderPhoto( { width: 480, height: 360, expandCard } );

		expect( getPhoto() ).toHaveClass( 'is-zoomable' );

		await user.click( getPhoto() );
		expect( expandCard ).toHaveBeenCalled();
	} );

	it( 'expands a tall photo that is narrower than the card', async () => {
		const user = userEvent.setup();
		const expandCard = jest.fn();
		renderPhoto( { width: 500, height: 1500, expandCard } );

		const photo = getPhoto();
		expect( photo ).toHaveStyle( { backgroundSize: 'contain', width: '100px', height: '300px' } );
		expect( photo ).toHaveClass( 'is-zoomable' );

		await user.click( photo );
		expect( expandCard ).toHaveBeenCalled();
	} );

	it( 'opens the post instead of expanding a photo shown at its natural size', async () => {
		const user = userEvent.setup();
		const expandCard = jest.fn();
		const onClick = jest.fn();
		renderPhoto( { width: 480, height: 240, expandCard, onClick } );

		const photo = getPhoto();
		expect( photo ).toHaveStyle( { width: '480px', height: '240px' } );
		expect( photo ).not.toHaveClass( 'is-zoomable' );

		await user.click( photo );
		expect( expandCard ).not.toHaveBeenCalled();
		expect( onClick ).toHaveBeenCalled();
	} );

	it( 'does not cover a wide photo shorter than the collapsed frame', () => {
		renderPhoto( { width: 2240, height: 200 } );

		const photo = getPhoto();
		expect( photo ).toHaveStyle( { backgroundSize: 'contain', width: '560px', height: '50px' } );
		expect( photo ).not.toHaveClass( 'is-zoomable' );
	} );

	it( 'fits an expanded large photo to the card width', () => {
		renderPhoto( { width: 1600, height: 1200, isExpanded: true } );

		expect( getPhoto() ).toHaveStyle( {
			backgroundSize: 'contain',
			width: '560px',
			height: '420px',
		} );
	} );

	it( 'does not upscale an expanded photo past its natural size', () => {
		renderPhoto( { width: 480, height: 360, isExpanded: true } );

		expect( getPhoto() ).toHaveStyle( { width: '480px', height: '360px' } );
	} );

	it( 'caps an expanded tall photo at the viewport height', () => {
		renderPhoto( { width: 1200, height: 2400, isExpanded: true } );

		const photo = getPhoto();
		expect( parseFloat( photo.style.width ) ).toBeCloseTo( 362 );
		expect( parseFloat( photo.style.height ) ).toBeCloseTo( 724 );
	} );

	it( 'does not size or zoom the photo before the card is measured', () => {
		measuredCardWidth = 0;
		renderPhoto( { width: 1600, height: 1200 } );

		const photo = getPhoto();
		expect( photo.style.width ).toBe( '' );
		expect( photo.parentElement.style.width ).toBe( '' );
		expect( photo ).not.toHaveClass( 'is-zoomable' );
	} );

	it( 'renders when the card has no client rects', () => {
		Element.prototype.getClientRects.mockReturnValue( [] );
		renderPhoto( { width: 1600, height: 1200, isExpanded: true } );

		expect( getPhoto().style.width ).toBe( '' );
	} );

	it( 'does not size the photo when canonical media dimensions are missing or zero', () => {
		const cases = [
			{ src: 'https://example.com/photo.jpg' },
			{ src: 'https://example.com/photo.jpg', width: 0, height: 0 },
		];

		cases.forEach( ( canonicalMedia ) => {
			const { unmount } = renderPhoto( { canonicalMedia, isExpanded: true } );
			const photo = getPhoto();

			expect( photo.style.width ).toBe( '' );
			expect( photo.style.height ).toBe( '' );
			expect( photo.parentElement.style.width ).toBe( '' );
			unmount();
		} );
	} );
} );
