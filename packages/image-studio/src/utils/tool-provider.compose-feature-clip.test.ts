/**
 * @jest-environment jsdom
 *
 * Smoke test for the orchestrator → executeComposeFeatureClip → store
 * round-trip. The render host (which would consume the pendingRender slot
 * in real life) is faked here by listening for the dispatch and writing a
 * synthetic completion / failure back.
 */

const mockGetLastResult = jest.fn();
const mockGetLastError = jest.fn();
const mockGetPending = jest.fn();
const mockRequestRender = jest.fn();
const mockSubscribers: Array< () => void > = [];
let mockPendingState: { requestId: string; brief: unknown } | null = null;
let mockResultState: ( { requestId: string } & Record< string, unknown > ) | null = null;
let mockErrorState: { requestId: string; message: string } | null = null;

jest.mock( '@wordpress/data', () => ( {
	dispatch: () => ( {
		requestFeatureClipRender: ( payload: { requestId: string; brief: unknown } ) => {
			mockRequestRender( payload );
			mockPendingState = payload;
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
			return mockPendingState;
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

jest.mock( '@wordpress/abilities', () => ( {
	getAbilities: () => Promise.resolve( [] ),
	executeAbility: jest.fn(),
} ) );

jest.mock( '../abilities', () => ( {
	registerUpdateCanvasImageAbility: jest.fn(),
	registerUpdateCanvasVideoAbility: jest.fn(),
} ) );

jest.mock( '../stores/video-studio', () => ( {
	store: 'video-studio',
} ) );

// eslint-disable-next-line import/order
import { executeComposeFeatureClip, createToolProvider } from './tool-provider';

const validBrief = {
	style: 'informative-photo' as const,
	scenes: [ { imageUrl: 'https://x/a.jpg', camera: 'zoom-in' as const } ],
	titleCard: { copy: 'Hello' },
};

beforeEach( () => {
	mockGetLastResult.mockClear();
	mockGetLastError.mockClear();
	mockGetPending.mockClear();
	mockRequestRender.mockClear();
	mockSubscribers.length = 0;
	mockPendingState = null;
	mockResultState = null;
	mockErrorState = null;
} );

describe( 'executeComposeFeatureClip', () => {
	it( 'rejects briefs with an unknown style', async () => {
		await expect(
			executeComposeFeatureClip( { ...validBrief, style: 'unknown' } )
		).rejects.toThrow( /style must be/i );
	} );

	it( 'rejects briefs with an empty scenes array', async () => {
		await expect( executeComposeFeatureClip( { ...validBrief, scenes: [] } ) ).rejects.toThrow(
			/non-empty array/i
		);
	} );

	it( 'rejects briefs missing titleCard.copy', async () => {
		await expect(
			executeComposeFeatureClip( { ...validBrief, titleCard: {} as unknown as { copy: string } } )
		).rejects.toThrow( /titleCard\.copy/ );
	} );

	it( 'dispatches requestFeatureClipRender and resolves when the host writes a result for the same requestId', async () => {
		const promise = executeComposeFeatureClip( validBrief );

		// Wait a tick so the dispatch fires and the subscribe is registered.
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

	it( 'rejects when the host writes an error for the same requestId', async () => {
		const promise = executeComposeFeatureClip( validBrief );
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		const requestId = mockRequestRender.mock.calls[ 0 ][ 0 ].requestId;
		mockErrorState = { requestId, message: 'render busted' };
		mockSubscribers.forEach( ( cb ) => cb() );

		await expect( promise ).rejects.toThrow( 'render busted' );
	} );

	it( 'ignores result/error events whose requestId does not match', async () => {
		const promise = executeComposeFeatureClip( validBrief );
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		// Result for a different requestId should NOT resolve the promise.
		mockResultState = {
			requestId: 'someone-else',
			attachmentId: 1,
			url: 'u',
			durationSeconds: 8,
		};
		mockSubscribers.forEach( ( cb ) => cb() );

		// Promise must still be pending after subscriber fires.
		const racer = Promise.race( [
			promise.then( () => 'resolved' ),
			new Promise< string >( ( r ) => setTimeout( () => r( 'pending' ), 30 ) ),
		] );
		await expect( racer ).resolves.toBe( 'pending' );

		// Now write the right requestId — should resolve.
		const requestId = mockRequestRender.mock.calls[ 0 ][ 0 ].requestId;
		mockResultState = { requestId, attachmentId: 7, url: 'u2', durationSeconds: 8 };
		mockSubscribers.forEach( ( cb ) => cb() );
		await expect( promise ).resolves.toMatchObject( { attachmentId: 7 } );
	} );
} );

describe( 'createToolProvider', () => {
	it( 'exposes both ability and tool surfaces', async () => {
		const provider = createToolProvider();
		expect( typeof provider.getAbilities ).toBe( 'function' );
		expect( typeof provider.executeAbility ).toBe( 'function' );
		expect( typeof provider.getAvailableTools ).toBe( 'function' );
		expect( typeof provider.executeTool ).toBe( 'function' );

		const tools = await provider.getAvailableTools!();
		expect( tools ).toHaveLength( 1 );
		expect( tools[ 0 ].id ).toBe( 'image-studio/compose-feature-clip' );
		expect( tools[ 0 ].input_schema.required ).toEqual( [ 'style', 'scenes', 'titleCard' ] );
	} );

	it( 'rejects executeTool calls for unknown tool ids', async () => {
		const provider = createToolProvider();
		await expect( provider.executeTool!( 'image-studio/nope', {} ) ).rejects.toThrow(
			/Unknown tool/
		);
	} );
} );
