import { rateMessage, submitFeedback } from '@automattic/agents-manager';
import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { ImageStudioMode } from '../types';
import { useImageStudioFeedback } from './use-image-studio-feedback';

vi.mock( '@automattic/agents-manager', () => ( {
	rateMessage: vi.fn(),
	submitFeedback: vi.fn().mockResolvedValue( undefined ),
} ) );

vi.mock( '@wordpress/data', () => ( {
	useSelect: () => 'msg-1',
} ) );

vi.mock( '../store', () => ( { store: 'image-studio' } ) );

const authProvider = vi.fn();
const baseConfig = { authProvider, sessionId: 'session-1' };

describe( 'useImageStudioFeedback', () => {
	beforeEach( () => vi.clearAllMocks() );

	it( 'sends the trace id when rating', () => {
		const { result } = renderHook( () =>
			useImageStudioFeedback( { ...baseConfig, getTraceIdForMessage: () => 'trace-1' } )
		);

		result.current.handleFeedback( 'down' );

		expect( rateMessage ).toHaveBeenCalledWith(
			authProvider,
			'session-1',
			'msg-1',
			'down',
			undefined,
			undefined,
			'trace-1'
		);
	} );

	it( 'sends the trace id with the typed feedback', async () => {
		const { result } = renderHook( () =>
			useImageStudioFeedback( { ...baseConfig, getTraceIdForMessage: () => 'trace-1' } )
		);

		await result.current.handleSubmitFeedbackText( ' too dark ' );

		expect( submitFeedback ).toHaveBeenCalledWith(
			authProvider,
			'session-1',
			'msg-1',
			'too dark',
			undefined,
			'trace-1',
			undefined
		);
	} );

	it( 'sends the same image metadata with the typed feedback as with the rating', async () => {
		const { result } = renderHook( () =>
			useImageStudioFeedback( {
				...baseConfig,
				displayImageUrl: 'https://example.com/image.png',
				mode: ImageStudioMode.Edit,
			} )
		);

		result.current.handleFeedback( 'down' );
		await result.current.handleSubmitFeedbackText( 'too dark' );

		const expectedMetadata = { image_url: 'https://example.com/image.png', mode: 'edit' };
		expect( ( rateMessage as Mock ).mock.calls[ 0 ][ 5 ] ).toEqual( expectedMetadata );
		expect( ( submitFeedback as Mock ).mock.calls[ 0 ][ 6 ] ).toEqual( expectedMetadata );
	} );

	it( 'omits the trace id when none is known', async () => {
		const { result } = renderHook( () =>
			useImageStudioFeedback( { ...baseConfig, getTraceIdForMessage: () => undefined } )
		);

		result.current.handleFeedback( 'up' );
		await result.current.handleSubmitFeedbackText( 'nice' );

		expect( ( rateMessage as Mock ).mock.calls[ 0 ][ 6 ] ).toBeUndefined();
		expect( ( submitFeedback as Mock ).mock.calls[ 0 ][ 5 ] ).toBeUndefined();
	} );
} );
