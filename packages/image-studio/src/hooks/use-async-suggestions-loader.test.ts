import { act, renderHook, waitFor } from '@testing-library/react';
import { DEFAULT_GENERATE_SUGGESTIONS } from './suggestions-data';
import { useAsyncSuggestionsLoader } from './use-async-suggestions-loader';

// Mock crypto.randomUUID for Node.js test environment
const mockRandomUUID = jest.fn( () => 'test-uuid-1234' );
Object.defineProperty( globalThis, 'crypto', {
	value: {
		randomUUID: mockRandomUUID,
	},
} );

// Mock response from agent
const mockSendMessage = jest.fn();
const mockCreateClient = jest.fn( () => ( {
	sendMessage: mockSendMessage,
} ) );
const mockCreateTextMessage = jest.fn( ( _text: string ) => ( {
	text: _text,
} ) );

const mockCreateAgentConfig = jest.fn( ( _sessionId: string ) =>
	Promise.resolve( { agentId: 'test-agent', sessionId: _sessionId } )
);
const mockExtractJsonFromModelResponse = jest.fn();

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		createClient: () => mockCreateClient(),
		createTextMessage: ( text: string ) => mockCreateTextMessage( text ),
	} ),
	{ virtual: true }
);

jest.mock( '../utils/agent-config', () => ( {
	createDefaultAgentConfig: ( sessionId: string ) => mockCreateAgentConfig( sessionId ),
} ) );

jest.mock( '../utils/extract-json', () => ( {
	extractJsonFromModelResponse: ( text: string ) => mockExtractJsonFromModelResponse( text ),
} ) );

