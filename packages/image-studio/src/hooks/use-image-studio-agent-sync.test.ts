/**
 * @jest-environment jsdom
 */

( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

const mockSetImageStudioAiProcessing = jest.fn();
const mockSetLastAgentMessageId = jest.fn();
const mockAddNotice = jest.fn();
const mockTrackImageStudioError = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setImageStudioAiProcessing: mockSetImageStudioAiProcessing,
		setLastAgentMessageId: mockSetLastAgentMessageId,
		addNotice: mockAddNotice,
	} ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioError: ( ...args: unknown[] ) => mockTrackImageStudioError( ...args ),
} ) );

jest.mock( '../types', () => ( {
	ImageStudioMode: { Generate: 'generate', Edit: 'edit' },
} ) );

// eslint-disable-next-line import/order
import { renderHook } from '@testing-library/react';
// eslint-disable-next-line import/order
import { useImageStudioAgentSync } from './use-image-studio-agent-sync';

beforeEach( () => {
	mockSetImageStudioAiProcessing.mockClear();
	mockSetLastAgentMessageId.mockClear();
	mockAddNotice.mockClear();
	mockTrackImageStudioError.mockClear();
} );

describe( 'useImageStudioAgentSync — tool error surfacing', () => {
	it( 'surfaces a known WP_Error tool result as a notice and tracks it', () => {
		const messages = [
			{
				id: 'msg-1',
				role: 'agent',
				parts: [
					{
						type: 'data',
						data: {
							result: {
								code: 'rai_filtered',
								message: 'blocked by safety filters',
							},
						},
					},
				],
			},
		];

		renderHook( () => useImageStudioAgentSync( { isProcessing: false, messages } ) );

		expect( mockAddNotice ).toHaveBeenCalledTimes( 1 );
		expect( mockAddNotice ).toHaveBeenCalledWith( expect.stringContaining( 'safety' ), 'warning' );
		expect( mockTrackImageStudioError ).toHaveBeenCalledWith( {
			mode: 'generate',
			errorType: 'safety_filter',
		} );
	} );

	it( 'does not surface unknown error codes', () => {
		const messages = [
			{
				id: 'msg-2',
				role: 'agent',
				parts: [
					{
						type: 'data',
						data: { result: { code: 'never_seen_before', message: 'huh' } },
					},
				],
			},
		];

		renderHook( () => useImageStudioAgentSync( { isProcessing: false, messages } ) );

		expect( mockAddNotice ).not.toHaveBeenCalled();
		expect( mockTrackImageStudioError ).not.toHaveBeenCalled();
	} );

	it( 'does not double-fire when the same message is re-rendered', () => {
		const messages = [
			{
				id: 'msg-3',
				role: 'agent',
				parts: [
					{
						type: 'data',
						data: { result: { code: 'polling_timeout', message: 'too slow' } },
					},
				],
			},
		];

		const { rerender } = renderHook(
			( { msgs }: { msgs: typeof messages } ) =>
				useImageStudioAgentSync( { isProcessing: false, messages: msgs } ),
			{ initialProps: { msgs: messages } }
		);

		// Re-render with the same messages — must not surface twice.
		rerender( { msgs: [ ...messages ] } );

		expect( mockAddNotice ).toHaveBeenCalledTimes( 1 );
		expect( mockTrackImageStudioError ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores non-data parts and non-WP_Error data parts', () => {
		const messages = [
			{
				id: 'msg-4',
				role: 'agent',
				parts: [
					{ type: 'text', data: { result: { code: 'rai_filtered', message: 'x' } } },
					{ type: 'data', data: { result: { someOtherShape: true } } },
					{ type: 'data', data: { result: 'just a string' } },
					{ type: 'data', data: {} },
				],
			},
		];

		renderHook( () => useImageStudioAgentSync( { isProcessing: false, messages } ) );

		expect( mockAddNotice ).not.toHaveBeenCalled();
	} );

	it( 'handles messages with no parts and empty message lists', () => {
		expect( () =>
			renderHook( () => useImageStudioAgentSync( { isProcessing: false, messages: [] } ) )
		).not.toThrow();

		expect( () =>
			renderHook( () =>
				useImageStudioAgentSync( {
					isProcessing: false,
					messages: [ { id: 'msg-5', role: 'agent' } ],
				} )
			)
		).not.toThrow();

		expect( mockAddNotice ).not.toHaveBeenCalled();
	} );
} );

describe( 'useImageStudioAgentSync — agent envelope error surfacing', () => {
	it( 'surfaces a JSON-RPC envelope error as a notice and tracks it as "other"', () => {
		renderHook( () =>
			useImageStudioAgentSync( {
				isProcessing: false,
				messages: [],
				error: 'An error occurred while processing the request. Please try again later.',
			} )
		);

		expect( mockAddNotice ).toHaveBeenCalledTimes( 1 );
		expect( mockAddNotice ).toHaveBeenCalledWith(
			'An error occurred while processing the request. Please try again later.',
			'error'
		);
		expect( mockTrackImageStudioError ).toHaveBeenCalledWith( {
			mode: 'generate',
			errorType: 'other',
		} );
	} );

	it( 'does not double-fire on re-render with the same error string', () => {
		const { rerender } = renderHook(
			( { err }: { err: string | null } ) =>
				useImageStudioAgentSync( { isProcessing: false, messages: [], error: err } ),
			{ initialProps: { err: 'boom' } }
		);
		rerender( { err: 'boom' } );

		expect( mockAddNotice ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'fires again when the error string changes after clearing', () => {
		const { rerender } = renderHook(
			( { err }: { err: string | null } ) =>
				useImageStudioAgentSync( { isProcessing: false, messages: [], error: err } ),
			{ initialProps: { err: 'first' as string | null } }
		);
		rerender( { err: null } );
		rerender( { err: 'second' } );

		expect( mockAddNotice ).toHaveBeenCalledTimes( 2 );
		expect( mockAddNotice ).toHaveBeenNthCalledWith( 1, 'first', 'error' );
		expect( mockAddNotice ).toHaveBeenNthCalledWith( 2, 'second', 'error' );
	} );

	it( 'is a no-op when error is null or empty', () => {
		renderHook( () =>
			useImageStudioAgentSync( { isProcessing: false, messages: [], error: null } )
		);
		renderHook( () => useImageStudioAgentSync( { isProcessing: false, messages: [], error: '' } ) );

		expect( mockAddNotice ).not.toHaveBeenCalled();
	} );
} );
