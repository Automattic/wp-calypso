import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSummarizerOptions {
	/**
	 * The type of summary to generate.
	 * - 'key-points': Bullet-point list of key ideas (3/5/7 bullets for short/medium/long).
	 * - 'tldr': Brief paragraph summary (1/3/5 sentences for short/medium/long).
	 * - 'teaser': Engaging preview to entice reading (1/3/5 sentences for short/medium/long).
	 * - 'headline': Single-line title (12/17/22 words for short/medium/long).
	 *
	 * @default 'tldr'
	 */
	type?: string;
	/**
	 * The output format for the summary.
	 * - 'plain-text': Plain text output.
	 * - 'markdown': Markdown-formatted output.
	 *
	 * @default 'plain-text'
	 */
	format?: string;
	/**
	 * Controls the length of the generated summary.
	 * The exact output varies by summary type — see `type` for details.
	 *
	 * @default 'medium'
	 */
	length?: string;
	/**
	 * Background context shared across all summarize() calls for this instance.
	 * Use this to provide persistent context (e.g. "This is a WordPress blog post about travel").
	 */
	sharedContext?: string;
	/**
	 * BCP 47 language tag for the output language (e.g. 'pt', 'es', 'en').
	 * When set, the summary is translated into the specified language.
	 */
	outputLanguage?: string;
}

/**
 * React hook that wraps the Chrome built-in Summarizer API.
 *
 * Provides browser-support detection, model download progress tracking,
 * and an async `summarize` function that returns the summarized (and
 * optionally translated) text.
 *
 * Requires a `QueryClientProvider` ancestor in the component tree.
 *
 * @see https://developer.chrome.com/docs/ai/summarizer-api
 *
 * @example
 * ```tsx
 * const { isSupported, isLoading, summary, summarize } = useSummarizer({
 *   type: 'tldr',
 *   outputLanguage: 'pt',
 * });
 *
 * await summarize( postContent, 'A blog post about web performance' );
 * ```
 *
 * @returns
 * - `isSupported`      — Whether the browser supports the Summarizer API.
 * - `isDownloading`    — Whether the AI model is currently being downloaded.
 * - `downloadProgress` — Download progress from 0 to 1.
 * - `isLoading`        — Whether a summarization request is in progress.
 * - `summary`          — The last successfully generated summary, or null.
 * - `error`            — The last error thrown during summarization, or null.
 * - `summarize( content, context? )` — Trigger summarization. Returns the summary string or null on failure.
 */
export function useSummarizer( options: UseSummarizerOptions = {} ) {
	const {
		type = 'tldr',
		format = 'plain-text',
		length = 'medium',
		sharedContext,
		outputLanguage,
	} = options;

	const isSupported = 'Summarizer' in globalThis;
	const [ isDownloading, setIsDownloading ] = useState( false );
	const [ downloadProgress, setDownloadProgress ] = useState( 0 );

	const summarizerRef = useRef< {
		summarize: ( content: string, options?: { context?: string } ) => Promise< string >;
		destroy: () => void;
	} | null >( null );

	useEffect( () => {
		return () => {
			summarizerRef.current?.destroy();
			summarizerRef.current = null;
		};
	}, [] );

	const ensureSummarizer = useCallback( async () => {
		if ( summarizerRef.current ) {
			return summarizerRef.current;
		}

		const SummarizerAPI = ( globalThis as any ).Summarizer;
		const availability = await SummarizerAPI.availability();

		if ( availability === 'unavailable' ) {
			throw new Error( 'Summarizer is not available on this device.' );
		}

		const createOptions: Record< string, unknown > = {
			type,
			format,
			length,
			monitor( m: {
				addEventListener: ( event: string, handler: ( e: { loaded?: number } ) => void ) => void;
			} ) {
				setIsDownloading( true );
				m.addEventListener( 'downloadprogress', ( e: { loaded?: number } ) => {
					if ( e.loaded !== undefined ) {
						setDownloadProgress( e.loaded );
					}
				} );
			},
		};

		if ( sharedContext ) {
			createOptions.sharedContext = sharedContext;
		}

		if ( outputLanguage ) {
			createOptions.outputLanguage = outputLanguage;
		}

		const instance = await SummarizerAPI.create( createOptions );
		setIsDownloading( false );

		summarizerRef.current = instance;
		return instance;
	}, [ type, format, length, sharedContext, outputLanguage ] );

	const mutation = useMutation< string, Error, { content: string; context?: string } >( {
		mutationFn: async ( { content, context } ) => {
			if ( ! ( 'Summarizer' in globalThis ) ) {
				throw new Error( 'Summarizer API is not supported in this browser.' );
			}

			const instance = await ensureSummarizer();
			return instance.summarize( content, context ? { context } : undefined );
		},
	} );

	const summarize = useCallback(
		async ( content: string, context?: string ): Promise< string | null > => {
			try {
				return await mutation.mutateAsync( { content, context } );
			} catch {
				return null;
			}
		},
		[ mutation.mutateAsync ]
	);

	return {
		isSupported,
		isDownloading,
		downloadProgress,
		isLoading: mutation.isPending,
		summary: mutation.data ?? null,
		error: mutation.error,
		summarize,
	};
}
