/**
 * Jetpack AI provider module for Agents Manager — implements the AM provider
 * contract (toolProvider, contextProvider, getChatComponent, useCheckpoint,
 * getEmptyViewSuggestions, useSuggestions, useAbilitiesSetup).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * WordPress dependencies
 */
import { dispatch, useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import ReviewMediation from './components/review-mediation';
import './components/review-mediation.scss';
import TitlePicker from './components/title-picker';
import './components/title-picker.scss';
import './auto-scroll-fix.scss';
import {
	type CheckpointApi,
	applyReviewEdit,
	findBlockElement,
	findBlockListLayout,
	handleUpdateBlockContent,
	setAddMessageFn,
	setModuleCheckpointApi,
	getModuleCheckpointApi,
	startBlockShimmer,
} from './utils/block-actions';
import {
	UPDATE_BLOCK_CONTENT_TOOL_ID,
	UPDATE_BLOCK_CONTENT_ABILITY,
	isUpdateBlockContentTool,
} from './utils/tool-provider';
import {
	trackAiEditorialReviewSuggestionClick,
	trackAiEditorialReviewSuggestionRendered,
} from './utils/tracking';
import type { ComponentType } from 'react';

// Re-export block-action helpers as part of the package's public surface.
export { applyReviewEdit, findBlockElement, findBlockListLayout };

// ---------- Module state ----------

let clearSuggestionsFn: ( () => void ) | null = null;

/** Whether `_suggestion_rendered` has fired this page life (once-per-session). */
let suggestionRenderedFiredOnce = false;

/** Default suggestion shown when no block is selected. */
const OPTIMIZE_TITLE_SUGGESTION = {
	id: 'optimize-title',
	label: __( 'Optimize Title', 'jetpack' ),
	prompt: __( 'Optimize the title of this post', 'jetpack' ),
};

/**
 * Post-level suggestion to run AI Editorial Review on a draft.
 *
 * The id remains stable because saved chats/tests may still refer to the
 * original review-mediation identifier.
 */
const AI_EDITORIAL_REVIEW_SUGGESTION = {
	id: 'mediate-review-notes',
	label: __( 'AI Editorial Review', 'jetpack' ),
	prompt: __(
		'Run an AI Editorial Review for this post. Check the content, reviewer notes, and site guidelines, then surface conflicts, implications, guideline issues, and suggested edits.',
		'jetpack'
	),
};

function isAiEditorialReviewEnabled(): boolean {
	return typeof agentsManagerData !== 'undefined' && !! agentsManagerData?.reviewMediatorEnabled;
}

function getCurrentEditorPostType(): string | undefined {
	const postType = ( window as any ).wp?.data?.select?.( 'core/editor' )?.getCurrentPostType?.();
	return typeof postType === 'string' ? postType : undefined;
}

function isAiEditorialReviewAvailable(
	// Default arguments run at call time, so callers can omit this when they
	// want the current editor state read live.
	currentPostType: string | undefined = getCurrentEditorPostType()
): boolean {
	return isAiEditorialReviewEnabled() && currentPostType === 'post';
}

function getAiEditorialReviewSuggestions( currentPostType?: string ) {
	if ( ! isAiEditorialReviewAvailable( currentPostType ) ) {
		return [];
	}
	if ( ! suggestionRenderedFiredOnce ) {
		suggestionRenderedFiredOnce = true;
		trackAiEditorialReviewSuggestionRendered();
	}
	return [ AI_EDITORIAL_REVIEW_SUGGESTION ];
}

function getPostLevelSuggestions( currentPostType?: string ) {
	return [ OPTIMIZE_TITLE_SUGGESTION, ...getAiEditorialReviewSuggestions( currentPostType ) ];
}

// ---------- Show-component ability ----------

const SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';

/**
 * Client-side ability definition for `big_sky__show_component`.
 *
 * Surfaced to AM via `toolProvider.getAbilities()` so the orchestrator
 * recognizes the tool_id on self-hosted Jetpack sites where Big Sky's own
 * registration isn't present. Same pattern as update-block-content.
 */
const SHOW_COMPONENT_ABILITY: any = {
	id: SHOW_COMPONENT_TOOL_ID,
	name: SHOW_COMPONENT_TOOL_ID,
	label: 'Show component',
	category: 'jetpack-ai',
	description: 'Render an interactive component in the chat.',
	input_schema: {
		type: 'object',
		properties: {
			type: { type: 'string' },
			props: { type: 'object' },
		},
		required: [ 'type' ],
	},
};

/**
 * Handle `big_sky__show_component` by returning an agentMessage envelope
 * (Big Sky unified-experience pattern). Title picker opts into AM's
 * message-level Undo because the checkpoint API snapshots the post title.
 * @param {any} input - Tool call arguments: `{ type, props, toolCallId, ... }`.
 * @returns {Object} Result containing the `agentMessage` to re-emit.
 */
function handleShowComponent( input: any ): any {
	const { type, props } = input || {};

	if ( ! type ) {
		return { success: false, error: 'show-component: missing type', returnToAgent: false };
	}

	if ( ! getChatComponent( type ) ) {
		return {
			success: false,
			error: `show-component: no component registered for type "${ type }"`,
			returnToAgent: false,
		};
	}

	const data: Record< string, unknown > = {
		type,
		props: props ?? {},
		isCurrent: true,
		hideZoomAction: true,
	};

	if ( type === 'title-picker' ) {
		// Snapshot state for Undo. Tool call id doubles as the checkpoint id so
		// it matches the identifier AM reads from the rendered message.
		const checkpointId: string =
			input?.toolCallId || input?.calypsoCheckpointId || `show-component-${ type }-${ Date.now() }`;
		const checkpointApi = getModuleCheckpointApi();
		if ( checkpointApi && ! checkpointApi.hasCheckpoint( checkpointId ) ) {
			try {
				checkpointApi.setCheckpoint( checkpointId );
			} catch {
				// Non-fatal — Undo just won't attach if the snapshot fails.
			}
		}
		data.calypsoCheckpointId = checkpointId;
	}

	const agentMessage = JSON.stringify( {
		tool_id: SHOW_COMPONENT_TOOL_ID,
		data,
	} );

	return {
		result: 'Component displayed successfully',
		returnToAgent: false,
		agentMessage,
	};
}

/**
 * Check whether the `@wordpress/abilities` API is available.
 * @returns {boolean} True when window.wp.abilities.getAbilities exists.
 */
function hasAbilitiesApi(): boolean {
	try {
		return !! ( window as any ).wp?.abilities?.getAbilities;
	} catch {
		return false;
	}
}

// ---------- useAbilitiesSetup ----------

/**
 * Captures AM's addMessage/clearSuggestions callbacks so the
 * update-block-content handler can post a summary line after applying edits.
 */
export function useAbilitiesSetup( actions: {
	addMessage: ( message: any ) => void;
	clearSuggestions?: () => void;
	[ key: string ]: unknown;
} ): void {
	setAddMessageFn( actions.addMessage );
	if ( actions.clearSuggestions ) {
		clearSuggestionsFn = actions.clearSuggestions;
	}
}

// ---------- toolProvider ----------

/**
 * Normalize an ability name to the format used by agenttic-client for matching.
 * @param {string} name - Ability name (e.g., 'wpcom/update-block-content').
 * @returns {string} Normalized name (e.g., 'wpcom__update_block_content').
 */
function normalizeAbilityName( name: string ): string {
	return name.replace( /\//g, '__' ).replace( /-/g, '_' );
}

/**
 * Filter out an ability by name from a list.
 * @param {any[]}  abilities - List of abilities.
 * @param {string} toolId    - Tool ID to remove.
 * @returns {any[]} Filtered list.
 */
function filterAbility( abilities: any[], toolId: string ): any[] {
	const normalized = normalizeAbilityName( toolId );
	return abilities.filter(
		( a: any ) => normalizeAbilityName( a.name ?? '' ) !== normalized && a.name !== toolId
	);
}

function isShowComponentTool( toolId: string ): boolean {
	return toolId === SHOW_COMPONENT_TOOL_ID || toolId === 'big_sky__show_component';
}

export const toolProvider = {
	/**
	 * Client-side abilities this provider handles: `wpcom/update-block-content`
	 * (block edits + summary) and `big_sky__show_component` (interactive pickers,
	 * registered here so self-hosted Jetpack sees the tool_id).
	 * @returns {Promise<any[]>} Array of ability descriptors.
	 */
	async getAbilities(): Promise< any[] > {
		let abilities: any[] = [];

		if ( hasAbilitiesApi() ) {
			try {
				const { getAbilities } = ( window as any ).wp.abilities;
				const wpAbilities = await getAbilities();
				if ( Array.isArray( wpAbilities ) ) {
					abilities = wpAbilities;
				}
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.warn( '[Jetpack AI] Failed to load WP abilities:', e );
			}
		}

		abilities = filterAbility( abilities, UPDATE_BLOCK_CONTENT_TOOL_ID );
		abilities = filterAbility( abilities, SHOW_COMPONENT_TOOL_ID );
		abilities.unshift(
			{
				...UPDATE_BLOCK_CONTENT_ABILITY,
				callback: handleUpdateBlockContent,
			},
			{
				...SHOW_COMPONENT_ABILITY,
				callback: handleShowComponent,
			}
		);

		return abilities;
	},

	/**
	 * Execute an ability by name (fallback when callback path is not used).
	 * @param {string} name - The ability identifier.
	 * @param {any}    args - Arguments to pass to the ability.
	 * @returns {Promise<{result: Record<string, unknown>, returnToAgent?: boolean}>} Execution result.
	 */
	async executeAbility(
		name: string,
		args: any
	): Promise< { result: Record< string, unknown >; returnToAgent?: boolean } > {
		if ( isUpdateBlockContentTool( name ) ) {
			const result = await handleUpdateBlockContent( args );
			return { result, returnToAgent: false };
		}

		if ( isShowComponentTool( name ) ) {
			return { result: handleShowComponent( args ), returnToAgent: false };
		}

		if ( hasAbilitiesApi() ) {
			const { executeAbility } = ( window as any ).wp.abilities;
			return executeAbility( name, args );
		}

		return { result: { error: `Unknown ability: ${ name }` } };
	},
};

// ---------- contextProvider ----------

/**
 * Serialize a block for the orchestrator's Page context class.
 * @param {any} block - The block to serialize.
 * @returns {any} Serialized block with name, clientId, attributes, innerBlocks.
 */
function serializeBlock( block: any ): any {
	return {
		name: block.name,
		clientId: block.clientId,
		attributes: block.attributes,
		innerBlocks: ( block.innerBlocks || [] ).map( serializeBlock ),
	};
}

/**
 * Extract the full text content from a block's content attribute.
 * Handles both plain strings and RichTextData objects.
 * @param {any} rawContent - The block's content attribute value.
 * @returns {string} The resolved HTML string.
 */
function resolveBlockContent( rawContent: any ): string {
	if ( typeof rawContent === 'string' ) {
		return rawContent;
	}
	if ( rawContent?.toHTMLString ) {
		return rawContent.toHTMLString();
	}
	return '';
}

/**
 * Provides gutenberg editor state to the orchestrator via client context.
 */
export const contextProvider = {
	/**
	 * Build the client context object sent with each message.
	 * @returns {any} Context with page content, selected block, and block content.
	 */
	getClientContext(): any {
		const wpData = ( window as any ).wp?.data;
		let currentPageContent: any[] = [];
		let selectedBlockClientId = '';
		let selectedBlockContent = '';
		let currentPostType: string | undefined;

		if ( wpData ) {
			const editor = wpData.select( 'core/editor' );
			currentPostType = editor?.getCurrentPostType?.();

			const blockEditor = wpData.select( 'core/block-editor' );
			if ( blockEditor ) {
				const blocks = blockEditor.getBlocks?.() ?? [];
				currentPageContent = blocks.map( serializeBlock );
				selectedBlockClientId = blockEditor.getSelectedBlockClientId?.() ?? '';

				if ( selectedBlockClientId ) {
					const selectedBlock = blockEditor.getSelectedBlock?.();
					if ( selectedBlock?.attributes?.content ) {
						selectedBlockContent = resolveBlockContent( selectedBlock.attributes.content );
					}
				}
			}
		}

		return {
			url: window.location.href,
			pathname: window.location.pathname,
			search: window.location.search,
			environment: 'gutenberg',
			titleSuggestionCount: 3,
			currentScreen: {
				url: window.location.href,
				...( currentPostType && { postType: currentPostType } ),
			},
			currentPageContent,
			selectedBlockClientId,
			contextEntries: [
				{
					id: 'selected-block-content',
					type: 'selected-block-content',
					data: selectedBlockContent ? { content: selectedBlockContent } : null,
				},
			],
		};
	},
};

// ---------- getChatComponent ----------

/**
 * Map component type strings to React components for rendering in the chat.
 * @param {string} type - The component type identifier.
 * @returns {ComponentType|null} The matching component, or null.
 */
export function getChatComponent( type: string ): ComponentType | null {
	if ( type === 'title-picker' ) {
		return TitlePicker as ComponentType;
	}
	if ( type === 'review-mediation' ) {
		return ReviewMediation as ComponentType;
	}
	return null;
}

// ---------- useCheckpoint ----------

/**
 * Provider hook consumed by AM's `use-checkpoint-action` so Undo buttons
 * can attach to show-component messages. Snapshots the post title on
 * `setCheckpoint(id)` and restores it on `restoreCheckpoint(id)` via
 * `core/editor` dispatch. Stubs the rest of AM's `UseCheckpointReturn`
 * interface — only the three methods above are used on this path.
 * @returns {Object} The checkpoint API AM consumes.
 */
const titleSnapshots: Map< string, string > = new Map();

export function useCheckpoint(): any {
	const api: CheckpointApi = {
		setCheckpoint( id: string ) {
			const wpData = ( window as any ).wp?.data;
			const current =
				( wpData?.select?.( 'core/editor' )?.getEditedPostAttribute?.( 'title' ) as string ) ?? '';
			titleSnapshots.set( id, current );
		},
		hasCheckpoint( id: string ): boolean {
			return titleSnapshots.has( id );
		},
		async restoreCheckpoint( id: string ): Promise< void > {
			const previous = titleSnapshots.get( id );
			if ( previous === undefined ) {
				return;
			}
			const wpData = ( window as any ).wp?.data;
			wpData?.dispatch?.( 'core/editor' )?.editPost?.( { title: previous } );
			// Keep snapshot so the user can re-Undo back to the original title.
			// clearCheckpoint() removes it when AM resets the session.
		},
	};
	setModuleCheckpointApi( api );

	// Return the full shape AM's UseCheckpointReturn expects. Methods we
	// don't implement are safe no-op stubs — AM only calls the three above
	// for the show-component / title-picker flow.
	return {
		...api,
		getLastEditorState: () => null,
		addCheckpointKeys: () => undefined,
		addNewPageToCheckpoint: () => undefined,
		addPageRenameToCheckpoint: () => undefined,
		addPageRemovalToCheckpoint: () => undefined,
		getLatestUserMessageId: () => undefined,
		clearCheckpoint: ( id: string ) => {
			titleSnapshots.delete( id );
		},
	};
}

// ---------- getEmptyViewSuggestions ----------

/**
 * Suggestions shown in the AM empty view (before any messages).
 * @returns {Array} Array of suggestion objects.
 */
export function getEmptyViewSuggestions(): Array< {
	id: string;
	label: string;
	prompt?: string;
} > {
	return getPostLevelSuggestions();
}

// ---------- useSuggestions ----------

/** Block types that support text editing suggestions. */
const TEXT_BLOCK_TYPES = [ 'core/paragraph', 'core/heading' ];

/** Block types that support image-related suggestions. */
const IMAGE_BLOCK_TYPES = [ 'core/image', 'core/media-text', 'core/cover', 'core/gallery' ];

/** Block-aware suggestion definitions with optional condition per block type. */
const BLOCK_SUGGESTIONS = [
	{
		id: 'translate-content',
		label: __( 'Translate content', 'jetpack' ),
		prompt: __( 'Translate this block content to:', 'jetpack' ),
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'change-tone',
		label: __( 'Change tone', 'jetpack' ),
		prompt: __( 'Change the tone of this text to be more:', 'jetpack' ),
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'check-grammar',
		label: __( 'Check grammar', 'jetpack' ),
		prompt: __( 'Check the grammar and spelling of this text', 'jetpack' ),
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'simplify-text',
		label: __( 'Simplify text', 'jetpack' ),
		prompt: __( 'Simplify this text to make it easier to read', 'jetpack' ),
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'generate-alt-text',
		label: __( 'Generate alt text', 'jetpack' ),
		prompt: __( 'Generate descriptive alt text for this image', 'jetpack' ),
		condition: ( block: any ) => IMAGE_BLOCK_TYPES.includes( block?.name ),
	},
];

// ---------- capabilities ----------

/**
 * Provider capability flags (OR-merged across providers by AM's
 * loadExternalProviders). `supportsSplitScreen` exposes the 50vw chat-header
 * toggle here only — block-notes / image-studio / Big Sky don't opt in.
 */
export const capabilities = {
	supportsSplitScreen: true,
};

/**
 * Block-aware dynamic suggestions for the AM sidebar.
 *
 * Returns contextual suggestions based on the selected block type.
 * Hides permanently once the conversation becomes active.
 * @returns {Object} Object containing a suggestions array.
 */
export function useSuggestions(): {
	suggestions: Array< { id: string; label: string; prompt?: string } >;
} {
	const [ hidden, setHidden ] = useState( false );

	useEffect( () => {
		const handleSuggestionClick = ( event: Event ) => {
			setHidden( true );
			clearSuggestionsFn?.();
			startBlockShimmer();

			// AI Editorial Review output is too dense for the 350px sidebar.
			// Auto-expand to 50vw on that suggestion only (matched by prompt).
			const value = ( event as CustomEvent ).detail?.value;
			if (
				isAiEditorialReviewAvailable() &&
				typeof value === 'string' &&
				value === AI_EDITORIAL_REVIEW_SUGGESTION.prompt
			) {
				trackAiEditorialReviewSuggestionClick();
				try {
					( dispatch as any )( 'automattic/agents-manager' ).setIsSplitScreen( true );
				} catch {
					// Store not registered yet (e.g. tests); split-screen is a
					// polish feature, so a silent no-op is the right fallback.
				}
			}
		};
		window.addEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick );
		return () => {
			window.removeEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick );
		};
	}, [] );

	const editorContext = useSelect( ( select ) => {
		const blockEditor = select( 'core/block-editor' ) as { getSelectedBlock: () => any };
		const editor = select( 'core/editor' ) as { getCurrentPostType?: () => string | undefined };
		return {
			selectedBlock: blockEditor.getSelectedBlock(),
			postType: editor.getCurrentPostType?.(),
		};
	}, [] );

	// Re-show suggestions when block selection changes (unless conversation is active)
	useEffect( () => {
		setHidden( false );
	}, [ editorContext.selectedBlock?.clientId ] );

	if ( hidden ) {
		return { suggestions: [] };
	}

	if ( ! editorContext.selectedBlock ) {
		return { suggestions: getPostLevelSuggestions( editorContext.postType ) };
	}

	const applicable = BLOCK_SUGGESTIONS.filter( ( s ) =>
		s.condition( editorContext.selectedBlock )
	);
	return {
		suggestions: applicable.map( ( { id, label, prompt } ) => ( { id, label, prompt } ) ),
	};
}
