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
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import PostFeedback from './components/post-feedback';
import './components/post-feedback.scss';
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
	setModuleCheckpointApi,
	getModuleCheckpointApi,
	startBlockShimmer,
	stopBlockShimmer,
	getSelectedOrRememberedBlock,
	rememberSelectedBlock,
	clearRememberedSelectedBlock,
	notifyBlockActionComplete,
	BLOCK_ACTION_COMPLETE_EVENT,
	SELECTED_BLOCK_CLEAR_EVENT,
} from './utils/block-actions';
import {
	UPDATE_BLOCK_CONTENT_TOOL_ID,
	UPDATE_BLOCK_CONTENT_ABILITY,
	isUpdateBlockContentTool,
} from './utils/tool-provider';
import {
	type BlockTransformationSuggestionType,
	trackAiEditorialReviewSuggestionClick,
	trackAiEditorialReviewSuggestionRendered,
	trackBlockTransformationSuggestionClick,
	trackBlockTransformationSuggestionRendered,
} from './utils/tracking';
import type { ComponentType } from 'react';

// Re-export block-action helpers as part of the package's public surface.
export { applyReviewEdit, findBlockElement, findBlockListLayout };

// ---------- Module state ----------

let clearSuggestionsFn: ( () => void ) | null = null;
let wasAgentProcessing = false;
let suppressCurrentPageContentForNextContext = false;

/** Whether `_suggestion_rendered` has fired this page life (once-per-session). */
let suggestionRenderedFiredOnce = false;

/** Block transformation suggestions whose rendered event has fired this page life. */
const blockTransformationSuggestionRenderedKeys = new Set< string >();

let lastBlockTransformationSuggestionContext: {
	blockType: string;
	suggestions: BlockSuggestion[];
} | null = null;

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

const POST_FEEDBACK_SUGGESTION = {
	id: 'generate-feedback',
	label: __( 'Generate Feedback', 'jetpack' ),
	prompt: __(
		'Generate feedback for this saved post. Review the saved title and saved block content for content structure, reader clarity, completeness, media/caption/link issues, and obvious publishability concerns. Return practical feedback with one-click suggestions when safe.',
		'jetpack'
	),
};

const LIMITED_BLOCK_SUGGESTION_PRIORITY = [
	'translate',
	'check-grammar',
	'change-tone',
	'simplify-text',
	'generate-alt-text',
];

type JetpackAiSidebarPreviewFeature =
	| 'aiEditorialReview'
	| 'generateFeedback'
	| 'blockTransformations'
	| 'optimizeTitleSuggestion'
	| 'chatHistory'
	| 'supportGuides';

function getAgentsManagerData() {
	return typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;
}

function isJetpackAiSidebarPreviewFeatureEnabled(
	feature: JetpackAiSidebarPreviewFeature,
	defaultValue: boolean
): boolean {
	const preview = getAgentsManagerData()?.jetpackAiSidebarPreview;
	if ( ! preview ) {
		return defaultValue;
	}
	if ( ! preview.enabled ) {
		return false;
	}
	return preview.features?.[ feature ] === true;
}

function isAiEditorialReviewEnabled(): boolean {
	const data = getAgentsManagerData();
	if ( ! data ) {
		return false;
	}
	if ( data.jetpackAiSidebarPreview ) {
		return isJetpackAiSidebarPreviewFeatureEnabled(
			'aiEditorialReview',
			!! data.aiEditorialReviewEnabled
		);
	}
	return !! data.aiEditorialReviewEnabled || !! data.reviewMediatorEnabled;
}

function isOptimizeTitleSuggestionEnabled(): boolean {
	return isJetpackAiSidebarPreviewFeatureEnabled( 'optimizeTitleSuggestion', true );
}

function isBlockTransformationsEnabled(): boolean {
	return isJetpackAiSidebarPreviewFeatureEnabled( 'blockTransformations', true );
}

function isGenerateFeedbackEnabled(): boolean {
	return isJetpackAiSidebarPreviewFeatureEnabled( 'generateFeedback', false );
}

function getCurrentEditorPostType(): string | undefined {
	const postType = ( window as any ).wp?.data?.select?.( 'core/editor' )?.getCurrentPostType?.();
	return typeof postType === 'string' ? postType : undefined;
}

