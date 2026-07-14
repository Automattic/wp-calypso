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
import { __, _x } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import ExcerptPicker from './components/excerpt-picker';
import './components/feedback-list.scss';
import ImageAltTextPicker from './components/image-alt-text-picker';
import './components/image-alt-text-picker.scss';
import PostFeedback from './components/post-feedback';
import Proofread from './components/proofread';
import ReviewMediation from './components/review-mediation';
import './components/review-mediation.scss';
import SeoDescriptionPicker from './components/seo-description-picker';
import SeoTitlePicker from './components/seo-title-picker';
import './components/base-suggestion-picker.scss';
import TitlePicker from './components/title-picker';
import './auto-scroll-fix.scss';
import {
	type CheckpointApi,
	type CheckpointField,
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
	isAiEditorialReviewEnabled,
	isBlockTransformationsEnabled,
	isExcerptSuggestionEnabled,
	isGenerateFeedbackEnabled,
	isProofreadEnabled,
	isOptimizeTitleSuggestionEnabled,
	isSeoSuggestionsEnabled,
} from './utils/preview-features';
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
import type { SuggestionOption } from '@automattic/agenttic-client';
import type { ComponentType } from 'react';

// Re-export block-action helpers as part of the package's public surface.
export { applyReviewEdit, findBlockElement, findBlockListLayout };
export { registerBlockEditorFilters } from './extensions';

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
	label: __( 'Optimize Title', __i18n_text_domain__ ),
	description: __(
		'Refine the title based on your post’s content and SEO best practices.',
		__i18n_text_domain__
	),
	prompt: __( 'Optimize the title of this post', __i18n_text_domain__ ),
};

/**
 * Post-level suggestion to generate the post excerpt. Routes through the
 * orchestrator to the jetpack-ai/generate-excerpt ability, which returns the
 * excerpt picker. The prompt is deliberately parameter-free: words/tone
 * defaults live server-side, and the picker intro invites adjustments.
 */
const GENERATE_EXCERPT_SUGGESTION = {
	id: 'generate-excerpt',
	label: __( 'Generate Excerpt', __i18n_text_domain__ ),
	description: __( 'Generate an excerpt for your post.', __i18n_text_domain__ ),
	prompt: __( 'Generate an excerpt for this post', __i18n_text_domain__ ),
};

/**
 * Post-level SEO Enhancer suggestion. Targets the post's SEO surfaces (the HTML
 * <title>, meta description, and image alt text), distinct from
 * OPTIMIZE_TITLE_SUGGESTION which rewrites the visible post title. Rendered as a
 * dropdown (via the `options` field): picking Title, Description or Image Alt
 * Text submits that option's `value`, which routes through the orchestrator to
 * the jetpack-ai/generate-seo-title, jetpack-ai/generate-seo-description or jetpack-ai/generate-seo-image-alt-text
 * ability and returns the matching picker. Alt text is post-level here (every
 * image in the post); the block-level `generate-alt-text` suggestion still
 * targets a single selected image.
 *
 * `prompt` is intentionally empty: the dropdown combines `prompt` with the
 * selected option's `value`, so an empty prompt makes the submitted text equal
 * the option value verbatim (a missing prompt would fall back to the label and
 * prepend "SEO Enhancer", breaking routing).
 */
const SEO_ENHANCER_SUGGESTION = {
	id: 'seo-enhancer',
	label: __( 'SEO Enhancer', __i18n_text_domain__ ),
	description: __(
		'Generate metadata for the contents of the post to optimize SEO.',
		__i18n_text_domain__
	),
	prompt: '',
	options: [
		{
			id: 'seo-title',
			label: _x( 'Title', 'SEO Enhancer dropdown option', __i18n_text_domain__ ),
			value: __( 'Generate an SEO title (meta title) for this post', __i18n_text_domain__ ),
		},
		{
			id: 'seo-description',
			label: _x( 'Description', 'SEO Enhancer dropdown option', __i18n_text_domain__ ),
			value: __( 'Generate an SEO meta description for this post', __i18n_text_domain__ ),
		},
		{
			id: 'image-alt-text',
			label: _x( 'Image Alt Text', 'SEO Enhancer dropdown option', __i18n_text_domain__ ),
			value: __(
				'Generate descriptive alt text for the images in this post',
				__i18n_text_domain__
			),
		},
	],
};

