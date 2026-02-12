import { createClient, createTextMessage, type Suggestion } from '@automattic/agenttic-client';
import { useEffect, useRef, useState } from '@wordpress/element';
import { getLocaleData } from '@wordpress/i18n';
import { createDefaultAgentConfig } from '../utils/agent-config';
import { extractJsonFromModelResponse } from '../utils/extract-json';
import { DEFAULT_GENERATE_SUGGESTIONS } from './suggestions-data';

/**
 * Type guard to validate the model response has a valid suggestions structure.
 * @param parsed - The parsed response from the model.
 * @returns True if the response has a valid suggestions structure, false otherwise.
 */
function isValidSuggestionsResponse(
	parsed: unknown
): parsed is { suggestions: Array< { label: string; prompt: string } > } {
	if ( ! parsed || typeof parsed !== 'object' ) {
		return false;
	}

	const obj = parsed as Record< string, unknown >;
	if ( ! Array.isArray( obj.suggestions ) ) {
		return false;
	}

	return obj.suggestions.every(
		( item ) =>
			typeof item === 'object' &&
			item !== null &&
			typeof ( item as Record< string, unknown > ).label === 'string' &&
			typeof ( item as Record< string, unknown > ).prompt === 'string'
	);
}

/**
 * Module-level cache for suggestions.
 * Persists across component remounts but resets on page refresh.
 */
const suggestionsCache = new Map< string, Suggestion[] >();
interface UseAsyncSuggestionsLoaderOptions {
	prompt: string;
	cacheKey?: string | null;
	enabled?: boolean;
}

interface UseAsyncSuggestionsLoaderReturn {
	suggestions: Suggestion[];
	isLoading: boolean;
	abortLoading: () => void;
}

export function useAsyncSuggestionsLoader(
	options: UseAsyncSuggestionsLoaderOptions
): UseAsyncSuggestionsLoaderReturn {
	const locale = ( getLocaleData()?.[ '' ] as { lang?: string } | undefined )?.lang ?? 'en';
	const { prompt: suggestionPrompt, cacheKey, enabled = true } = options;

	const [ suggestions, setSuggestions ] = useState< Suggestion[] >( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const abortControllerRef = useRef< AbortController | null >( null );

	const prompt = `You are a creative assistant that generates image generation prompts based on user input.

${ suggestionPrompt }

Output ONLY valid JSON matching this exact structure (no markdown, no explanation):
{"suggestions":[{"label":"Short button text (3 words)","prompt":"Detailed image generation prompt (3-5 sentences)"}]}

Guidelines for each suggestion:
- label: 3-5 word button text describing the image concept
- prompt: Specific, descriptive (subject, setting, lighting, mood, style), 1-3 sentences
- Avoid text, logos, or human faces unless contextually essential
- Vary the suggestions: different visual approaches (literal vs abstract, photo vs illustration)
- Generate all text in the language corresponding to locale code "${ locale }" (e.g. en = English, fr = French, es = Spanish).

Output valid JSON only, nothing else.`;

	/**
	 * Abort suggestion loading request.
	 */
	const abortLoading = () => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		setIsLoading( false );
	};

	/**
	 * Load suggestions when enabled and cacheKey changes.
	 */
	useEffect( () => {
		if ( ! enabled ) {
			setSuggestions( [] );
			return;
		}

		// Check cache first
		if ( cacheKey ) {
			const cached = suggestionsCache.get( cacheKey );
			if ( cached && cached.length > 0 ) {
				setSuggestions( cached );
				return;
			}
		}

		// Abort any existing request
		abortControllerRef.current?.abort();

		// Create new AbortController for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;
		setIsLoading( true );

		const loadSuggestions = async () => {
			try {
				const config = await createDefaultAgentConfig( crypto.randomUUID() );
				const client = createClient( config );

				const response = await client.sendMessage( {
					message: createTextMessage( prompt ),
					abortSignal: abortController.signal,
				} );

				// Check if aborted before processing response
				if ( abortController.signal.aborted ) {
					return;
				}

				const parsed = extractJsonFromModelResponse( response.text );

				if ( ! isValidSuggestionsResponse( parsed ) ) {
					window.console?.error?.( '[Image Studio] Invalid suggestions response:', response.text );
					setSuggestions( DEFAULT_GENERATE_SUGGESTIONS );
					return;
				}

				const loadedSuggestions: Suggestion[] =
					parsed.suggestions.map( ( s: { label: string; prompt: string }, index: number ) => ( {
						id: `suggestion-${ index }-${ Date.now() }`,
						label: s.label,
						prompt: s.prompt,
					} ) ) || [];

				// Cache successful results
				if ( cacheKey && loadedSuggestions.length > 0 ) {
					suggestionsCache.set( cacheKey, loadedSuggestions );
				}

				setSuggestions( loadedSuggestions );
			} catch ( error ) {
				// Silently handle abort errors
				if ( error instanceof DOMException && error.name === 'AbortError' ) {
					return;
				}

				window.console?.warn?.( '[Image Studio] Failed to fetch suggestions:', error );
				setSuggestions( DEFAULT_GENERATE_SUGGESTIONS );
			} finally {
				// Only clear loading state if this controller is still active
				if ( abortControllerRef.current === abortController ) {
					setIsLoading( false );
				}
			}
		};

		loadSuggestions();

		return () => {
			abortController.abort();
		};
	}, [ enabled, cacheKey, prompt ] );

	return {
		suggestions,
		isLoading,
		abortLoading,
	};
}