function getCurrentEditorPostId(): number | undefined {
	const postId = ( window as any ).wp?.data?.select?.( 'core/editor' )?.getCurrentPostId?.();
	return typeof postId === 'number' && postId > 0 ? postId : undefined;
}

function isAiEditorialReviewAvailable(
	// Default arguments run at call time, so callers can omit this when they
	// want the current editor state read live.
	currentPostType: string | undefined = getCurrentEditorPostType()
): boolean {
	return isAiEditorialReviewEnabled() && currentPostType === 'post';
}

function isGenerateFeedbackAvailable(
	currentPostType: string | undefined = getCurrentEditorPostType(),
	currentPostId: number | null | undefined = getCurrentEditorPostId()
): boolean {
	return isGenerateFeedbackEnabled() && currentPostType === 'post' && !! currentPostId;
}

function trackAiEditorialReviewSuggestionRenderedOnce(): void {
	if ( suggestionRenderedFiredOnce ) {
		return;
	}
	suggestionRenderedFiredOnce = true;
	trackAiEditorialReviewSuggestionRendered();
}

function getAiEditorialReviewSuggestions( currentPostType?: string ) {
	if ( ! isAiEditorialReviewAvailable( currentPostType ) ) {
		return [];
	}
	return [ AI_EDITORIAL_REVIEW_SUGGESTION ];
}

function getPostLevelSuggestions( currentPostType?: string, currentPostId?: number | null ) {
	return [
		...( isOptimizeTitleSuggestionEnabled() ? [ OPTIMIZE_TITLE_SUGGESTION ] : [] ),
		...( isGenerateFeedbackAvailable( currentPostType, currentPostId )
			? [ POST_FEEDBACK_SUGGESTION ]
			: [] ),
		...getAiEditorialReviewSuggestions( currentPostType ),
	];
}

function getReservedSuggestions< T extends { id: string } >( suggestions: T[] ): T[] {
	return [ POST_FEEDBACK_SUGGESTION.id, AI_EDITORIAL_REVIEW_SUGGESTION.id ]
		.map( ( id ) => suggestions.find( ( suggestion ) => suggestion.id === id ) )
		.filter( Boolean ) as T[];
}

function applySuggestionLimit< T extends { id: string } >(
	suggestions: T[],
	maxSuggestions?: number
): T[] {
	if (
		typeof maxSuggestions !== 'number' ||
		! Number.isFinite( maxSuggestions ) ||
		suggestions.length <= maxSuggestions
	) {
		return suggestions;
	}

	const limit = Math.floor( maxSuggestions );
	if ( limit <= 0 ) {
		return [];
	}

	const reservedSuggestions = getReservedSuggestions( suggestions );
	if ( reservedSuggestions.length === 0 ) {
		return suggestions.slice( 0, limit );
	}

	const nonAiSuggestions = suggestions
		.filter(
			( suggestion ) => ! reservedSuggestions.some( ( reserved ) => reserved.id === suggestion.id )
		)
		.sort( ( a, b ) => {
			const aPriority = LIMITED_BLOCK_SUGGESTION_PRIORITY.indexOf( a.id );
			const bPriority = LIMITED_BLOCK_SUGGESTION_PRIORITY.indexOf( b.id );
			const normalizedAPriority = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
			const normalizedBPriority = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;
			return normalizedAPriority - normalizedBPriority;
		} );

	const reservedSlots = Math.min( reservedSuggestions.length, limit );
	return [
		...nonAiSuggestions.slice( 0, limit - reservedSlots ),
		...reservedSuggestions.slice( 0, reservedSlots ),
	];
}

// ---------- Show-component ability ----------

const SHOW_COMPONENT_TOOL_ID = 'jetpack_ai__show_component';
const LEGACY_SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';
const SHOW_COMPONENT_TOOL_IDS = [ SHOW_COMPONENT_TOOL_ID, LEGACY_SHOW_COMPONENT_TOOL_ID ];

