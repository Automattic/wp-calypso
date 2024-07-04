/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useSitePreviewMShotImageHandler } from '../hooks/use-site-preview-mshot-image-handler';

// Mocking fetch globally
global.fetch = jest.fn( () =>
	Promise.resolve( {
		json: () => Promise.resolve( {} ),
	} )
) as jest.Mock;

describe( 'useSitePreviewMShotImageHandler', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return the correct segment based on width', () => {
		const { result } = renderHook( () => useSitePreviewMShotImageHandler() );

		expect( result.current.getSegment( 1200 ) ).toBe( 'desktop' );
		expect( result.current.getSegment( 800 ) ).toBe( 'tablet' );
		expect( result.current.getSegment( 500 ) ).toBe( 'mobile' );
	} );

	it( 'should update dimensions and mShot options correctly', () => {
		const { result } = renderHook( () => useSitePreviewMShotImageHandler() );
		const previewRef = {
			current: {
				offsetWidth: 1300,
			},
		};

		act( () => {
			result.current.updateDimensions( previewRef as React.RefObject< HTMLDivElement > );
		} );

		expect( result.current.mShotsOption ).toEqual( {
			vpw: 1600,
			vph: 1600,
			w: 1600,
			h: 1624,
			screen_height: 1600,
			scale: 2,
		} );
		expect( result.current.currentSegment ).toBe( 'desktop' );
	} );

	it( 'should call the mShot endpoint for each config during createScreenshots', () => {
		const { result } = renderHook( () => useSitePreviewMShotImageHandler() );

		act( () => {
			result.current.createScreenshots( 'http://example.com' );
		} );

		expect( fetch ).toHaveBeenCalledTimes( 3 );
		expect( fetch ).toHaveBeenCalledWith(
			'https://s0.wp.com/mshots/v1/http%3A%2F%2Fexample.com?vpw=1600&vph=1600&w=1600&h=1624&screen_height=1600&scale=2',
			{ method: 'GET' }
		);
		expect( fetch ).toHaveBeenCalledWith(
			'https://s0.wp.com/mshots/v1/http%3A%2F%2Fexample.com?vpw=767&vph=1600&w=767&h=1600&screen_height=1600&scale=2',
			{ method: 'GET' }
		);
		expect( fetch ).toHaveBeenCalledWith(
			'https://s0.wp.com/mshots/v1/http%3A%2F%2Fexample.com?vpw=479&vph=1200&w=479&h=1200&screen_height=1200&scale=2',
			{ method: 'GET' }
		);
	} );
} );
