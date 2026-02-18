import { type Suggestion } from '@automattic/agenttic-ui';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
export function useEmptyViewSuggestions( {
	loadedProviders,
}: UseEmptyViewSuggestionsOptions ): Suggestion[] | null {
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

	useEffect( () => {
		if ( ! loadedProviders || ! isCoreStoreReady || emptyViewSuggestions !== null ) {
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
			}
		}
	}, [
		loadedProviders,
		isCoreStoreReady,
		hasBigSkySuggestions,
		defaultSuggestions,
		emptyViewSuggestions,
	] );

	return emptyViewSuggestions;
}