/**
 * Post-level suggestion to run AI Editorial Review on a draft.
 *
 * The id remains stable because saved chats/tests may still refer to the
 * original review-mediation identifier.
 */
const AI_EDITORIAL_REVIEW_SUGGESTION = {
	id: 'mediate-review-notes',
	label: __( 'Editorial Review', __i18n_text_domain__ ),
	description: __( 'In-depth review against your content guidelines.', __i18n_text_domain__ ),
	prompt: __(
		'Run an AI Editorial Review for this post. Check the content, reviewer notes, and site guidelines, then surface conflicts, implications, guideline issues, and suggested edits.',
		__i18n_text_domain__
	),
};

const POST_FEEDBACK_SUGGESTION = {
	id: 'generate-feedback',
	label: __( 'Simple Review', __i18n_text_domain__ ),
	description: __( 'Quick feedback on your content’s structure.', __i18n_text_domain__ ),
	prompt: __(
		'Generate feedback for this saved post. Review the saved title and saved block content for content structure, reader clarity, completeness, media/caption/link issues, and obvious publishability concerns. Return practical feedback with one-click suggestions when safe.',
		__i18n_text_domain__
	),
};

const PROOFREAD_SUGGESTION = {
	id: 'proofread-content',
	label: __( 'Proofread', __i18n_text_domain__ ),
	description: __( 'Correct spelling, grammar, and punctuation.', __i18n_text_domain__ ),
	prompt: __(
		'Proofread this saved post for spelling, grammar, and punctuation. Review the saved title and saved block content, and return practical fixes with one-click suggestions when safe.',
		__i18n_text_domain__
	),
};

const LIMITED_BLOCK_SUGGESTION_PRIORITY = [
	'translate',
	'check-grammar',
	'change-tone',
	'simplify-text',
	'generate-alt-text',
];

function getCurrentEditorPostType(): string | undefined {
	const postType = ( window as any ).wp?.data?.select?.( 'core/editor' )?.getCurrentPostType?.();
	return typeof postType === 'string' ? postType : undefined;
}

function getCurrentEditorPostId(): number | undefined {
	const postId = ( window as any ).wp?.data?.select?.( 'core/editor' )?.getCurrentPostId?.();
	return typeof postId === 'number' && postId > 0 ? postId : undefined;
}

/**
 * Whether a post type supports excerpts, given its (possibly still-resolving)
 * core store record. While the record is unresolved, fall back to the core
 * default — only 'post' supports excerpts — so one-shot callers (the empty
 * view suggestions) don't permanently hide the chip on a slow resolution.
 */
function postTypeRecordSupportsExcerpt(
	currentPostType: string | undefined,
	postTypeRecord: { supports?: Record< string, boolean > } | undefined
): boolean {
	if ( ! currentPostType ) {
		return false;
	}
	if ( ! postTypeRecord ) {
		return currentPostType === 'post';
	}
	return postTypeRecord.supports?.excerpt === true;
}

function currentPostTypeSupportsExcerpt(
	currentPostType: string | undefined = getCurrentEditorPostType()
): boolean {
	if ( ! currentPostType ) {
		return false;
	}
	const postTypeRecord = ( window as any ).wp?.data
		?.select?.( 'core' )
		?.getPostType?.( currentPostType );
	return postTypeRecordSupportsExcerpt( currentPostType, postTypeRecord );
}

/**
 * Post types where the excerpt field acts as a description (templates,
 * template parts, patterns). Core registers excerpt support for wp_block, but
 * the legacy AI Excerpt panel excludes these types and so does the chip.
 */
const EXCERPT_EXCLUDED_POST_TYPES = [ 'wp_template', 'wp_template_part', 'wp_block' ];

