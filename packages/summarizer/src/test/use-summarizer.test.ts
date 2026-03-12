/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useSummarizer } from '../use-summarizer';

function createWrapper() {
	const queryClient = new QueryClient( {
		defaultOptions: { mutations: { retry: false } },
	} );

	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return React.createElement( QueryClientProvider, { client: queryClient }, children );
	};
}

function setupMockSummarizer( {
	availability = 'readily',
	summarizeResult = 'This is a summary.',
}: {
	availability?: string;
	summarizeResult?: string;
} = {} ) {
	const destroyFn = jest.fn();
	const summarizeFn = jest.fn().mockResolvedValue( summarizeResult );

	// @ts-expect-error -- mock global
	globalThis.Summarizer = {
		availability: jest.fn().mockResolvedValue( availability ),
		create: jest.fn().mockResolvedValue( {
			summarize: summarizeFn,
			destroy: destroyFn,
		} ),
	};

	return { destroyFn, summarizeFn };
}

describe( 'useSummarizer', () => {
	afterEach( () => {
		// @ts-expect-error -- cleaning up test global
		delete globalThis.Summarizer;
	} );

	describe( 'isSupported', () => {
		it( 'returns false when Summarizer API is not available', () => {
			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );
			expect( result.current.isSupported ).toBe( false );
		} );

		it( 'returns true when Summarizer API is available', () => {
			setupMockSummarizer();
			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );
			expect( result.current.isSupported ).toBe( true );
		} );
	} );

	describe( 'summarize', () => {
		it( 'returns the summarized content', async () => {
			setupMockSummarizer( { summarizeResult: 'Short summary here.' } );
			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			await act( async () => {
				await result.current.summarize( 'A long post body...' );
			} );

			await waitFor( () => {
				expect( result.current.summary ).toBe( 'Short summary here.' );
			} );
		} );

		it( 'sets isLoading to true while summarizing', async () => {
			let resolveSummarize: ( value: string ) => void;
			const summarizePromise = new Promise< string >( ( resolve ) => {
				resolveSummarize = resolve;
			} );

			// @ts-expect-error -- mock global
			globalThis.Summarizer = {
				availability: jest.fn().mockResolvedValue( 'readily' ),
				create: jest.fn().mockResolvedValue( {
					summarize: jest.fn().mockReturnValue( summarizePromise ),
					destroy: jest.fn(),
				} ),
			};

			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.isLoading ).toBe( false );

			let summarizeCall: Promise< string | null >;
			act( () => {
				summarizeCall = result.current.summarize( 'content' );
			} );

			await waitFor( () => {
				expect( result.current.isLoading ).toBe( true );
			} );

			await act( async () => {
				resolveSummarize!( 'done' );
				await summarizeCall!;
			} );

			await waitFor( () => {
				expect( result.current.isLoading ).toBe( false );
			} );
		} );

		it( 'sets error when summarization fails', async () => {
			// @ts-expect-error -- mock global
			globalThis.Summarizer = {
				availability: jest.fn().mockResolvedValue( 'readily' ),
				create: jest.fn().mockResolvedValue( {
					summarize: jest.fn().mockRejectedValue( new Error( 'Model error' ) ),
					destroy: jest.fn(),
				} ),
			};

			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			await act( async () => {
				await result.current.summarize( 'content' );
			} );

			await waitFor( () => {
				expect( result.current.error ).toEqual( new Error( 'Model error' ) );
			} );
			expect( result.current.summary ).toBeNull();
		} );

		it( 'sets error when API is not supported', async () => {
			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			await act( async () => {
				await result.current.summarize( 'content' );
			} );

			await waitFor( () => {
				expect( result.current.error ).toEqual(
					new Error( 'Summarizer API is not supported in this browser.' )
				);
			} );
		} );

		it( 'passes context to the summarizer', async () => {
			const { summarizeFn } = setupMockSummarizer();
			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			await act( async () => {
				await result.current.summarize( 'post body', 'This is a tech blog post' );
			} );

			expect( summarizeFn ).toHaveBeenCalledWith( 'post body', {
				context: 'This is a tech blog post',
			} );
		} );

		it( 'passes options to Summarizer.create', async () => {
			setupMockSummarizer();
			const { result } = renderHook(
				() =>
					useSummarizer( {
						type: 'key-points',
						format: 'markdown',
						length: 'long',
						sharedContext: 'blog post',
						outputLanguage: 'pt',
					} ),
				{ wrapper: createWrapper() }
			);

			await act( async () => {
				await result.current.summarize( 'content' );
			} );

			// @ts-expect-error -- mock global
			const createCall = globalThis.Summarizer.create.mock.calls[ 0 ][ 0 ];
			expect( createCall.type ).toBe( 'key-points' );
			expect( createCall.format ).toBe( 'markdown' );
			expect( createCall.length ).toBe( 'long' );
			expect( createCall.sharedContext ).toBe( 'blog post' );
			expect( createCall.outputLanguage ).toBe( 'pt' );
		} );

		it( 'sets error when availability is unavailable', async () => {
			setupMockSummarizer( { availability: 'unavailable' } );
			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			await act( async () => {
				await result.current.summarize( 'content' );
			} );

			await waitFor( () => {
				expect( result.current.error ).toEqual(
					new Error( 'Summarizer is not available on this device.' )
				);
			} );
		} );
	} );

	describe( 'download progress', () => {
		it( 'tracks download progress via monitor callback', async () => {
			// @ts-expect-error -- mock global
			globalThis.Summarizer = {
				availability: jest.fn().mockResolvedValue( 'after-download' ),
				create: jest.fn().mockImplementation( ( options: Record< string, unknown > ) => {
					const listeners: Record< string, EventListener > = {};
					const monitor = {
						addEventListener: ( event: string, handler: EventListener ) => {
							listeners[ event ] = handler;
						},
					};
					if ( typeof options.monitor === 'function' ) {
						options.monitor( monitor );
					}

					if ( listeners.downloadprogress ) {
						listeners.downloadprogress( { loaded: 0.5 } as unknown as Event );
					}

					return Promise.resolve( {
						summarize: jest.fn().mockResolvedValue( 'summary' ),
						destroy: jest.fn(),
					} );
				} ),
			};

			const { result } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			await act( async () => {
				await result.current.summarize( 'content' );
			} );

			expect( result.current.downloadProgress ).toBe( 0.5 );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'destroys summarizer instance on unmount', async () => {
			const { destroyFn } = setupMockSummarizer();
			const { result, unmount } = renderHook( () => useSummarizer(), {
				wrapper: createWrapper(),
			} );

			await act( async () => {
				await result.current.summarize( 'content' );
			} );

			unmount();

			expect( destroyFn ).toHaveBeenCalled();
		} );
	} );
} );
