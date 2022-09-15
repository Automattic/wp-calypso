/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { SiteThumbnail } from '..';

const MSHOTS_URL = 'https://fakeUrl';
const IMG_ALT = 'test image';

// Mocking the fetch function to return response.redirect = false by default
// and to return response.redirect = true when the url is the same as the mshots url
// This is to simulate the mshots image being loaded
jest.mock( '../fetch-is-redirect', () => ( {
	fetchIsRedirect: async () => {
		return false;
	},
} ) );

describe( 'SiteThumbnail', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.useFakeTimers();
	} );
	test( 'has an image that points to mshot', async () => {
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } /> );
		await waitFor( () =>
			expect( screen.getByAltText( IMG_ALT ).getAttribute( 'src' ) ).toMatch(
				'https://s0.wp.com/mshots/v1/' + encodeURIComponent( MSHOTS_URL )
			)
		);
	} );

	test( 'should show the dimension width for the default sizes', async () => {
		const dimension = {
			width: 100,
			height: 100,
		};
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } { ...dimension } /> );
		await waitFor( () =>
			expect( screen.getByAltText( IMG_ALT ).getAttribute( 'sizes' ) ).toEqual(
				`${ dimension.width }px`
			)
		);
	} );

	test( 'should use the sizesAttr prop as sizes attr', async () => {
		const sizesAttr = '(max-width: 400px) 100vw, 400px';
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } sizesAttr={ sizesAttr } /> );
		await waitFor( () =>
			expect( screen.getByAltText( IMG_ALT ).getAttribute( 'sizes' ) ).toEqual( sizesAttr )
		);
	} );

	// eslint-disable-next-line jest/no-disabled-tests
	test.skip( 'should generate responsive size alternatives 2x and 3x srcset', async () => {
		const dimension = { width: 200, height: 100 };
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } { ...dimension } /> );
		await waitFor( () => {
			const srcset = screen.getByAltText( IMG_ALT ).getAttribute( 'srcset' );
			expect( srcset ).toMatch( ` ${ dimension.width * 2 }w` );
			expect( srcset ).toMatch( ` ${ dimension.width * 3 }w` );
		} );
	} );

	// eslint-disable-next-line jest/no-disabled-tests
	test.skip( 'should add dimensionsSrcSet array prop to srcset string attribute', async () => {
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
		await waitFor( () => {
			const srcset = screen.getByAltText( IMG_ALT ).getAttribute( 'srcset' );
			alternativeDimensions.forEach( ( dimension ) => {
				expect( srcset ).toMatch( ` ${ dimension.width }w` );
			} );
		} );
	} );

	test( 'empty URL will show no image cause an error', async () => {
		const { rerender } = render( <SiteThumbnail mShotsUrl="" alt={ IMG_ALT } /> );
		expect( screen.queryByAltText( IMG_ALT ) ).toBeNull();

		rerender( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } /> );
		await waitFor( () => {
			expect( screen.queryByAltText( IMG_ALT ) ).not.toBeNull();
		} );

		rerender( <SiteThumbnail mShotsUrl="" alt={ IMG_ALT } /> );
		expect( screen.queryByAltText( IMG_ALT ) ).toBeNull();
	} );
} );
