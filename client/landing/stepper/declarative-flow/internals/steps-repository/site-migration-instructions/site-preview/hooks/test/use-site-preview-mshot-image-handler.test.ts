/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useRef } from 'react';
import { useSitePreviewMShotImageHandler } from '../use-site-preview-mshot-image-handler';

jest.mock( 'react', () => {
	const actualReact = jest.requireActual( 'react' );
	return {
		...actualReact,
		useRef: jest.fn(),
	};
} );

describe( 'useSitePreviewMShotImageHandler', () => {
	let mockRef: { current: HTMLDivElement | null };
	const mockElement = document.createElement( 'div' );

	beforeEach( () => {
		mockRef = { current: mockElement };
		( useRef as jest.Mock ).mockReturnValue( mockRef );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
	} );

	beforeAll( () => {
		nock.disableNetConnect();
	} );

	it( 'should return the correct segment based on width', () => {
		const { result } = renderHook( () => useSitePreviewMShotImageHandler() );

		expect( result.current.getSegment( 1200 ) ).toBe( 'desktop' );
		expect( result.current.getSegment( 800 ) ).toBe( 'tablet' );
		expect( result.current.getSegment( 500 ) ).toBe( 'mobile' );
	} );

	it.each( [
		[
			1200,
			'desktop',
			{
				vpw: 1600,
				vph: 1600,
				w: 1600,
				h: 1624,
				screen_height: 1600,
				scale: 2,
			},
		],
		[
			800,
			'tablet',
			{
				vpw: 767,
				vph: 1600,
				w: 767,
				h: 1600,
				screen_height: 1600,
				scale: 2,
			},
		],
		[
			500,
			'mobile',
			{
				vpw: 479,
				vph: 1200,
				w: 479,
				h: 1200,
				screen_height: 1200,
				scale: 2,
			},
		],
	] )(
		'should return correct value for segment for width: %d ( %p )',
		async ( width, segment, mShotProps ) => {
			const { result } = renderHook( () => useSitePreviewMShotImageHandler() );

			act( () => {
				Object.defineProperty( result.current.previewRef, 'current', {
					value: { offsetWidth: width },
				} );
			} );

			act( () => {
				window.dispatchEvent( new Event( 'resize' ) );
			} );

			await waitFor( () => {
				expect( result.current.currentSegment ).toEqual( segment );
				expect( result.current.mShotsOption ).toEqual( mShotProps );
			} );
		}
	);

	it( 'should update mShotsOption after resize', async () => {
		const { result } = renderHook( () => useSitePreviewMShotImageHandler() );

		Object.defineProperty( result.current.previewRef, 'current', {
			value: { offsetWidth: 900 },
		} );

		act( () => {
			window.dispatchEvent( new Event( 'resize' ) );
		} );

		await waitFor( () => {
			expect( result.current.currentSegment ).toEqual( 'tablet' );
		} );
	} );

	it( 'should call the mShot endpoint for each config during createScreenshots', async () => {
		const { result } = renderHook( () => useSitePreviewMShotImageHandler() );
		const url = 'http://example.com';

		const expectedUrls = [
			'/mshots/v1/http%3A%2F%2Fexample.com?vpw=1600&vph=1600&w=1600&h=1624&screen_height=1600&scale=2',
			'/mshots/v1/http%3A%2F%2Fexample.com?vpw=767&vph=1600&w=767&h=1600&screen_height=1600&scale=2',
			'/mshots/v1/http%3A%2F%2Fexample.com?vpw=479&vph=1200&w=479&h=1200&screen_height=1200&scale=2',
		];

		const scopes = expectedUrls.map( ( expectedUrl ) =>
			nock( 'https://s0.wp.com' ).get( expectedUrl ).reply( 200, {} )
		);

		act( () => {
			result.current.createScreenshots( url );
		} );

		await waitFor( () => {
			scopes.forEach( ( scope ) => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );

	it( 'should call the mShot endpoint for each config during mount if URL is provided', async () => {
		const url = 'http://example.com';

		const expectedUrls = [
			'/mshots/v1/http%3A%2F%2Fexample.com?vpw=1600&vph=1600&w=1600&h=1624&screen_height=1600&scale=2',
			'/mshots/v1/http%3A%2F%2Fexample.com?vpw=767&vph=1600&w=767&h=1600&screen_height=1600&scale=2',
			'/mshots/v1/http%3A%2F%2Fexample.com?vpw=479&vph=1200&w=479&h=1200&screen_height=1200&scale=2',
		];

		const scopes = expectedUrls.map( ( expectedUrl ) =>
			nock( 'https://s0.wp.com' ).get( expectedUrl ).reply( 200, {} )
		);

		renderHook( () => useSitePreviewMShotImageHandler( url ) );

		await waitFor( () => {
			scopes.forEach( ( scope ) => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );
} );
