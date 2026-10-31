import { rateMessage, submitFeedback } from '@automattic/agents-manager';
import { renderHook } from '@testing-library/react';
import { useImageStudioFeedback } from './use-image-studio-feedback';

jest.mock( '@automattic/agents-manager', () => ( {
	rateMessage: jest.fn(),
	submitFeedback: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: () => 'msg-1',
} ) );

jest.mock( '../store', () => ( { store: 'image-studio' } ) );

const authProvider = jest.fn();
const baseConfig = { authProvider, sessionId: 'session-1' };

describe( 'useImageStudioFeedback', () => {
	beforeEach( () => jest.clearAllMocks() );

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
			'trace-1'
		);
	} );

	it( 'omits the trace id when none is known', async () => {
		const { result } = renderHook( () =>
			useImageStudioFeedback( { ...baseConfig, getTraceIdForMessage: () => undefined } )
		);

		result.current.handleFeedback( 'up' );
		await result.current.handleSubmitFeedbackText( 'nice' );

		expect( ( rateMessage as jest.Mock ).mock.calls[ 0 ][ 6 ] ).toBeUndefined();
		expect( ( submitFeedback as jest.Mock ).mock.calls[ 0 ][ 5 ] ).toBeUndefined();
	} );
} );
