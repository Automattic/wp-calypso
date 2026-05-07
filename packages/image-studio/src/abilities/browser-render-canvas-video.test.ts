/**
 * @jest-environment jsdom
 *
 * Smoke test for the browser-render-canvas-video ability registration. Verifies that
 * the registered callback validates briefs, dispatches a render request,
 * and resolves on a matching store result.
 */

const mockGetLastResult = jest.fn();
const mockGetLastError = jest.fn();
const mockGetPending = jest.fn();
const mockRequestRender = jest.fn();
const mockSubscribers: Array< () => void > = [];
let mockResultState: ( { requestId: string } & Record< string, unknown > ) | null = null;
let mockErrorState: { requestId: string; message: string } | null = null;

let registeredCallback: ( ( input: unknown ) => Promise< unknown > ) | null = null;

jest.mock( '@wordpress/abilities', () => ( {
	registerAbility: jest.fn( ( config: { callback: ( input: unknown ) => Promise< unknown > } ) => {
		registeredCallback = config.callback;
		return Promise.resolve();
	} ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: () => ( {
		requestFeatureClipRender: ( payload: { requestId: string; brief: unknown } ) => {
			mockRequestRender( payload );
			mockSubscribers.forEach( ( cb ) => cb() );
			return Promise.resolve( payload );
		},
	} ),
	select: () => ( {
		getLastFeatureClipRenderResult: () => {
			mockGetLastResult();
			return mockResultState;
		},
		getLastFeatureClipRenderError: () => {
			mockGetLastError();
			return mockErrorState;
		},
		getPendingFeatureClipRender: () => {
			mockGetPending();
			return null;
		},
	} ),
	subscribe: ( cb: () => void ) => {
		mockSubscribers.push( cb );
		return () => {
			const idx = mockSubscribers.indexOf( cb );
			if ( idx >= 0 ) {
				mockSubscribers.splice( idx, 1 );
			}
		};
	},
} ) );

jest.mock( '../stores/video-studio', () => ( {
	store: 'video-studio',
} ) );

const validBrief = {
	style: 'highlights' as const,
	scenes: [ { imageUrl: 'https://x/a.jpg', camera: 'zoom-in' as const } ],
	titleCard: { copy: 'Hello' },
};

beforeEach( async () => {
	mockGetLastResult.mockClear();
	mockGetLastError.mockClear();
	mockGetPending.mockClear();
	mockRequestRender.mockClear();
	mockSubscribers.length = 0;
	mockResultState = null;
	mockErrorState = null;
	registeredCallback = null;
	jest.resetModules();
	const fresh = await import( './browser-render-canvas-video' );
	await fresh.registerBrowserRenderCanvasVideoAbility();
} );

describe( 'registerBrowserRenderCanvasVideoAbility', () => {
	it( 'registers the ability and exposes a callable callback', () => {
		expect( registeredCallback ).not.toBeNull();
		expect( typeof registeredCallback ).toBe( 'function' );
	} );

	it( 'rejects briefs with an unknown style', async () => {
		await expect(
			registeredCallback!( { brief: { ...validBrief, style: 'unknown' } } )
		).rejects.toThrow( /style must be/i );
	} );

	it( 'rejects when titleCard.copy is missing', async () => {
		await expect(
			registeredCallback!( {
				brief: { ...validBrief, titleCard: {} as unknown as { copy: string } },
			} )
		).rejects.toThrow( /titleCard\.copy/ );
	} );

	it( 'dispatches a render request and resolves on a matching store result', async () => {
		const promise = registeredCallback!( { brief: validBrief } );
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		const requestId = mockRequestRender.mock.calls[ 0 ][ 0 ].requestId;
		mockResultState = {
			requestId,
			attachmentId: 42,
			url: 'https://example.com/clip.mp4',
			durationSeconds: 8,
		};
		mockSubscribers.forEach( ( cb ) => cb() );

		await expect( promise ).resolves.toEqual( {
			attachmentId: 42,
			url: 'https://example.com/clip.mp4',
			durationSeconds: 8,
		} );
	} );

	it( 'rejects on a matching store error', async () => {
		const promise = registeredCallback!( { brief: validBrief } );
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		const requestId = mockRequestRender.mock.calls[ 0 ][ 0 ].requestId;
		mockErrorState = { requestId, message: 'render busted' };
		mockSubscribers.forEach( ( cb ) => cb() );

		await expect( promise ).rejects.toThrow( 'render busted' );
	} );

	it( 'ignores result events for other requestIds', async () => {
		const promise = registeredCallback!( { brief: validBrief } );
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		mockResultState = {
			requestId: 'someone-else',
			attachmentId: 1,
			url: 'u',
			durationSeconds: 8,
		};
		mockSubscribers.forEach( ( cb ) => cb() );

		const racer = Promise.race( [
			promise.then( () => 'resolved' ),
			new Promise< string >( ( r ) => setTimeout( () => r( 'pending' ), 30 ) ),
		] );
		await expect( racer ).resolves.toBe( 'pending' );

		const requestId = mockRequestRender.mock.calls[ 0 ][ 0 ].requestId;
		mockResultState = { requestId, attachmentId: 7, url: 'u2', durationSeconds: 8 };
		mockSubscribers.forEach( ( cb ) => cb() );
		await expect( promise ).resolves.toMatchObject( { attachmentId: 7 } );
	} );
} );
