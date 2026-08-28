/**
 * Draft assist editor entry point.
 *
 * Registers a `/draft` autocompleter that opens the Jetpack AI sidebar with a
 * starter prompt, gated on the `draftAssist` preview feature and on the editor
 * showing a post or page.
 *
 * The prompt shown in an empty post lives in `draft-placeholder.tsx`. This file
 * used to set it through the `bodyPlaceholder` editor setting; Gutenberg 23.8
 * stopped rendering the component that read it.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { isDraftAssistPostType } from '../utils/draft-assist';
import { isDraftAssistEnabled } from '../utils/preview-features';
import {
	type DraftAssistContentType,
	trackDraftAssistEntryPointTriggered,
} from '../utils/tracking';

export const DRAFT_ENTRY_FILTER_NAMESPACE = 'jetpack-ai-sidebar/draft-entry';
export const DRAFT_COMPLETER_NAME = 'jetpack-ai-draft-assist';

/**
 * A dedicated `/draft` trigger rather than a second `/` completer.
 *
 * Gutenberg's autocomplete picks exactly one completer per keystroke — the one
 * whose trigger prefix ends latest, ties broken by the first in the array (see
 * `getAutocompleteMatch` in `@wordpress/components`). A second `/` completer
 * would therefore either never fire (appended) or shadow the core block
 * inserter entirely (prepended). `/draft` wins on prefix length exactly when
 * the user has typed it, and leaves `/` alone the rest of the time.
 */
export const DRAFT_TRIGGER_PREFIX = '/draft';

/** How long to wait for the chat composer before falling back to setChatInput. */
const CHAT_COMPOSER_POLL_INTERVAL_MS = 100;
const CHAT_COMPOSER_MAX_ATTEMPTS = 50;

/** Retries for `wp.data` not being registered yet when this bundle loads. */

type AgentsManagerActions = {
	isReady?: boolean;
	setChatOpen?: ( isOpen: boolean ) => void;
	setChatInput?: ( value: string ) => void;
	submitChatMessage?: ( message?: string ) => Promise< void > | void;
};

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: AgentsManagerActions;
};

type DraftCompleterOption = {
	id: string;
	label: string;
	keywords: string[];
};

type DraftCompleter = {
	name: string;
	triggerPrefix: string;
	options: DraftCompleterOption[];
	getOptionKeywords: ( option: DraftCompleterOption ) => string[];
	getOptionLabel: ( option: DraftCompleterOption ) => string;
	isOptionDisabled: () => boolean;
	getOptionCompletion: () => { action: string; value: string };
};

// ---------- Module state ----------

let draftEntryRegistered = false;
let isWaitingForAgentsManagerReady = false;
let pendingPrompt: string | null = null;

// ---------- Store access (mirrors utils/block-actions.ts) ----------

function getWpData(): any | null {
	try {
		return ( window as any ).wp?.data ?? null;
	} catch {
		return null;
	}
}

function getWpDataStore( kind: 'select' | 'dispatch', storeName: string ): any | null {
	try {
		const wpData = getWpData();
		if ( ! wpData?.[ kind ] ) {
			return null;
		}
		return wpData[ kind ]( storeName ) ?? null;
	} catch {
		return null;
	}
}

/**
 * Call a store selector or action without letting a throw escape.
 *
 * The sync below runs inside `wp.data`'s listener loop, where an exception
 * would break every other subscriber for the rest of the page's life. Guarding
 * only store acquisition is not enough — the selectors themselves can throw.
 * @param store  - Store object from `getWpDataStore`.
 * @param method - Selector or action name.
 * @param args   - Arguments to pass.
 * @returns The return value, or undefined when the method is missing or threw.
 */
function callStoreMethod< T >( store: any, method: string, ...args: unknown[] ): T | undefined {
	try {
		const fn = store?.[ method ];
		return typeof fn === 'function' ? fn.apply( store, args ) : undefined;
	} catch {
		return undefined;
	}
}

/**
 * The editor's current post type, once it is known.
 * @returns The post type, or undefined while the editor is still resolving one.
 */
function getCurrentPostType(): string | undefined {
	const postType = callStoreMethod< string >(
		getWpDataStore( 'select', 'core/editor' ),
		'getCurrentPostType'
	);
	return typeof postType === 'string' && postType !== '' ? postType : undefined;
}

/**
 * The current editor entity, when draft assist applies to it.
 * @returns 'post' / 'page', or null for any other post type (or none yet).
 */
function getDraftAssistContentType(): DraftAssistContentType | null {
	const postType = getCurrentPostType();
	return isDraftAssistPostType( postType ) ? postType : null;
}

function isDraftAssistAvailable(): boolean {
	return isDraftAssistEnabled() && getDraftAssistContentType() !== null;
}

// ---------- Chat trigger ----------

function getAgentsManagerActions(): AgentsManagerActions | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	return ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
}

function fallBackToChatInput( prompt: string ): void {
	getAgentsManagerActions()?.setChatInput?.( prompt );
}