/**
 * Client-side ability definition for `jetpack_ai__show_component`.
 *
 * Surfaced to AM via `toolProvider.getAbilities()` so the orchestrator
 * recognizes Jetpack-owned component tool calls. Same pattern as
 * update-block-content.
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

const LEGACY_SHOW_COMPONENT_ABILITY: any = {
	...SHOW_COMPONENT_ABILITY,
	id: LEGACY_SHOW_COMPONENT_TOOL_ID,
	name: LEGACY_SHOW_COMPONENT_TOOL_ID,
};

function hasShowComponentType( type: unknown ): type is string {
	return typeof type === 'string' && type.trim() !== '';
}

function isJetpackShowComponentType( type: unknown ): boolean {
	return hasShowComponentType( type ) && !! getChatComponent( type );
}

function shouldDelegateLegacyShowComponent( input: any ): boolean {
	const type = input?.type;
	return hasShowComponentType( type ) && ! isJetpackShowComponentType( type );
}

/**
 * Handle Jetpack show-component calls by returning an agentMessage envelope.
 * Title picker opts into AM's
 * message-level Undo because the checkpoint API snapshots the post title.
 * @param {any} input - Tool call arguments: `{ type, props, toolCallId, ... }`.
 * @returns {Object} Result containing the `agentMessage` to re-emit.
 */
