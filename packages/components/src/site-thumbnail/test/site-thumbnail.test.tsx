/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { SiteThumbnail } from '..';

const MSHOTS_URL = 'https://fakeUrl';
const IMG_ALT = 'test image';

describe( 'SiteThumbnail', () => {
	test( 'has an image that points to mshot', () => {
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } /> );
		expect( screen.getByAltText( IMG_ALT ).getAttribute( 'src' ) ).toMatch(
			'https://s0.wp.com/mshots/v1/' + encodeURIComponent( MSHOTS_URL )
		);
	} );

	test( 'should show the dimension width for the default sizes', () => {
		const dimension = {
			width: 100,
			height: 100,
		};
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } { ...dimension } /> );
		expect( screen.getByAltText( IMG_ALT ).getAttribute( 'sizes' ) ).toEqual(
			`${ dimension.width }px`
		);
	} );

	test( 'should use the sizesAttr prop as sizes attr', () => {
		const sizesAttr = '(max-width: 400px) 100vw, 400px';
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } sizesAttr={ sizesAttr } /> );
		expect( screen.getByAltText( IMG_ALT ).getAttribute( 'sizes' ) ).toEqual( sizesAttr );
	} );

	// eslint-disable-next-line jest/no-disabled-tests
	test.skip( 'should generate responsive size alternatives 2x and 3x srcset', () => {
		const dimension = { width: 200, height: 100 };
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } { ...dimension } /> );
		const srcset = screen.getByAltText( IMG_ALT ).getAttribute( 'srcset' );
		expect( srcset ).toMatch( ` ${ dimension.width * 2 }w` );
		expect( srcset ).toMatch( ` ${ dimension.width * 3 }w` );
	} );

	// eslint-disable-next-line jest/no-disabled-tests
	test.skip( 'should add dimensionsSrcSet array prop to srcset string attribute', () => {
		const alternativeDimensions = [
			{
				width: 777,
				height: 777,
			},
			{
				width: 888,
				height: 888,
			},
		];
		render(
			<SiteThumbnail
				mShotsUrl={ MSHOTS_URL }
				alt={ IMG_ALT }
				dimensionsSrcset={ alternativeDimensions }
			/>
		);
		const srcset = screen.getByAltText( IMG_ALT ).getAttribute( 'srcset' );
		alternativeDimensions.forEach( ( dimension ) => {
			expect( srcset ).toMatch( ` ${ dimension.width }w` );
		} );
	} );
} );
