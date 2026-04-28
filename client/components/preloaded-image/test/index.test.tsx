/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import { ComponentProps } from 'react';
import PreloadedImage from '../index';

describe( 'PreloadedImage', () => {
	const defaultProps: ComponentProps< typeof PreloadedImage > = {
		src: 'https://example.com/image.jpg',
		alt: 'Test image',
		width: 200,
		height: 100,
	};

	function getImage(): HTMLImageElement {
		return document.querySelector( 'img' ) as HTMLImageElement;
	}

	function getWrapper(): HTMLElement {
		return document.querySelector( '.preloaded-image-wrapper' ) as HTMLElement;
	}

	test( 'wraps image in a div with preloaded-image-wrapper class', () => {
		render( <PreloadedImage { ...defaultProps } /> );

		expect( getWrapper() ).toBeVisible();
		expect( getImage().parentElement ).toBe( getWrapper() );
	} );

	test( 'renders an img element with correct attributes', () => {
		render( <PreloadedImage { ...defaultProps } /> );

		const img = getImage();
		expect( img ).toBeVisible();
		expect( img ).toHaveAttribute( 'src', 'https://example.com/image.jpg' );
		expect( img ).toHaveAttribute( 'width', '200' );
		expect( img ).toHaveAttribute( 'height', '100' );
	} );

	test( 'does not have is-loaded class before image loads', () => {
		render( <PreloadedImage { ...defaultProps } /> );

		expect( getImage() ).not.toHaveClass( 'is-loaded' );
	} );

	test( 'sets alt text immediately', () => {
		render( <PreloadedImage { ...defaultProps } /> );

		expect( getImage() ).toHaveAttribute( 'alt', 'Test image' );
	} );

	test( 'adds is-loaded class after image loads', () => {
		render( <PreloadedImage { ...defaultProps } /> );

		fireEvent.load( getImage() );

		expect( getImage() ).toHaveClass( 'is-loaded' );
	} );

	test( 'applies custom className to the img element', () => {
		render( <PreloadedImage { ...defaultProps } className="custom-class" /> );

		expect( getImage() ).toHaveClass( 'custom-class' );
	} );

	test( 'applies imgStyles to the img element', () => {
		render(
			<PreloadedImage { ...defaultProps } imgStyles={ { borderRadius: '8px', opacity: 0.5 } } />
		);

		expect( getImage() ).toHaveStyle( { borderRadius: '8px', opacity: 0.5 } );
	} );

	test( 'passes borderRadius from imgStyles to wrapper div', () => {
		render( <PreloadedImage { ...defaultProps } imgStyles={ { borderRadius: '12px' } } /> );

		expect( getWrapper() ).toHaveStyle( { borderRadius: '12px' } );
	} );

	test( 'wrapper has no borderRadius when imgStyles is not provided', () => {
		render( <PreloadedImage { ...defaultProps } /> );

		expect( getWrapper() ).not.toHaveStyle( { borderRadius: '12px' } );
	} );

	describe( 'fallbackIcon', () => {
		const fallback = <span data-testid="fallback-icon">Icon</span>;

		test( 'does not render fallback when image loads successfully', () => {
			const { queryByTestId } = render(
				<PreloadedImage { ...defaultProps } fallbackIcon={ fallback } />
			);

			fireEvent.load( getImage() );

			expect( queryByTestId( 'fallback-icon' ) ).not.toBeInTheDocument();
		} );

		test( 'renders fallback image URL when the image fails to load', () => {
			render(
				<PreloadedImage { ...defaultProps } fallbackIcon="https://example.com/fallback.png" />
			);

			fireEvent.error( getImage() );

			expect( getImage() ).toHaveAttribute( 'src', 'https://example.com/fallback.png' );
		} );

		test( 'renders fallback JSX element when the image fails to load', () => {
			const { getByTestId } = render(
				<PreloadedImage { ...defaultProps } fallbackIcon={ fallback } />
			);

			fireEvent.error( getImage() );

			expect( getByTestId( 'fallback-icon' ) ).toBeVisible();
			expect( document.querySelector( 'img' ) ).not.toBeInTheDocument();
		} );

		test( 'keeps showing original image on error when no fallbackIcon is provided', () => {
			const { queryByTestId } = render( <PreloadedImage { ...defaultProps } /> );

			fireEvent.error( getImage() );

			expect( getImage() ).toBeInTheDocument();
			expect( queryByTestId( 'fallback-icon' ) ).not.toBeInTheDocument();
		} );
	} );
} );