function handleShowComponent( input: any ): any {
	const { type, props } = input || {};

	if ( ! hasShowComponentType( type ) ) {
		return { success: false, error: 'show-component: missing type', returnToAgent: false };
	}

	if ( ! getChatComponent( type ) ) {
		return {
			success: false,
			error: `show-component: no component registered for type "${ type }"`,
			returnToAgent: false,
		};
	}

	const componentProps: Record< string, unknown > = { ...( props ?? {} ) };
	const data: Record< string, unknown > = {
		type,
		props: componentProps,
		isCurrent: true,
		hideZoomAction: true,
	};
	if ( type === 'review-mediation' || type === 'post-feedback' ) {
		const reviewedPostId =
			typeof componentProps.postId === 'number' && componentProps.postId > 0
				? componentProps.postId
				: getCurrentEditorPostId();
		if ( reviewedPostId ) {
			componentProps.postId = reviewedPostId;
			data.postId = reviewedPostId;
		}
	}

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

async function handleLegacyShowComponent( input: any ): Promise< any > {
	if ( shouldDelegateLegacyShowComponent( input ) ) {
		const executeAbility = getAbilitiesExecuteAbility();
		if ( executeAbility ) {
			return executeAbility( 'big-sky/show-component', input );
		}
	}

	return handleShowComponent( input );
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

function getAbilitiesExecuteAbility():
	| ( ( name: string, args: unknown ) => Promise< any > )
	| null {
	try {
		const executeAbility = ( window as any ).wp?.abilities?.executeAbility;
		return typeof executeAbility === 'function' ? executeAbility : null;
	} catch {
		return null;
	}
}

// ---------- useAbilitiesSetup ----------

/**
 * Captures AM's clearSuggestions callback and processing state so the provider
 * can hide chips and run block-edit shimmers at the right time.
 */
export function useAbilitiesSetup( actions: {
	addMessage: ( message: any ) => void;
	clearSuggestions?: () => void;
	isProcessing?: boolean;
	[ key: string ]: unknown;
} ): void {
	if ( actions.clearSuggestions ) {
		clearSuggestionsFn = actions.clearSuggestions;
	}

	const isProcessing = actions.isProcessing === true;
	if ( isProcessing && ! wasAgentProcessing ) {
		startBlockShimmer();
	} else if ( ! isProcessing && wasAgentProcessing ) {
		stopBlockShimmer();
		notifyBlockActionComplete();
	}
	wasAgentProcessing = isProcessing;
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
	return SHOW_COMPONENT_TOOL_IDS.includes( toolId );
}

export const toolProvider = {
	/**
	 * Client-side abilities this provider handles: `wpcom/update-block-content`
	 * (block edits + summary) and Jetpack show-component tools (interactive
	 * pickers, registered here so self-hosted Jetpack sees the tool_id).
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
		for ( const toolId of SHOW_COMPONENT_TOOL_IDS ) {
			abilities = filterAbility( abilities, toolId );
		}
		const jetpackAbilities = [
			...( isBlockTransformationsEnabled()
				? [
						{
							...UPDATE_BLOCK_CONTENT_ABILITY,
							callback: handleUpdateBlockContent,
						},
				  ]
				: [] ),
			{
				...SHOW_COMPONENT_ABILITY,
				callback: handleShowComponent,
			},
			{
				...LEGACY_SHOW_COMPONENT_ABILITY,
				callback: handleLegacyShowComponent,
			},
		];
		abilities.unshift( ...jetpackAbilities );
		return abilities;
	},

	/**
	 * Execute an ability by name (fallback when callback path is not used).
	 * @param {string} name - The ability identifier.
	 * @param {any}    args - Arguments to pass to the ability.
	 * @returns {Promise<any>} Execution result. Delegated abilities may return provider-specific shapes.
	 */
	async executeAbility( name: string, args: any ): Promise< any > {
		if ( isUpdateBlockContentTool( name ) ) {
			const result = await handleUpdateBlockContent( args );
			return { result, returnToAgent: false };
		}

		if ( name === LEGACY_SHOW_COMPONENT_TOOL_ID && shouldDelegateLegacyShowComponent( args ) ) {
			const executeAbility = getAbilitiesExecuteAbility();
			if ( executeAbility ) {
				return executeAbility( 'big-sky/show-component', args );
			}
		}

		if ( isShowComponentTool( name ) ) {
			return { result: handleShowComponent( args ), returnToAgent: false };
		}

		const executeAbility = getAbilitiesExecuteAbility();
		if ( executeAbility ) {
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
		const suppressCurrentPageContent = suppressCurrentPageContentForNextContext;
		suppressCurrentPageContentForNextContext = false;

		if ( wpData ) {
			const editor = wpData.select( 'core/editor' );
			currentPostType = editor?.getCurrentPostType?.();

			const blockEditor = wpData.select( 'core/block-editor' );
			if ( blockEditor ) {
				const blocks = blockEditor.getBlocks?.() ?? [];
				currentPageContent = suppressCurrentPageContent ? [] : blocks.map( serializeBlock );
				const selectedBlock = getSelectedOrRememberedBlock();
				if ( selectedBlock?.clientId ) {
					selectedBlockClientId = selectedBlock.clientId;
					rememberSelectedBlock( selectedBlock );
					if ( selectedBlock.attributes?.content ) {
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
	if ( type === 'post-feedback' ) {
		return PostFeedback as ComponentType;
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

type BlockSuggestion = {
	id: string;
	label: string;
	prompt: string;
	type: BlockTransformationSuggestionType;
	condition: ( block: any ) => boolean;
};

/** Block-aware suggestion definitions with optional condition per block type. */
const BLOCK_SUGGESTIONS: BlockSuggestion[] = [
	{
		id: 'translate',
		label: __( 'Translate content', 'jetpack' ),
		prompt: __( 'Translate this block content to:', 'jetpack' ),
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'change-tone',
		label: __( 'Change tone', 'jetpack' ),
		prompt: __( 'Change the tone of this text to be more:', 'jetpack' ),
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'check-grammar',
		label: __( 'Check grammar', 'jetpack' ),
		prompt: __( 'Check the grammar and spelling of this text', 'jetpack' ),
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'simplify-text',
		label: __( 'Simplify text', 'jetpack' ),
		prompt: __( 'Simplify this text to make it easier to read', 'jetpack' ),
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'generate-alt-text',
		label: __( 'Generate alt text', 'jetpack' ),
		prompt: __( 'Generate descriptive alt text for this image', 'jetpack' ),
		type: 'image',
		condition: ( block: any ) => IMAGE_BLOCK_TYPES.includes( block?.name ),
	},
];

function matchesBlockTransformationSuggestion(
	suggestion: BlockSuggestion,
	value: string
): boolean {
	return [ suggestion.id, suggestion.label, suggestion.prompt ].includes( value );
}

function getBlockTransformationSuggestionForValue(
	value: string,
	suggestions: BlockSuggestion[]
): BlockSuggestion | undefined {
	return suggestions.find( ( suggestion ) =>
		matchesBlockTransformationSuggestion( suggestion, value )
	);
}

function trackRenderedBlockTransformationSuggestions(
	suggestions: BlockSuggestion[],
	block: any
): void {
	if ( typeof block?.name !== 'string' ) {
		return;
	}

	lastBlockTransformationSuggestionContext = {
		blockType: block.name,
		suggestions,
	};

	suggestions.forEach( ( suggestion ) => {
		const renderedKey = `${ suggestion.id }:${ block.name }`;
		if ( blockTransformationSuggestionRenderedKeys.has( renderedKey ) ) {
			return;
		}
		blockTransformationSuggestionRenderedKeys.add( renderedKey );
		trackBlockTransformationSuggestionRendered( {
			suggestionId: suggestion.id,
			suggestionType: suggestion.type,
			blockType: block.name,
		} );
	} );
}

function trackBlockTransformationSuggestionClickForValue( value: string ): void {
	if ( ! isBlockTransformationsEnabled() ) {
		return;
	}

	const selectedBlock = getSelectedOrRememberedBlock();
	if ( typeof selectedBlock?.name === 'string' ) {
		const selectedBlockSuggestion = getBlockTransformationSuggestionForValue(
			value,
			BLOCK_SUGGESTIONS.filter( ( suggestion ) => suggestion.condition( selectedBlock ) )
		);
		if ( selectedBlockSuggestion ) {
			trackBlockTransformationSuggestionClick( {
				suggestionId: selectedBlockSuggestion.id,
				suggestionType: selectedBlockSuggestion.type,
				blockType: selectedBlock.name,
			} );
			return;
		}
	}

	const lastRenderedContext = lastBlockTransformationSuggestionContext;
	const lastRenderedSuggestion = lastRenderedContext
		? getBlockTransformationSuggestionForValue( value, lastRenderedContext.suggestions )
		: undefined;
	if ( ! lastRenderedContext || ! lastRenderedSuggestion ) {
		return;
	}

	trackBlockTransformationSuggestionClick( {
		suggestionId: lastRenderedSuggestion.id,
		suggestionType: lastRenderedSuggestion.type,
		blockType: lastRenderedContext.blockType,
	} );
}

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
export function useSuggestions(
	maxSuggestions?: number,
	{ suggestionsVisible = true }: { suggestionsVisible?: boolean } = {}
): {
	suggestions: Array< { id: string; label: string; prompt?: string } >;
} {
	const [ hidden, setHidden ] = useState( false );

	useEffect( () => {
		const handleSuggestionClick = ( event: Event ) => {
			const value = ( event as CustomEvent ).detail?.value;

			setHidden( true );
			clearSuggestionsFn?.();
			suppressCurrentPageContentForNextContext = false;

			// Review-style responses are dense, so auto-expand those suggestion
			// flows to 50vw when they are started from chips.
			if ( typeof value === 'string' ) {
				trackBlockTransformationSuggestionClickForValue( value );
			}
			if ( typeof value === 'string' && value === POST_FEEDBACK_SUGGESTION.prompt ) {
				suppressCurrentPageContentForNextContext = true;
				try {
					( dispatch as any )( 'automattic/agents-manager' ).setIsSplitScreen( true );
				} catch {
					// Store not registered yet (e.g. tests); split-screen is demo polish.
				}
			}
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
		window.addEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick, true );
		return () => {
			window.removeEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick, true );
		};
	}, [] );

	useEffect( () => {
		const handleBlockActionComplete = () => {
			setHidden( false );
		};
		window.addEventListener( BLOCK_ACTION_COMPLETE_EVENT, handleBlockActionComplete );
		return () => {
			window.removeEventListener( BLOCK_ACTION_COMPLETE_EVENT, handleBlockActionComplete );
		};
	}, [] );

	useEffect( () => {
		const handleSelectedBlockClear = () => {
			clearRememberedSelectedBlock();
			setHidden( false );
		};
		window.addEventListener( SELECTED_BLOCK_CLEAR_EVENT, handleSelectedBlockClear );
		return () => {
			window.removeEventListener( SELECTED_BLOCK_CLEAR_EVENT, handleSelectedBlockClear );
		};
	}, [] );

	const editorContext = useSelect( ( select ) => {
		const blockEditor = select( 'core/block-editor' ) as { getSelectedBlock?: () => any };
		const editor = select( 'core/editor' ) as {
			getCurrentPostId?: () => number | null | undefined;
			getCurrentPostType?: () => string | undefined;
		};
		return {
			selectedBlock: blockEditor?.getSelectedBlock?.() ?? null,
			postId: editor?.getCurrentPostId?.(),
			postType: editor?.getCurrentPostType?.(),
		};
	}, [] );

	// Re-show suggestions when block selection changes (unless conversation is active)
	useEffect( () => {
		setHidden( false );
	}, [ editorContext.selectedBlock?.clientId ] );

	const selectedBlock = editorContext.selectedBlock;
	const aiEditorialReviewSuggestions = useMemo(
		() => getAiEditorialReviewSuggestions( editorContext.postType ),
		[ editorContext.postType ]
	);
	const postLevelSuggestions = useMemo(
		() => getPostLevelSuggestions( editorContext.postType, editorContext.postId ),
		[ editorContext.postId, editorContext.postType ]
	);
	const blockTransformationsEnabled = isBlockTransformationsEnabled();
	const applicable = useMemo(
		() =>
			selectedBlock && blockTransformationsEnabled
				? BLOCK_SUGGESTIONS.filter( ( suggestion ) => suggestion.condition( selectedBlock ) )
				: [],
		[ blockTransformationsEnabled, selectedBlock ]
	);
	const blockTransformationSuggestions = useMemo(
		() => applicable.map( ( { id, label, prompt } ) => ( { id, label, prompt } ) ),
		[ applicable ]
	);
	const visibleSuggestions = useMemo( () => {
		if ( hidden ) {
			return [];
		}

		if ( ! selectedBlock ) {
			return applySuggestionLimit( postLevelSuggestions, maxSuggestions );
		}

		if ( ! blockTransformationsEnabled ) {
			return applySuggestionLimit(
				[
					...( isGenerateFeedbackAvailable( editorContext.postType, editorContext.postId )
						? [ POST_FEEDBACK_SUGGESTION ]
						: [] ),
					...aiEditorialReviewSuggestions,
				],
				maxSuggestions
			);
		}

		return applySuggestionLimit(
			[
				...blockTransformationSuggestions,
				...( isGenerateFeedbackAvailable( editorContext.postType, editorContext.postId )
					? [ POST_FEEDBACK_SUGGESTION ]
					: [] ),
				...aiEditorialReviewSuggestions,
			],
			maxSuggestions
		);
	}, [
		aiEditorialReviewSuggestions,
		blockTransformationSuggestions,
		blockTransformationsEnabled,
		editorContext.postId,
		editorContext.postType,
		hidden,
		maxSuggestions,
		postLevelSuggestions,
		selectedBlock,
	] );
	const visibleSuggestionIds = useMemo(
		() => new Set( visibleSuggestions.map( ( suggestion ) => suggestion.id ) ),
		[ visibleSuggestions ]
	);
	const visibleBlockTransformationSuggestions = useMemo(
		() => applicable.filter( ( suggestion ) => visibleSuggestionIds.has( suggestion.id ) ),
		[ applicable, visibleSuggestionIds ]
	);
	const visibleBlockTransformationSuggestionsKey = visibleBlockTransformationSuggestions
		.map( ( suggestion ) => suggestion.id )
		.join( '|' );
	const isAiEditorialReviewSuggestionVisible = visibleSuggestionIds.has(
		AI_EDITORIAL_REVIEW_SUGGESTION.id
	);

	useEffect( () => {
		if ( editorContext.selectedBlock ) {
			rememberSelectedBlock( editorContext.selectedBlock );
		}
	}, [ editorContext.selectedBlock?.clientId, editorContext.selectedBlock ] );

	useEffect( () => {
		if ( ! suggestionsVisible || hidden || ! isAiEditorialReviewSuggestionVisible ) {
			return;
		}
		trackAiEditorialReviewSuggestionRenderedOnce();
	}, [ hidden, isAiEditorialReviewSuggestionVisible, suggestionsVisible ] );

	useEffect( () => {
		if (
			! suggestionsVisible ||
			hidden ||
			! selectedBlock ||
			! blockTransformationsEnabled ||
			visibleBlockTransformationSuggestions.length === 0
		) {
			return;
		}
		trackRenderedBlockTransformationSuggestions(
			visibleBlockTransformationSuggestions,
			selectedBlock
		);
	}, [
		blockTransformationsEnabled,
		hidden,
		selectedBlock,
		selectedBlock?.name,
		suggestionsVisible,
		visibleBlockTransformationSuggestions,
		visibleBlockTransformationSuggestions.length,
		visibleBlockTransformationSuggestionsKey,
	] );

	return { suggestions: visibleSuggestions };
}
