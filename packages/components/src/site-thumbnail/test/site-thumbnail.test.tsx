/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SiteThumbnail } from '..';
import { fetchAwaitRedirect } from '../fetch-await-redirect';

const MSHOTS_URL = 'https://fakeUrl';
const IMG_ALT = 'test image';

vi.mock( '../fetch-await-redirect' );

describe( 'SiteThumbnail', () => {
	beforeEach( () => {
		vi.useFakeTimers();
		vi.useFakeTimers();
		// Mocking the fetch function to return response.redirect = false by default
		// and to return response.redirect = true when the url is the same as the mshots url
		// This is to simulate the mshots image being loaded
		fetchAwaitRedirect.mockImplementation( async () => {
			return {
				isError: false,
				isRedirect: false,
			};
		} );
	} );
	test( 'has an image that points to mshot', async () => {
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } /> );
		await waitFor( () => {
			expect( screen.queryByAltText( IMG_ALT ) ).not.toBeNull();
			expect( screen.getByAltText( IMG_ALT ).getAttribute( 'src' ) ).toMatch(
				'https://s0.wp.com/mshots/v1/' + encodeURIComponent( MSHOTS_URL )
			);
		} );
	} );

	test( 'shows fallback when mshot returns 429', async () => {
		fetchAwaitRedirect.mockImplementation( async () => {
			return {
				isError: true,
				isRedirect: false,
			};
		} );
		render( <SiteThumbnail mShotsUrl={ MSHOTS_URL } alt={ IMG_ALT } /> );
		await waitFor( () => expect( screen.queryByAltText( IMG_ALT ) ).toBeNull() );
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