/**
 * `submitChatMessage` only exists once the chat panel is mounted — it can be
 * missing even after `isReady`. Poll for it, and leave the prompt in the
 * composer if it never shows up.
 * @param prompt  - The starter prompt to send.
 * @param attempt - Current poll attempt.
 */
function submitWhenChatComposerReady( prompt: string, attempt: number ): void {
	const submitChatMessage = getAgentsManagerActions()?.submitChatMessage;

	if ( typeof submitChatMessage === 'function' ) {
		try {
			const submitted = submitChatMessage( prompt );
			if ( submitted && typeof ( submitted as Promise< void > ).catch === 'function' ) {
				( submitted as Promise< void > ).catch( () => fallBackToChatInput( prompt ) );
			}
		} catch {
			fallBackToChatInput( prompt );
		}
		return;
	}

	if ( attempt >= CHAT_COMPOSER_MAX_ATTEMPTS ) {
		fallBackToChatInput( prompt );
		return;
	}

	setTimeout(
		() => submitWhenChatComposerReady( prompt, attempt + 1 ),
		CHAT_COMPOSER_POLL_INTERVAL_MS
	);
}

function deliverPendingPrompt(): void {
	const prompt = pendingPrompt;
	pendingPrompt = null;
	if ( prompt === null ) {
		return;
	}
	getAgentsManagerActions()?.setChatOpen?.( true );
	submitWhenChatComposerReady( prompt, 0 );
}

function handleAgentsManagerReady(): void {
	isWaitingForAgentsManagerReady = false;
	deliverPendingPrompt();
}

function openChatWithPrompt( prompt: string ): void {
	pendingPrompt = prompt;

	if ( getAgentsManagerActions()?.isReady ) {
		deliverPendingPrompt();
		return;
	}

	if ( isWaitingForAgentsManagerReady ) {
		return;
	}
	isWaitingForAgentsManagerReady = true;
	window.addEventListener( 'agents-manager-ready', handleAgentsManagerReady, { once: true } );
}

/**
 * Fire the draft assist entry point: open the sidebar and send the starter
 * prompt for the entity being edited.
 * @param options                  - Trigger options.
 * @param options.fromSlashCommand - Whether the `/draft` autocompleter fired it.
 */
export function triggerDraftAssist( {
	fromSlashCommand,
}: { fromSlashCommand?: boolean } = {} ): void {
	const contentType = getDraftAssistContentType();
	if ( ! isDraftAssistEnabled() || ! contentType ) {
		return;
	}

	trackDraftAssistEntryPointTriggered( {
		contentType,
		fromSlashCommand: fromSlashCommand === true,
	} );

	openChatWithPrompt(
		contentType === 'page'
			? __( 'Help me draft this page', __i18n_text_domain__ )
			: __( 'Help me draft this post', __i18n_text_domain__ )
	);
}

// ---------- Autocompleter ----------

function getDraftCompleter(): DraftCompleter {
	const option: DraftCompleterOption = {
		id: 'jetpack-ai-draft',
		label: __( 'Draft with AI', __i18n_text_domain__ ),
		// The `/draft` command itself is not localized, so keep untranslated
		// keywords alongside the translated label the filter adds for free.
		keywords: [ 'draft', 'ai', 'write' ],
	};

	return {
		name: DRAFT_COMPLETER_NAME,
		triggerPrefix: DRAFT_TRIGGER_PREFIX,
		options: [ option ],
		getOptionKeywords: ( completerOption ) => completerOption.keywords,
		getOptionLabel: ( completerOption ) => completerOption.label,
		isOptionDisabled: () => false,
		getOptionCompletion: () => {
			triggerDraftAssist( { fromSlashCommand: true } );
			// Insert nothing: this removes the typed trigger text and leaves the
			// block empty, ready for the draft the agent is about to write.
			return { action: 'insert-at-caret', value: '' };
		},
	};
}

/**
 * `editor.Autocomplete.completers` filter callback.
 * @param completers - Completers Gutenberg is about to use for a block.
 * @returns The completers, with the draft trigger added when it applies.
 */
export function addDraftCompleter( completers: unknown[] ): unknown[] {
	if ( ! Array.isArray( completers ) || ! isDraftAssistAvailable() ) {
		return completers;
	}
	if (
		completers.some(
			( completer ) => ( completer as { name?: string } )?.name === DRAFT_COMPLETER_NAME
		)
	) {
		return completers;
	}
	return [ ...completers, getDraftCompleter() ];
}

// ---------- Registration ----------

/**
 * Register the draft assist editor entry point. No-op when the preview feature
 * is off; safe to call more than once.
 */
export function registerDraftEntry(): void {
	if ( draftEntryRegistered || typeof window === 'undefined' ) {
		return;
	}

	// The host injects `agentsManagerData` before this bundle runs, so the flag
	// is readable at registration time. The guard is only set after registering,
	// so a later call can still register if the flag was not yet available.
	if ( ! isDraftAssistEnabled() ) {
		return;
	}

	draftEntryRegistered = true;
	addFilter( 'editor.Autocomplete.completers', DRAFT_ENTRY_FILTER_NAMESPACE, addDraftCompleter );
}
