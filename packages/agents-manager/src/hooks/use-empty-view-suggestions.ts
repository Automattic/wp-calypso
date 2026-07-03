import { type Suggestion } from '@automattic/agenttic-ui';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAgentsManagerContext } from '../contexts';
import { isPluginCompassHost } from '../utils/is-plugin-compass-agent';
import { isReaderChatHost } from '../utils/is-reader-chat-agent';
import type { LoadedProviders } from '../utils/load-external-providers';

interface UseEmptyViewSuggestionsOptions {
	loadedProviders: LoadedProviders | null;
}

const SITE_EDITOR_ONLY_SUGGESTION_IDS = new Set( [
	'customize-colors',
	'choose-new-fonts',
	'change-page-layout',
	'edit-pages',
	'add-new-page',
	'what-else-can-i-do',
] );

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
 * on a blog frontend, Plugin Compass on the plugins marketplace) can set
 * `window.agentsManagerData.readerSuggestions` / `.compassSuggestions` to a
 * Suggestion[] and this hook will return it verbatim, bypassing the provider
 * flow (and the Big Sky theme-readiness gate further below). Reassigning the
 * global and forcing a re-render causes the empty view to update with fresh
 * suggestions.
 */
function readOverrideSuggestions(): Suggestion[] | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const data = (
		window as unknown as {
			agentsManagerData?: { readerSuggestions?: unknown; compassSuggestions?: unknown };
		}
	 ).agentsManagerData;

	let override: unknown;
	if ( isReaderChatHost() ) {
		override = data?.readerSuggestions;
	} else if ( isPluginCompassHost() ) {
		override = data?.compassSuggestions;
	} else {
		return null;
	}

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
			!! s &&
			typeof s === 'object' &&
			'id' in s &&
			'label' in s &&
			'prompt' in s &&
			typeof s.id === 'string' &&
			typeof s.label === 'string' &&
			typeof s.prompt === 'string'
	);

	return valid.length > 0 ? valid : null;
}

function getSuggestionsKey( suggestions: Suggestion[] | null ): string | null {
	return suggestions
		? JSON.stringify( suggestions.map( ( s ) => [ s.id, s.label, s.prompt ] ) )
		: null;
}

function getWindowPathname(): string {
	return typeof window !== 'undefined' ? window.location.pathname : '';
}

function isPostEditorSurface( currentRoute?: string ): boolean {
	const pathname = getWindowPathname();
	return (
		!! currentRoute?.includes( 'post.php' ) ||
		!! currentRoute?.includes( 'post-new.php' ) ||
		pathname.includes( 'post.php' ) ||
		pathname.includes( 'post-new.php' )
	);
}

function isSiteEditorSurface( sectionName: string, currentRoute?: string ): boolean {
	if ( isPostEditorSurface( currentRoute ) ) {
		return false;
	}

	return (
		sectionName === 'site-editor' ||
		!! currentRoute?.includes( 'site-editor.php' ) ||
		getWindowPathname().includes( 'site-editor.php' )
	);
}

function filterEmptyViewSuggestions(
	suggestions: Suggestion[],
	shouldShowSiteEditorSuggestions: boolean
): Suggestion[] {
	if ( shouldShowSiteEditorSuggestions ) {
		return suggestions;
	}
	return suggestions.filter(
		( suggestion ) => ! SITE_EDITOR_ONLY_SUGGESTION_IDS.has( suggestion.id )
	);
}

export function useEmptyViewSuggestions( {
	loadedProviders,
}: UseEmptyViewSuggestionsOptions ): Suggestion[] | null {
	const isReaderChat = isReaderChatHost();
	const { sectionName, currentRoute } = useAgentsManagerContext();
	const shouldShowSiteEditorSuggestions = isSiteEditorSurface( sectionName, currentRoute );

	// Default suggestions - used when Big Sky doesn't provide custom ones
	const defaultSuggestions = useMemo(
		() => [
			{
				id: 'getting-started',
				label: __( 'Getting started with WordPress', __i18n_text_domain__ ),
				prompt: __( 'How do I get started with WordPress?', __i18n_text_domain__ ),
			},
			{
				id: 'create-post',
				label: __( 'Create a blog post', __i18n_text_domain__ ),
				prompt: __( 'How do I create a blog post?', __i18n_text_domain__ ),
			},
			{
				id: 'customize-site',
				label: __( 'Customize my site', __i18n_text_domain__ ),
				prompt: __( 'How can I customize my site?', __i18n_text_domain__ ),
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
		// Re-read override before the core-store readiness gate. Reader-chat
		// suggestions come from the host page and do not depend on theme data.
		// Compare against current state so a fresh override array does not
		// trigger a render loop.
		const currentOverride = readOverrideSuggestions();
		if ( currentOverride !== null ) {
			const currentKey = getSuggestionsKey( currentOverride );
			const stateKey = getSuggestionsKey( emptyViewSuggestions );
			if ( currentKey !== stateKey ) {
				setEmptyViewSuggestions( currentOverride );
			}
			return;
		}

		if ( ! loadedProviders || ! isCoreStoreReady ) {
			return;
		}

		if ( emptyViewSuggestions !== null ) {
			return;
		}

		// Opt-out: a loaded provider can suppress the built-in defaults for
		// its surfaces (e.g. WooCommerce AI doesn't want WordPress-flavored
		// chips like "Create a blog post" on a Woo admin chat).
		const suppressDefaults = loadedProviders.suppressEmptyViewDefaults === true;
		const fallbackSuggestions = suppressDefaults ? [] : defaultSuggestions;

		if ( ! hasBigSkySuggestions ) {
			// No Big Sky suggestions provider, use defaults immediately
			setEmptyViewSuggestions( fallbackSuggestions );
		} else {
			// Big Sky provides suggestions and store is ready - get filtered suggestions
			const providerSuggestions = loadedProviders.getEmptyViewSuggestions?.() ?? [];
			const suggestions = filterEmptyViewSuggestions(
				providerSuggestions,
				shouldShowSiteEditorSuggestions
			);
			if ( suggestions.length > 0 ) {
				setEmptyViewSuggestions( suggestions );
			} else if ( providerSuggestions.length > 0 ) {
				// The provider returned suggestions, but all of them are hidden
				// on this surface (for example Site Editor suggestions in the
				// post editor). Keep the empty view empty instead of falling
				// back to generic suggestions.
				setEmptyViewSuggestions( [] );
			} else {
				// Provider exists but returned empty/undefined (e.g. lazy proxy
				// race where the IIFE hasn't set window globals yet). Fall back
				// to defaults so the AM still renders.
				setEmptyViewSuggestions( fallbackSuggestions );
			}
		}
	}, [
		loadedProviders,
		isCoreStoreReady,
		hasBigSkySuggestions,
		defaultSuggestions,
		emptyViewSuggestions,
		overrideVersion,
		shouldShowSiteEditorSuggestions,
	] );

	return emptyViewSuggestions;
}