describe( 'useAsyncSuggestionsLoader', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		mockCreateAgentConfig.mockResolvedValue( { agentId: 'test-agent' } );
		mockSendMessage.mockResolvedValue( {
			text: '{"suggestions":[]}',
		} );
		mockExtractJsonFromModelResponse.mockReturnValue( { suggestions: [] } );
	} );

	describe( 'auto-loading when enabled', () => {
		it( 'loads suggestions automatically when enabled', async () => {
			const mockSuggestions = [
				{
					label: 'Sunset beach',
					prompt: 'A beautiful sunset on a beach',
				},
			];

			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: mockSuggestions,
			} );
			mockSendMessage.mockResolvedValue( {
				text: JSON.stringify( { suggestions: mockSuggestions } ),
			} );

			const { result } = renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Generate image suggestions',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( result.current.suggestions ).toHaveLength( 1 );
			} );

			expect( result.current.suggestions[ 0 ] ).toMatchObject( {
				label: 'Sunset beach',
				prompt: 'A beautiful sunset on a beach',
			} );
			expect( result.current.suggestions[ 0 ].id ).toMatch( /^suggestion-0-/ );
		} );

		it( 'does not load when disabled', async () => {
			const { result } = renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Test prompt',
					enabled: false,
				} )
			);

			// Wait a tick to ensure no loading happens
			await act( async () => {
				await new Promise( ( resolve ) => setTimeout( resolve, 10 ) );
			} );

			expect( mockSendMessage ).not.toHaveBeenCalled();
			expect( result.current.suggestions ).toEqual( [] );
		} );

		it( 'loads when enabled changes from false to true', async () => {
			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [ { label: 'Test', prompt: 'Test' } ],
			} );

			const { result, rerender } = renderHook(
				( { enabled } ) =>
					useAsyncSuggestionsLoader( {
						prompt: 'Test prompt',
						enabled,
					} ),
				{ initialProps: { enabled: false } }
			);

			expect( mockSendMessage ).not.toHaveBeenCalled();

			rerender( { enabled: true } );

			await waitFor( () => {
				expect( result.current.suggestions ).toHaveLength( 1 );
			} );

			expect( mockSendMessage ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'clears suggestions when disabled', async () => {
			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [ { label: 'Test', prompt: 'Test' } ],
			} );

			const { result, rerender } = renderHook(
				( { enabled } ) =>
					useAsyncSuggestionsLoader( {
						prompt: 'Test prompt',
						enabled,
					} ),
				{ initialProps: { enabled: true } }
			);

			await waitFor( () => {
				expect( result.current.suggestions ).toHaveLength( 1 );
			} );

			rerender( { enabled: false } );

			await waitFor( () => {
				expect( result.current.suggestions ).toEqual( [] );
			} );
		} );
	} );

	describe( 'caching', () => {
		it( 'returns cached suggestions without API call', async () => {
			const uniqueCacheKey = `test-cache-key-${ Date.now() }`;
			const mockSuggestions = [ { label: 'Cached', prompt: 'Cached prompt' } ];

			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: mockSuggestions,
			} );

			const { result, rerender } = renderHook(
				( { enabled } ) =>
					useAsyncSuggestionsLoader( {
						prompt: 'Test prompt',
						cacheKey: uniqueCacheKey,
						enabled,
					} ),
				{ initialProps: { enabled: true } }
			);

			await waitFor( () => {
				expect( result.current.suggestions ).toHaveLength( 1 );
			} );
			expect( mockSendMessage ).toHaveBeenCalledTimes( 1 );

			// Disable and re-enable to trigger cache hit
			rerender( { enabled: false } );
			await waitFor( () => {
				expect( result.current.suggestions ).toEqual( [] );
			} );

			rerender( { enabled: true } );
			await waitFor( () => {
				expect( result.current.suggestions ).toHaveLength( 1 );
			} );

			// Should still only have one API call (cached)
			expect( mockSendMessage ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not cache empty suggestions', async () => {
			const uniqueCacheKey = `empty-cache-key-${ Date.now() }`;
			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [],
			} );

			const { rerender } = renderHook(
				( { enabled } ) =>
					useAsyncSuggestionsLoader( {
						prompt: 'Test prompt',
						cacheKey: uniqueCacheKey,
						enabled,
					} ),
				{ initialProps: { enabled: true } }
			);

			await waitFor( () => {
				expect( mockSendMessage ).toHaveBeenCalledTimes( 1 );
			} );

			// Change parse response for next call
			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [ { label: 'New', prompt: 'New prompt' } ],
			} );

			// Disable and re-enable
			rerender( { enabled: false } );
			rerender( { enabled: true } );

			await waitFor( () => {
				expect( mockSendMessage ).toHaveBeenCalledTimes( 2 );
			} );
		} );
	} );

	describe( 'error handling', () => {
		it( 'returns DEFAULT_GENERATE_SUGGESTIONS when parsing fails', async () => {
			mockExtractJsonFromModelResponse.mockReturnValue( null );
			mockSendMessage.mockResolvedValue( {
				text: 'invalid response',
			} );

			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

			const { result } = renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Test prompt',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( result.current.suggestions ).toEqual( DEFAULT_GENERATE_SUGGESTIONS );
			} );

			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'[Image Studio] Invalid suggestions response:',
				'invalid response'
			);

			consoleErrorSpy.mockRestore();
		} );

		it( 'returns DEFAULT_GENERATE_SUGGESTIONS on network error', async () => {
			const networkError = new Error( 'Network error' );
			mockSendMessage.mockRejectedValue( networkError );

			const consoleWarnSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const { result } = renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Test prompt',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( result.current.suggestions ).toEqual( DEFAULT_GENERATE_SUGGESTIONS );
			} );

			expect( consoleWarnSpy ).toHaveBeenCalledWith(
				'[Image Studio] Failed to fetch suggestions:',
				networkError
			);

			consoleWarnSpy.mockRestore();
		} );
	} );

	describe( 'isLoading state', () => {
		it( 'sets isLoading to true while fetching', async () => {
			let resolveSendMessage: ( value: any ) => void = () => {};
			mockSendMessage.mockReturnValue(
				new Promise( ( resolve ) => {
					resolveSendMessage = resolve;
				} )
			);

			const { result } = renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Test prompt',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( result.current.isLoading ).toBe( true );
			} );

			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [],
			} );
			await act( async () => {
				resolveSendMessage( { text: '{}' } );
			} );

			await waitFor( () => {
				expect( result.current.isLoading ).toBe( false );
			} );
		} );

		it( 'does not set isLoading when returning cached suggestions', async () => {
			const uniqueCacheKey = `loading-test-key-${ Date.now() }`;
			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [ { label: 'Cached', prompt: 'Test' } ],
			} );

			const { result, rerender } = renderHook(
				( { enabled } ) =>
					useAsyncSuggestionsLoader( {
						prompt: 'Test prompt',
						cacheKey: uniqueCacheKey,
						enabled,
					} ),
				{ initialProps: { enabled: true } }
			);

			await waitFor( () => {
				expect( result.current.suggestions ).toHaveLength( 1 );
			} );

			// Disable and re-enable to hit cache
			rerender( { enabled: false } );
			rerender( { enabled: true } );

			// isLoading should stay false when hitting cache
			expect( result.current.isLoading ).toBe( false );
		} );
	} );

	describe( 'abortLoading', () => {
		it( 'aborts in-flight request', async () => {
			mockSendMessage.mockReturnValue( new Promise( () => {} ) );

			const { result } = renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Test prompt',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( result.current.isLoading ).toBe( true );
			} );

			act( () => {
				result.current.abortLoading();
			} );

			expect( result.current.isLoading ).toBe( false );
		} );

		it( 'aborts on unmount', async () => {
			const abortSignals: AbortSignal[] = [];
			mockSendMessage.mockImplementation( ( { abortSignal } ) => {
				abortSignals.push( abortSignal );
				return new Promise( () => {} );
			} );

			const { unmount } = renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Test prompt',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( abortSignals ).toHaveLength( 1 );
			} );

			unmount();

			expect( abortSignals[ 0 ].aborted ).toBe( true );
		} );
	} );

	describe( 'prompt construction', () => {
		it( 'includes user prompt in the request', async () => {
			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [],
			} );

			renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Generate suggestions for a bakery website',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( mockCreateTextMessage ).toHaveBeenCalledWith(
					expect.stringContaining( 'Generate suggestions for a bakery website' )
				);
			} );
		} );

		it( 'includes JSON output instructions', async () => {
			mockExtractJsonFromModelResponse.mockReturnValue( {
				suggestions: [],
			} );

			renderHook( () =>
				useAsyncSuggestionsLoader( {
					prompt: 'Test prompt',
					enabled: true,
				} )
			);

			await waitFor( () => {
				expect( mockCreateTextMessage ).toHaveBeenCalled();
			} );

			const promptArg = mockCreateTextMessage.mock.calls[ 0 ][ 0 ];
			expect( promptArg ).toContain( 'Output ONLY valid JSON' );
			expect( promptArg ).toContain( '"suggestions"' );
		} );
	} );
} );
