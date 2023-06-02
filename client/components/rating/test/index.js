/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import Rating from 'calypso/components/rating';

describe( '<Rating />', () => {
	describe( 'check props size', () => {
		test( 'should be set to 18px if no size', () => {
			const { container } = render( <Rating /> );

			const component = container.getElementsByClassName( 'rating' )[ 0 ];
			expect( component ).toHaveStyle( { width: '90px' } ); // 18 * 5 = 120;
		} );

		test( 'should use size if passed', () => {
			const size = 48;
			const { container } = render( <Rating size={ size } /> );

			const component = container.getElementsByClassName( 'rating' )[ 0 ];
			expect( component.style.width ).toEqual( size * 5 + 'px' );
		} );

		test( 'should use size in each star', () => {
			const rating = 30;
			const size = 48;
			const { container } = render( <Rating rating={ rating } size={ size } /> );
			const icons = container.getElementsByTagName( 'svg' );

			for ( const icon of icons ) {
				expect( icon.style.width ).toEqual( size + 'px' );
			}
		} );
	} );

	describe( 'check props rating', () => {
		test( 'should render full width mask for no rating', () => {
			const size = 24;
			const { container } = render( <Rating size={ size } /> );

			const component = container.getElementsByClassName( 'rating__overlay' )[ 0 ];
			expect( component.style.clipPath ).toEqual( 'inset(0 ' + size * 5 + 'px 0 0 )' );
			expect( component.style.clip ).toEqual( 'rect(0px, 0px, ' + size + 'px, 0px)' );
		} );

		test( 'should render rating clipping mask properly', () => {
			[ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ].forEach( function ( ratingValue ) {
				const size = 24;
				const { container } = render( <Rating rating={ ratingValue } size={ size } /> );

				const roundRating = Math.round( ratingValue / 10 ) * 10;
				const ratingWidth = size * 5;
				const maskPosition = ( roundRating / 100 ) * ratingWidth;
				const clipPathMaskPosition = ratingWidth - ( roundRating / 100 ) * ratingWidth;
				const component = container.getElementsByClassName( 'rating__overlay' )[ 0 ];
				expect( component.style.clipPath ).toEqual(
					'inset(0 ' + clipPathMaskPosition + 'px 0 0 )'
				);
				expect( component.style.clip ).toEqual(
					'rect(0px, ' + maskPosition + 'px, ' + size + 'px, 0px)'
				);
			} );
		} );
	} );
} );
