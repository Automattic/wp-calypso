/// <reference types="@types/dom-chromium-ai" />

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SummarizeInput {
	content: string;
	context?: string;
}

interface UseSummarizerOptions {
	type?: SummarizerType;
	format?: SummarizerFormat;
	length?: SummarizerLength;
	sharedContext?: SummarizerCreateOptions[ 'sharedContext' ];
	outputLanguage?: SummarizerCreateOptions[ 'outputLanguage' ];
	cacheKey?: string | string[];
}

export const useSummarizerAvailability = ( options: UseSummarizerOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'browser', 'ai', 'summarizer-supported', options ],
		queryFn: async () => {
			const SummarizerAPI = ( globalThis as any ).Summarizer as typeof Summarizer;
			if ( ! SummarizerAPI ) {
				return 'unavailable';
			}
			return await SummarizerAPI.availability( options );
		},
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchInterval: false,
		refetchIntervalInBackground: false,
	} );
};

export function useSummarizer( options: UseSummarizerOptions = {} ) {
	const {
		type = 'tldr',
		format = 'plain-text',
		length = 'short',
		sharedContext,
		outputLanguage,
		cacheKey,
	} = options;

	const [ isDownloading, setIsDownloading ] = useState( false );
	const { data: availability } = useSummarizerAvailability( options );
	const [ downloadProgress, setDownloadProgress ] = useState( 0 );
	const [ input, setInput ] = useState< SummarizeInput | null >( null );

	const summarizerRef = useRef< {
		summarize: ( content: string, options?: { context?: string } ) => Promise< string >;
		destroy: () => void;
	} | null >( null );

	// Cleanup on unmount
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

		if ( availability === 'unavailable' ) {
			throw new Error( 'Summarizer API is not supported in this browser.' );
		}

		try {
			summarizerRef.current = await SummarizerAPI.create( {
				type,
				format,
				length,
				sharedContext,
				outputLanguage,
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
			} );
		} finally {
			setIsDownloading( false );
		}

		return summarizerRef.current!;
	}, [ type, format, length, sharedContext, outputLanguage, availability ] );

	const query = useQuery( {
		queryKey: [ 'summarizer', cacheKey, input, options ],
		queryFn: async () => {
			if ( ! ( 'Summarizer' in globalThis ) ) {
				throw new Error( 'Summarizer API is not supported in this browser.' );
			}

			if ( ! input ) {
				throw new Error( 'No content to summarize.' );
			}

			const instance = await ensureSummarizer();
			return await instance.summarize(
				input.content,
				input.context ? { context: input.context } : undefined
			);
		},
		enabled: input !== null,
	} );

	const summarize = useCallback( ( content: string, context?: string ) => {
		setInput( { content, context } );
	}, [] );

	return {
		availability,
		isDownloading,
		downloadProgress,
		isLoading: query.isFetching,
		summary: query.data ?? null,
		error: query.error,
		summarize,
	};
}
