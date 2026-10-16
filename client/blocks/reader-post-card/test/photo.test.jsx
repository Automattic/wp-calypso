/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostPhoto from '../photo';

// jsdom cannot navigate, so keep link clicks from logging "Not implemented" errors.
const preventNavigation = ( event ) => event.preventDefault();

describe( 'PostPhoto', () => {
	let measuredCardWidth = 560;

	beforeAll( () => {
		document.addEventListener( 'click', preventNavigation );
	} );

	afterAll( () => {
		document.removeEventListener( 'click', preventNavigation );
	} );

	beforeEach( () => {
		measuredCardWidth = 560;
		Object.defineProperty( window, 'innerHeight', { configurable: true, value: 900 } );
		jest.spyOn( Element.prototype, 'getClientRects' ).mockImplementation( () => [
			{
				width: measuredCardWidth,
				height: 300,
				top: 0,
				left: 0,
				right: measuredCardWidth,
				bottom: 300,
			},
		] );
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

	it( 'contains a small photo and navigates instead of expanding it', async () => {
		const user = userEvent.setup();
		const expandCard = jest.fn();
		renderPhoto( { width: 480, height: 360, expandCard } );

		const photo = getPhoto();
		expect( photo ).toHaveStyle( { backgroundSize: 'contain' } );
		expect( photo ).not.toHaveClass( 'is-zoomable' );

		await user.click( photo );
		expect( expandCard ).not.toHaveBeenCalled();
	} );

	it( 'covers a large photo and expands it on click', async () => {
		const user = userEvent.setup();
		const expandCard = jest.fn();
		renderPhoto( { width: 1600, height: 1200, expandCard } );

		const photo = getPhoto();
		expect( photo ).toHaveStyle( { backgroundSize: 'cover' } );
		expect( photo ).toHaveClass( 'is-zoomable' );

		await user.click( photo );
		expect( expandCard ).toHaveBeenCalled();
	} );

	it( 'keeps an expanded large photo within the card and its natural width', () => {
		renderPhoto( { width: 1600, height: 1200, isExpanded: true } );

		const photo = getPhoto();
		const width = parseFloat( photo.style.width );
		expect( width ).toBeGreaterThan( 0 );
		expect( width ).toBeLessThanOrEqual( measuredCardWidth );
		expect( width ).toBeLessThanOrEqual( 1600 );
		expect( photo ).toHaveStyle( { backgroundSize: 'contain' } );
	} );

	it( 'does not use an 800px width before the card is measured', () => {
		measuredCardWidth = 0;
		renderPhoto( { width: 1600, height: 1200, isExpanded: true } );

		const photo = getPhoto();
		expect( photo.style.width ).not.toBe( '800px' );
		expect( photo.parentElement.style.width ).not.toBe( '800px' );
	} );

	it( 'does not write NaN sizes when canonical media dimensions are missing or zero', () => {
		const cases = [
			{ src: 'https://example.com/photo.jpg' },
			{ src: 'https://example.com/photo.jpg', width: 0, height: 0 },
		];

		cases.forEach( ( canonicalMedia ) => {
			const { unmount } = renderPhoto( { canonicalMedia, isExpanded: true } );
			const photo = getPhoto();

			expect( photo.style.width ).not.toContain( 'NaN' );
			expect( photo.style.height ).not.toContain( 'NaN' );
			expect( photo.parentElement.style.width ).not.toContain( 'NaN' );
			expect( photo.parentElement.style.height ).not.toContain( 'NaN' );
			unmount();
		} );
	} );
} );