function isExcerptSuggestionAvailable(
	currentPostType: string | undefined = getCurrentEditorPostType(),
	supportsExcerpt?: boolean
): boolean {
	// Check the flag first: on flag-off sites the core-store getPostType read
	// (which can trigger a REST resolution) never runs.
	if ( ! isExcerptSuggestionEnabled() ) {
		return false;
	}
	if ( ! currentPostType || EXCERPT_EXCLUDED_POST_TYPES.includes( currentPostType ) ) {
		return false;
	}
	return supportsExcerpt ?? currentPostTypeSupportsExcerpt( currentPostType );
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

function isProofreadAvailable(
	currentPostType: string | undefined = getCurrentEditorPostType(),
	currentPostId: number | null | undefined = getCurrentEditorPostId()
): boolean {
	return isProofreadEnabled() && currentPostType === 'post' && !! currentPostId;
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

function getPostLevelSuggestions(
	currentPostType?: string,
	currentPostId?: number | null,
	supportsExcerpt?: boolean
) {
	return [
		...( isOptimizeTitleSuggestionEnabled() ? [ OPTIMIZE_TITLE_SUGGESTION ] : [] ),
		...( isExcerptSuggestionAvailable( currentPostType, supportsExcerpt )
			? [ GENERATE_EXCERPT_SUGGESTION ]
			: [] ),
		...( isGenerateFeedbackAvailable( currentPostType, currentPostId )
			? [ POST_FEEDBACK_SUGGESTION ]
			: [] ),
		...( isProofreadAvailable( currentPostType, currentPostId ) ? [ PROOFREAD_SUGGESTION ] : [] ),
		...getAiEditorialReviewSuggestions( currentPostType ),
		// Surface the SEO Enhancer dropdown last.
		...( isSeoSuggestionsEnabled() ? [ SEO_ENHANCER_SUGGESTION ] : [] ),
	];
}

function getReservedSuggestions< T extends { id: string } >( suggestions: T[] ): T[] {
	return [ POST_FEEDBACK_SUGGESTION.id, PROOFREAD_SUGGESTION.id, AI_EDITORIAL_REVIEW_SUGGESTION.id ]
		.map( ( id ) => suggestions.find( ( suggestion ) => suggestion.id === id ) )
		.filter( Boolean ) as T[];
}

/** Rank a suggestion id by its position in the priority list; unranked ids sort last. */
function priorityRank( id: string ): number {
	const index = LIMITED_BLOCK_SUGGESTION_PRIORITY.indexOf( id );
	return index === -1 ? Number.MAX_SAFE_INTEGER : index;
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
		.sort( ( a, b ) => priorityRank( a.id ) - priorityRank( b.id ) );

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
	if ( type === 'review-mediation' || type === 'post-feedback' || type === 'proofread' ) {
		const reviewedPostId =
			typeof componentProps.postId === 'number' && componentProps.postId > 0
				? componentProps.postId
				: getCurrentEditorPostId();
		if ( reviewedPostId ) {
			componentProps.postId = reviewedPostId;
			data.postId = reviewedPostId;
		}
	}

	if (
		type === 'title-picker' ||
		type === 'excerpt-picker' ||
		type === 'seo-title-picker' ||
		type === 'seo-description-picker' ||
		type === 'image-alt-text-picker'
	) {
		// Snapshot state for Undo (these pickers mutate post data / block
		// attributes). Tool call id doubles as the checkpoint id so it matches
		// the identifier AM reads from the rendered message. Only the
		// supported post fields for this picker are snapshot (title/excerpt —
		// meta and block-attribute changes aren't checkpointed), so restoring
		// its checkpoint cannot clobber later edits to other fields.
		const checkpointFields: CheckpointField[] =
			type === 'excerpt-picker' ? [ 'excerpt' ] : [ 'title' ];
		const checkpointId: string =
			input?.toolCallId || input?.calypsoCheckpointId || `show-component-${ type }-${ Date.now() }`;
		const checkpointApi = getModuleCheckpointApi();
		if ( checkpointApi && ! checkpointApi.hasCheckpoint( checkpointId ) ) {
			try {
				checkpointApi.setCheckpoint( checkpointId, checkpointFields );
			} catch {
				// Non-fatal — Undo just won't attach if the snapshot fails.
			}
		}
		data.calypsoCheckpointId = checkpointId;
	}

	data.followUpTasks = input?.followUpTasks ?? false;

	// Echo the tool call id at the top level: the server-stored copy of this
	// message carries it, and AM dedupes show-component messages by
	// `tool_call_id|type|summary` — without it the two copies of the same tool
	// call get different identities and both render after a reload.
	const toolCallId =
		typeof input?.toolCallId === 'string' && input.toolCallId ? input.toolCallId : undefined;
	const agentMessage = JSON.stringify( {
		tool_id: SHOW_COMPONENT_TOOL_ID,
		...( toolCallId && { tool_call_id: toolCallId } ),
		data,
	} );

	return {
		result: 'Component displayed successfully',
		returnToAgent: data.followUpTasks,
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
			// Forward the host's SEO Enhancer verdict (plan + Jetpack SEO Tools
			// module + kill switches) so the orchestrator can drop the SEO
			// suggestion abilities when they aren't usable on this site — e.g. a
			// free-text query on a self-hosted site with the SEO module disabled.
			jetpackSEOSuggestionsEnabled: isSeoSuggestionsEnabled(),
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
	if ( type === 'excerpt-picker' ) {
		return ExcerptPicker as ComponentType;
	}
	if ( type === 'title-picker' ) {
		return TitlePicker as ComponentType;
	}
	if ( type === 'seo-title-picker' ) {
		return SeoTitlePicker as ComponentType;
	}
	if ( type === 'seo-description-picker' ) {
		return SeoDescriptionPicker as ComponentType;
	}
	if ( type === 'image-alt-text-picker' ) {
		return ImageAltTextPicker as ComponentType;
	}
	if ( type === 'review-mediation' ) {
		return ReviewMediation as ComponentType;
	}
	if ( type === 'post-feedback' ) {
		return PostFeedback as ComponentType;
	}
	if ( type === 'proofread' ) {
		return Proofread as ComponentType;
	}
	return null;
}

// ---------- useCheckpoint ----------

/**
 * Provider hook consumed by AM's `use-checkpoint-action` so Undo buttons
 * can attach to show-component messages. Snapshots the selected top-level
 * post fields (title by default, excerpt for the excerpt picker) on
 * `setCheckpoint(id, fields)` and restores exactly those fields on
 * `restoreCheckpoint(id)` via `core/editor` dispatch — restoring one picker's
 * checkpoint must not clobber another field's later edits. Only title and
 * excerpt are supported: meta (SEO pickers) and block-attribute (image alt
 * text) changes are not checkpointed. Stubs the rest of AM's
 * `UseCheckpointReturn` interface — only the three methods above are used on
 * this path.
 * @returns {Object} The checkpoint API AM consumes.
 */
const postSnapshots: Map< string, Partial< Record< CheckpointField, string > > > = new Map();

export function useCheckpoint(): any {
	const api: CheckpointApi = {
		setCheckpoint( id: string, fields: CheckpointField[] = [ 'title' ] ) {
			const editor = ( window as any ).wp?.data?.select?.( 'core/editor' );
			const snapshot: Partial< Record< CheckpointField, string > > = {};
			for ( const field of fields ) {
				snapshot[ field ] = ( editor?.getEditedPostAttribute?.( field ) as string ) ?? '';
			}
			postSnapshots.set( id, snapshot );
		},
		hasCheckpoint( id: string ): boolean {
			return postSnapshots.has( id );
		},
		async restoreCheckpoint( id: string ): Promise< void > {
			const previous = postSnapshots.get( id );
			if ( previous === undefined ) {
				return;
			}
			const wpData = ( window as any ).wp?.data;
			wpData?.dispatch?.( 'core/editor' )?.editPost?.( { ...previous } );
			// Keep snapshot so the user can re-Undo back to the original values.
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
			postSnapshots.delete( id );
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
	description?: string;
	prompt?: string;
	options?: SuggestionOption[];
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
	options?: SuggestionOption[];
};

/** Change-tone dropdown options; `value` is the full localized prompt filled on selection. */
const CHANGE_TONE_OPTIONS: SuggestionOption[] = [
	{
		id: 'formal',
		label: `🎩 ${ _x( 'Formal', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more formal', __i18n_text_domain__ ),
	},
	{
		id: 'informal',
		label: `😊 ${ _x( 'Informal', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more informal', __i18n_text_domain__ ),
	},
	{
		id: 'optimistic',
		label: `😃 ${ _x( 'Optimistic', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more optimistic', __i18n_text_domain__ ),
	},
	{
		id: 'humorous',
		label: `😂 ${ _x( 'Humorous', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more humorous', __i18n_text_domain__ ),
	},
	{
		id: 'serious',
		label: `😐 ${ _x( 'Serious', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more serious', __i18n_text_domain__ ),
	},
	{
		id: 'skeptical',
		label: `🤨 ${ _x( 'Skeptical', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more skeptical', __i18n_text_domain__ ),
	},
	{
		id: 'empathetic',
		label: `💗 ${ _x( 'Empathetic', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more empathetic', __i18n_text_domain__ ),
	},
	{
		id: 'confident',
		label: `😎 ${ _x( 'Confident', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more confident', __i18n_text_domain__ ),
	},
	{
		id: 'passionate',
		label: `❤️ ${ _x( 'Passionate', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more passionate', __i18n_text_domain__ ),
	},
	{
		id: 'provocative',
		label: `🔥 ${ _x( 'Provocative', 'Change tone dropdown option', __i18n_text_domain__ ) }`,
		value: __( 'Change the tone of this text to be more provocative', __i18n_text_domain__ ),
	},
];

/** Translate dropdown target languages; `value` is the full localized prompt filled on selection. */
const TRANSLATE_LANGUAGE_OPTIONS: SuggestionOption[] = [
	{
		id: 'en',
		label: _x( 'English', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to English', __i18n_text_domain__ ),
	},
	{
		id: 'es',
		label: _x( 'Spanish', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Spanish', __i18n_text_domain__ ),
	},
	{
		id: 'fr',
		label: _x( 'French', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to French', __i18n_text_domain__ ),
	},
	{
		id: 'de',
		label: _x( 'German', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to German', __i18n_text_domain__ ),
	},
	{
		id: 'it',
		label: _x( 'Italian', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Italian', __i18n_text_domain__ ),
	},
	{
		id: 'pt',
		label: _x( 'Portuguese', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Portuguese', __i18n_text_domain__ ),
	},
	{
		id: 'ru',
		label: _x( 'Russian', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Russian', __i18n_text_domain__ ),
	},
	{
		id: 'zh',
		label: _x( 'Chinese', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Chinese', __i18n_text_domain__ ),
	},
	{
		id: 'ja',
		label: _x( 'Japanese', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Japanese', __i18n_text_domain__ ),
	},
	{
		id: 'ar',
		label: _x( 'Arabic', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Arabic', __i18n_text_domain__ ),
	},
	{
		id: 'hi',
		label: _x( 'Hindi', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Hindi', __i18n_text_domain__ ),
	},
	{
		id: 'ko',
		label: _x( 'Korean', 'Translate content dropdown option', __i18n_text_domain__ ),
		value: __( 'Translate this block content to Korean', __i18n_text_domain__ ),
	},
];

/** Block-aware suggestion definitions with optional condition per block type. */
const BLOCK_SUGGESTIONS: BlockSuggestion[] = [
	{
		id: 'translate',
		label: __( 'Translate content', __i18n_text_domain__ ),
		// Empty prompt — the picked option's `value` is the full prompt sent.
		prompt: '',
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
		options: TRANSLATE_LANGUAGE_OPTIONS,
	},
	{
		id: 'change-tone',
		label: __( 'Change tone', __i18n_text_domain__ ),
		prompt: '',
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
		options: CHANGE_TONE_OPTIONS,
	},
	{
		id: 'check-grammar',
		label: __( 'Check grammar', __i18n_text_domain__ ),
		prompt: __( 'Check the grammar and spelling of this text', __i18n_text_domain__ ),
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'simplify-text',
		label: __( 'Simplify text', __i18n_text_domain__ ),
		prompt: __( 'Simplify this text to make it easier to read', __i18n_text_domain__ ),
		type: 'text',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'generate-alt-text',
		label: __( 'Generate alt text', __i18n_text_domain__ ),
		prompt: __( 'Generate descriptive alt text for this image', __i18n_text_domain__ ),
		type: 'image',
		condition: ( block: any ) => IMAGE_BLOCK_TYPES.includes( block?.name ),
	},
];

type BlockTransformationSuggestionMatch = {
	suggestion: BlockSuggestion;
	option?: SuggestionOption;
};

/**
 * Resolve a dispatched click value to its suggestion and the picked option.
 * Option-bearing suggestions use an empty prompt, so the value is the option's.
 */
function matchBlockTransformationSuggestion(
	suggestion: BlockSuggestion,
	value: string
): BlockTransformationSuggestionMatch | undefined {
	const option = suggestion.options?.find( ( candidate ) => candidate.value === value );
	if ( option ) {
		return { suggestion, option };
	}
	// `filter( Boolean )` drops an empty prompt so a blank value can't false-match.
	if (
		[ suggestion.id, suggestion.label, suggestion.prompt ].filter( Boolean ).includes( value )
	) {
		return { suggestion };
	}
	return undefined;
}

function getBlockTransformationSuggestionMatchForValue(
	value: string,
	suggestions: BlockSuggestion[]
): BlockTransformationSuggestionMatch | undefined {
	for ( const suggestion of suggestions ) {
		const match = matchBlockTransformationSuggestion( suggestion, value );
		if ( match ) {
			return match;
		}
	}
	return undefined;
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
		const selectedBlockMatch = getBlockTransformationSuggestionMatchForValue(
			value,
			BLOCK_SUGGESTIONS.filter( ( suggestion ) => suggestion.condition( selectedBlock ) )
		);
		if ( selectedBlockMatch ) {
			trackBlockTransformationSuggestionClick( {
				suggestionId: selectedBlockMatch.suggestion.id,
				suggestionType: selectedBlockMatch.suggestion.type,
				blockType: selectedBlock.name,
				optionId: selectedBlockMatch.option?.id,
			} );
			return;
		}
	}

	const lastRenderedContext = lastBlockTransformationSuggestionContext;
	const lastRenderedMatch = lastRenderedContext
		? getBlockTransformationSuggestionMatchForValue( value, lastRenderedContext.suggestions )
		: undefined;
	if ( ! lastRenderedContext || ! lastRenderedMatch ) {
		return;
	}

	trackBlockTransformationSuggestionClick( {
		suggestionId: lastRenderedMatch.suggestion.id,
		suggestionType: lastRenderedMatch.suggestion.type,
		blockType: lastRenderedContext.blockType,
		optionId: lastRenderedMatch.option?.id,
	} );
}

// ---------- capabilities ----------

/**
 * Provider capability flags (OR-merged across providers by AM's
 * loadExternalProviders). These opt the Jetpack AI sidebar into AM features
 * that are not enabled globally.
 */
export const capabilities = {
	supportsSplitScreen: true,
	// Flip to `true` to enable regenerate in the Jetpack AI sidebar.
	supportsRegenerateAction: false,
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
	suggestions: Array< {
		id: string;
		label: string;
		description?: string;
		prompt?: string;
		options?: SuggestionOption[];
	} >;
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
			if ( typeof value === 'string' && value === PROOFREAD_SUGGESTION.prompt ) {
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
		const core = select( 'core' ) as {
			getPostType?: ( name: string ) => { supports?: Record< string, boolean > } | undefined;
		};
		const postType = editor?.getCurrentPostType?.();
		return {
			selectedBlock: blockEditor?.getSelectedBlock?.() ?? null,
			postId: editor?.getCurrentPostId?.(),
			postType,
			supportsExcerpt:
				postType && isExcerptSuggestionEnabled()
					? postTypeRecordSupportsExcerpt( postType, core?.getPostType?.( postType ) )
					: false,
		};
	}, [] );

	// Re-show suggestions when block selection changes (unless conversation is active)
	useEffect( () => {
		setHidden( false );
	}, [ editorContext.selectedBlock?.clientId ] );

	const selectedBlock = editorContext.selectedBlock;
	const postLevelSuggestions = useMemo(
		() =>
			getPostLevelSuggestions(
				editorContext.postType,
				editorContext.postId,
				editorContext.supportsExcerpt
			),
		[ editorContext.postId, editorContext.postType, editorContext.supportsExcerpt ]
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
		() =>
			applicable.map( ( { id, label, prompt, options } ) => ( { id, label, prompt, options } ) ),
		[ applicable ]
	);
	// Post-level reviews (Optimize Title, Generate Feedback, AI Editorial Review)
	// show only with no block selected; a selected block shows block transforms.
	const visibleSuggestions = useMemo( () => {
		if ( hidden ) {
			return [];
		}
		// Both branches narrow to this shared shape; the explicit annotation lets
		// the generic applySuggestionLimit infer a single element type across them.
		const activeSuggestions: Array< {
			id: string;
			label: string;
			prompt: string;
			options?: SuggestionOption[];
		} > = selectedBlock ? blockTransformationSuggestions : postLevelSuggestions;
		return applySuggestionLimit( activeSuggestions, maxSuggestions );
	}, [
		blockTransformationSuggestions,
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
