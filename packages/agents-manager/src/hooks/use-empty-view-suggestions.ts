import { type Suggestion } from '@automattic/agenttic-ui';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isReaderChatHost } from '../utils/is-reader-chat-agent';
import type { LoadedProviders } from '../utils/load-external-providers';

interface UseEmptyViewSuggestionsOptions {
	loadedProviders: LoadedProviders | null;
}

/**
 * Hook to manage empty view suggestions, handling Big Sky's theme-dependent suggestions
 *
 * If Big Sky provides getEmptyViewSuggestions, this hook waits for WordPress core store
 * (specifically theme data) to be ready before calling it. This prevents the suggestions
 * from "jumping" as the theme data loads.
 * If Big Sky doesn't provide custom suggestions, returns translated default suggestions.
 * @param params - Hook parameters
 * @param params.loadedProviders - External providers loaded from plugins (e.g., Big Sky)
 * @returns The computed suggestions (either from Big Sky or defaults), or null while loading
 */
/**
 * Direct override path: a host that renders AgentsManager (e.g. reader-chat
 * on a blog frontend) can set `window.agentsManagerData.readerSuggestions`
 * to a Suggestion[] and this hook will return it verbatim, bypassing the
 * provider flow. Reassigning the global and forcing a re-render causes
 * the empty view to update with fresh suggestions.
 */
function readOverrideSuggestions(): Suggestion[] | null {
	if ( typeof window === 'undefined' || ! isReaderChatHost() ) {
		return null;
	}
	const data = ( window as unknown as { agentsManagerData?: { readerSuggestions?: unknown } } )
		.agentsManagerData;
	const override = data?.readerSuggestions;
	// Key absent entirely — no host override, fall through to defaults.
	if ( ! Array.isArray( override ) ) {
		return null;
	}
	// Empty array is an explicit "no chips yet" signal (host is fetching
	// AI suggestions and wants the empty view to show nothing until they
	// arrive). Return it verbatim rather than falling through to defaults.
	if ( override.length === 0 ) {
		return [];
	}
	const valid = override.filter(
		( s ): s is Suggestion =>
			!! s && typeof s === 'object' && 'label' in s && 'prompt' in s && 'id' in s
	);
	return valid.length > 0 ? valid : null;
}

export function useEmptyViewSuggestions( {
	loadedProviders,
}: UseEmptyViewSuggestionsOptions ): Suggestion[] | null {
	const isReaderChat = isReaderChatHost();

	// Default suggestions - used when Big Sky doesn't provide custom ones
	const defaultSuggestions = useMemo(
		() => [
			{
				id: 'getting-started',
				label: __( 'Getting started with WordPress', '__i18n_text_domain__' ),
				prompt: __( 'How do I get started with WordPress?', '__i18n_text_domain__' ),
			},
			{
				id: 'create-post',
				label: __( 'Create a blog post', '__i18n_text_domain__' ),
				prompt: __( 'How do I create a blog post?', '__i18n_text_domain__' ),
			},
			{
				id: 'customize-site',
				label: __( 'Customize my site', '__i18n_text_domain__' ),
				prompt: __( 'How can I customize my site?', '__i18n_text_domain__' ),
			},
		],
		[]
	);
	// Check if Big Sky provides suggestions
	const hasBigSkySuggestions = !! loadedProviders?.getEmptyViewSuggestions;

	// Wait for WordPress core store to be ready (specifically theme data)
	// This is needed because Big Sky's getEmptyViewSuggestions filters by theme
	const isCoreStoreReady = useSelect(
		( select ) => {
			if ( ! hasBigSkySuggestions ) {
				return true; // No need to wait if not using Big Sky suggestions
			}
			try {
				const coreStore = select( 'core' ) as {
					getCurrentTheme?: () => unknown;
				};
				// Check if getCurrentTheme returns a value (meaning store is ready)
				const theme = coreStore?.getCurrentTheme?.();
				return !! theme;
			} catch {
				return false;
			}
		},
		[ hasBigSkySuggestions ]
	);

	// Compute empty view suggestions once when store is ready
	const [ emptyViewSuggestions, setEmptyViewSuggestions ] = useState< Suggestion[] | null >( null );

	// Signal that bumps whenever the host dispatches
	// `reader-chat-suggestions-updated`. Reader chat fires this after async
	// AI suggestions arrive so the empty view re-reads the override without
	// the component tree having to re-mount.
	const [ overrideVersion, setOverrideVersion ] = useState( 0 );
	useEffect( () => {
		if ( typeof window === 'undefined' || ! isReaderChat ) {
			return;
		}
		const handler = () => setOverrideVersion( ( v ) => v + 1 );
		window.addEventListener( 'reader-chat-suggestions-updated', handler );
		return () => {
			window.removeEventListener( 'reader-chat-suggestions-updated', handler );
		};
	}, [ isReaderChat ] );

	useEffect( () => {
		if ( ! loadedProviders || ! isCoreStoreReady ) {
			return;
		}

		// Re-read override on every effect run. We compare by JSON-identity
		// against the current state so we only call setState when the
		// override content actually changes — otherwise a fresh array
		// reference every render would loop infinitely.
		const currentOverride = readOverrideSuggestions();
		if ( currentOverride ) {
			const currentKey = JSON.stringify(
				currentOverride.map( ( s ) => [ s.id, s.label, s.prompt ] )
			);
			const stateKey = emptyViewSuggestions
				? JSON.stringify( emptyViewSuggestions.map( ( s ) => [ s.id, s.label, s.prompt ] ) )
				: null;
			if ( currentKey !== stateKey ) {
				setEmptyViewSuggestions( currentOverride );
			}
			return;
		}

		if ( emptyViewSuggestions !== null ) {
			return;
		}

		if ( ! hasBigSkySuggestions ) {
			// No Big Sky suggestions provider, use defaults immediately
			setEmptyViewSuggestions( defaultSuggestions );
		} else {
			// Big Sky provides suggestions and store is ready - get filtered suggestions
			const suggestions = loadedProviders.getEmptyViewSuggestions?.();
			if ( suggestions && suggestions.length > 0 ) {
				setEmptyViewSuggestions( suggestions );
			} else {
				// Provider exists but returned empty/undefined (e.g. lazy proxy
				// race where the IIFE hasn't set window globals yet). Fall back
				// to defaults so the AM still renders.
				setEmptyViewSuggestions( defaultSuggestions );
			}
		}
	}, [
		loadedProviders,
		isCoreStoreReady,
		hasBigSkySuggestions,
		defaultSuggestions,
		emptyViewSuggestions,
		overrideVersion,
	] );

	return emptyViewSuggestions;
}
