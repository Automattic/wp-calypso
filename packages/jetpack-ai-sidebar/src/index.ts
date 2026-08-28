/**
 * Jetpack AI provider module for Agents Manager — implements the AM provider
 * contract (toolProvider, contextProvider, getChatComponent, useCheckpoint,
 * getEmptyViewSuggestions, useSuggestions, useAbilitiesSetup).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * WordPress dependencies
 */
import { serialize } from '@wordpress/blocks';
import { select as selectDataStore, useSelect } from '@wordpress/data';
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import AiEditorialReview from './components/ai-editorial-review';
import './components/ai-editorial-review.scss';
import './components/block-ref.scss';
import ExcerptPicker from './components/excerpt-picker';
import './components/feedback-list.scss';
import ImageAltTextPicker from './components/image-alt-text-picker';
import './components/image-alt-text-picker.scss';
import PostFeedback from './components/post-feedback';
import Proofread from './components/proofread';
import './components/split-screen-guide.scss';
import SeoDescriptionPicker from './components/seo-description-picker';
import SeoTitlePicker from './components/seo-title-picker';
import './components/base-suggestion-picker.scss';
import TitlePicker from './components/title-picker';
import './auto-scroll-fix.scss';
import {
	APPLY_DRAFT_CONTENT_ABILITY,
	APPLY_DRAFT_CONTENT_ABILITY_NAME,
	handleApplyDraftContent,
	isApplyDraftContentTool,
} from './utils/apply-draft-content';
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
	canUndoBlockEdit,
	undoBlockEdit,
	BLOCK_ACTION_COMPLETE_EVENT,
	SELECTED_BLOCK_CLEAR_EVENT,
} from './utils/block-actions';
import { isDraftAssistPostType } from './utils/draft-assist';
import {
	isImageStudioAvailable,
	openImageStudioForBlock,
	openImageStudioForFeaturedImage,
} from './utils/image-studio';
import {
	isAiEditorialReviewEnabled,
	isBlockTransformationsEnabled,
	isDraftAssistEnabled,
	isExcerptSuggestionEnabled,
	isGenerateFeedbackEnabled,
	isProofreadEnabled,
	isOptimizeTitleSuggestionEnabled,
	isSeoSuggestionsEnabled,
} from './utils/preview-features';
import {
	getCurrentEditorPostIdFromStore as getCurrentEditorPostId,
	normalizeEditorPostId,
	type EditorPostId,
} from './utils/review-post-context';
import { SUGGESTION_ACTION_COMPLETE_EVENT } from './utils/suggestion-events';
import {
	UPDATE_BLOCK_CONTENT_TOOL_ID,
	UPDATE_BLOCK_CONTENT_ABILITY,
	isUpdateBlockContentTool,
} from './utils/tool-provider';
import { getResponseRenderedTrackingProperties } from './utils/tracking';
import type { SuggestionOption } from '@automattic/agenttic-client';
import type { ComponentType } from 'react';

// Re-export block-action helpers as part of the package's public surface.
export { applyReviewEdit, findBlockElement, findBlockListLayout };
export { registerBlockEditorFilters } from './extensions';

// ---------- Module state ----------

let clearSuggestionsFn: ( () => void ) | null = null;
let wasAgentProcessing = false;
let pendingBlockShimmerClientId: string | null = null;
let blockShimmerStartedForRequest = false;
let suppressCurrentPageContentForNextContext = false;

type BlockEditSnapshot = {
	clientId: string;
	contentBefore: string;
	contentAfter: string;
	editableAttribute?: string;
	editorBlocksSignatureAfter: string | undefined;
};

const blockEditSnapshots = new Map< string, BlockEditSnapshot >();
const editorBlocksSignatures = new WeakMap< any[], string >();

function getCurrentEditorBlocks(): any[] | undefined {
	try {
		const blockEditor = selectDataStore( 'core/block-editor' ) as {
			getBlocks?: () => any[];
		};
		const blocks = blockEditor?.getBlocks?.();
		return Array.isArray( blocks ) ? blocks : undefined;
	} catch {
		return undefined;
	}
}

function getEditorBlocksSignature( blocks: any[] | undefined ): string | undefined {
	if ( ! blocks ) {
		return undefined;
	}
	const cachedSignature = editorBlocksSignatures.get( blocks );
	if ( cachedSignature !== undefined ) {
		return cachedSignature;
	}

	try {
		const signature = serialize( blocks );
		editorBlocksSignatures.set( blocks, signature );
		return signature;
	} catch {
		return undefined;
	}
}

function canSwapBlockEditSnapshot( snapshot: BlockEditSnapshot ): boolean {
	if (
		! canUndoBlockEdit( snapshot.clientId, snapshot.contentAfter, snapshot.editableAttribute )
	) {
		return false;
	}
	if ( snapshot.editorBlocksSignatureAfter === undefined ) {
		return false;
	}

	const currentEditorBlocks = getCurrentEditorBlocks();
	return (
		currentEditorBlocks !== undefined &&
		getEditorBlocksSignature( currentEditorBlocks ) === snapshot.editorBlocksSignatureAfter
	);
}

/**
 * Uses the selector the legacy "Improve with AI" panel gates on. It is blocks-only
 * and never reads the title, so a titled post with no body counts as empty. An
 * editor that cannot answer reports "not empty", so nothing greys out on a store
 * we cannot read.
 */
function isPostContentEmpty(): boolean {
	const isEditedPostEmpty = ( window as any ).wp?.data?.select?.( 'core/editor' )
		?.isEditedPostEmpty;
	return typeof isEditedPostEmpty === 'function' && isEditedPostEmpty() === true;
}

/** Default suggestion shown when no block is selected. */
const OPTIMIZE_TITLE_SUGGESTION = {
	id: 'optimize-title',
	label: __( 'Optimize Title', __i18n_text_domain__ ),
	prompt: __( 'Optimize the title of this post', __i18n_text_domain__ ),
};

/**
 * Editor-level suggestion to write a first draft into the open post.
 *
 * Only offered on an empty post: it is the one editor action that needs a blank
 * canvas rather than existing content, which is also why it sits first — on an
 * empty post every other suggestion here has nothing to work on.
 *
 * The prompt matches the `/draft` editor trigger exactly, so both entry points
 * start the same conversation and the assistant cannot behave differently
 * depending on which one the writer used.
 */
function getDraftSuggestion( contentType: 'post' | 'page' ) {
	return {
		id: 'draft-post',
		label: __( 'Write a draft', __i18n_text_domain__ ),
		// Say which one. The suggestion is offered for pages too, and asking for "this
		// post" on a page contradicts the contentType the ability is given, which shapes
		// the output — an article rather than a sectioned page.
		prompt:
			'page' === contentType
				? __( 'Help me draft this page', __i18n_text_domain__ )
				: __( 'Help me draft this post', __i18n_text_domain__ ),
	};
}

/**
 * Post-level suggestion that opens Image Studio directly instead of routing
 * through the agent — same "action instead of prompt" escape hatch the
 * block-level generate-image/edit-image suggestions use. Always opens in
 * generate mode: it creates a new image and overwrites whatever featured
 * image is currently set, it does not pre-load the existing one for editing.
 */
const GENERATE_FEATURED_IMAGE_SUGGESTION = {
	id: 'generate-featured-image',
	label: __( 'Generate featured image', __i18n_text_domain__ ),
	prompt: '',
	action: () => ! openImageStudioForFeaturedImage(),
};

/**
 * Editor-level suggestion to generate the current content excerpt. Routes through the
 * orchestrator to the jetpack-ai/generate-excerpt ability, which returns the
 * excerpt picker. The prompt is deliberately parameter-free: words/tone
 * defaults live server-side, and the picker intro invites adjustments.
 */
const GENERATE_EXCERPT_SUGGESTION = {
	id: 'generate-excerpt',
	label: __( 'Generate Excerpt', __i18n_text_domain__ ),
	prompt: __( 'Generate an excerpt for this post', __i18n_text_domain__ ),
};

/**
 * Editor-level SEO Enhancer suggestion. Targets the content's SEO surfaces (the HTML
 * <title>, meta description, and image alt text), distinct from
 * OPTIMIZE_TITLE_SUGGESTION which rewrites the visible post title. Rendered as a
 * dropdown (via the `options` field): picking Title, Description or Image Alt
 * Text submits that option's `value`, which routes through the orchestrator to
 * the jetpack-ai/generate-seo-title, jetpack-ai/generate-seo-description or jetpack-ai/generate-seo-image-alt-text
 * ability and returns the matching picker. Alt text is content-level here
 * (every image in the editor content); the block-level `generate-alt-text`
 * suggestion still targets a single selected image.
 *
 * `prompt` is intentionally empty: the dropdown combines `prompt` with the
 * selected option's `value`, so an empty prompt makes the submitted text equal
 * the option value verbatim (a missing prompt would fall back to the label and
 * prepend "SEO Enhancer", breaking routing).
 */
const SEO_ENHANCER_SUGGESTION = {
	id: 'seo-enhancer',
	label: __( 'SEO Enhancer', __i18n_text_domain__ ),
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
 * The three review tools share one dropdown. Each option's `value` is the whole
 * prompt, which the dropdown submits verbatim because the parent `prompt` is empty
 * — the same arrangement SEO Enhancer uses.
 */
const GET_FEEDBACK_SUGGESTION_ID = 'get-feedback';

const AI_EDITORIAL_REVIEW_OPTION = {
	id: 'ai-editorial-review',
	label: __( 'In-depth review against guidelines', __i18n_text_domain__ ),
	value: __(
		'Run an AI Editorial Review for this post. Check the content, reviewer notes, and site guidelines, then surface conflicts, implications, guideline issues, and suggested edits.',
		__i18n_text_domain__
	),
};

const POST_FEEDBACK_OPTION = {
	id: 'generate-feedback',
	label: __( 'Quick feedback on structure', __i18n_text_domain__ ),
	value: __(
		'Generate feedback for this saved post. Review the saved title and saved block content for content structure, reader clarity, completeness, media/caption/link issues, and obvious publishability concerns. Return practical feedback with one-click suggestions when safe.',
		__i18n_text_domain__
	),
};

const PROOFREAD_OPTION = {
	id: 'proofread-content',
	label: __( 'Spelling and grammar check', __i18n_text_domain__ ),
	value: __(
		'Proofread this saved post for spelling, grammar, and punctuation. Review the saved title and saved block content, and return practical fixes with one-click suggestions when safe.',
		__i18n_text_domain__
	),
};

/**
 * Both abilities read the saved post, so the edited page content would mislead
 * them. Matched by prompt rather than id: a dropdown submits its parent's id.
 */
const SAVED_POST_PROMPTS: Set< string > = new Set( [
	POST_FEEDBACK_OPTION.value,
	PROOFREAD_OPTION.value,
] );

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
 * Unresolved counts as supported: only posts and pages reach this chip, and
 * both register it. Registering a support with arguments stores those
 * arguments, so match the editor and treat any truthy value as support.
 * @see checkSupport in @wordpress/editor
 */
function postTypeRecordSupportsThumbnail(
	postTypeRecord: { supports?: Record< string, unknown > } | undefined
): boolean {
	if ( ! postTypeRecord ) {
		return true;
	}
	return !! postTypeRecord.supports?.thumbnail;
}

/**
 * Themes can pass a list of post types to add_theme_support, so the support is
 * a boolean or a list.
 * @see PostFeaturedImageCheck in @wordpress/editor
 */
function themeSupportsThumbnail(
	currentPostType: string,
	themeSupports: { 'post-thumbnails'?: boolean | string[] } | undefined
): boolean {
	// core-data returns {} until the theme resolves; a resolved theme always has the key.
	const support = themeSupports?.[ 'post-thumbnails' ];
	if ( support === undefined ) {
		return true;
	}
	return Array.isArray( support ) ? support.includes( currentPostType ) : !! support;
}

/**
 * The post type and theme checks the editor makes before it renders the
 * featured image panel. The editor hides the panel while either one is still
 * resolving; the chip shows instead, so a slow read never hides it for good.
 */
function currentPostTypeSupportsFeaturedImage(
	currentPostType: string | undefined = getCurrentEditorPostType()
): boolean {
	if ( ! currentPostType ) {
		return false;
	}
	const coreStore = ( window as any ).wp?.data?.select?.( 'core' );
	return (
		postTypeRecordSupportsThumbnail( coreStore?.getPostType?.( currentPostType ) ) &&
		themeSupportsThumbnail( currentPostType, coreStore?.getThemeSupports?.() )
	);
}

/**
 * Whether to offer writing a draft.
 *
 * Mirrors the `/draft` entry point: the feature flag, a post type draft assist
 * writes into, and an empty post. Offering it on a post with content would
 * promise something the ability then refuses, which reads as a broken button.
 * @param currentPostType - The post type currently open in the editor.
 * @returns Whether the suggestion should be shown.
 */
function isDraftSuggestionAvailable( currentPostType?: string ): boolean {
	if ( ! isDraftAssistEnabled() || ! isDraftAssistPostType( currentPostType ) ) {
		return false;
	}

	return isPostContentEmpty();
}

function isFeaturedImageSuggestionAvailable(
	currentPostType: string | undefined = getCurrentEditorPostType()
): boolean {
	// Image Studio first: the core-store reads can trigger a REST resolution.
	if ( ! isImageStudioAvailable() ) {
		return false;
	}
	return currentPostTypeSupportsFeaturedImage( currentPostType );
}

/**
 * Editor entities that support whole-content Jetpack AI suggestions.
 */
const EDITOR_LEVEL_SUGGESTION_POST_TYPES = new Set( [ 'post', 'page' ] );

function isEditorLevelSuggestionPostType(
	currentPostType: string | undefined = getCurrentEditorPostType()
): boolean {
	return EDITOR_LEVEL_SUGGESTION_POST_TYPES.has( currentPostType ?? '' );
}

function isExcerptSuggestionAvailable(
	currentPostType: string | undefined = getCurrentEditorPostType(),
	supportsExcerpt?: boolean
): boolean {
	// Check the flag first: on flag-off sites the core-store getPostType read
	// (which can trigger a REST resolution) never runs.
	if ( ! isExcerptSuggestionEnabled() ) {
		return false;
	}
	if ( ! currentPostType ) {
		return false;
	}
	return supportsExcerpt ?? currentPostTypeSupportsExcerpt( currentPostType );
}

function isAiEditorialReviewAvailable(
	// Default arguments run at call time, so callers can omit this when they
	// want the current editor state read live.
	currentPostType: string | undefined = getCurrentEditorPostType()
): boolean {
	return isAiEditorialReviewEnabled() && isEditorLevelSuggestionPostType( currentPostType );
}

function isGenerateFeedbackAvailable(
	currentPostType: string | undefined = getCurrentEditorPostType(),
	currentPostId: EditorPostId | null | undefined = getCurrentEditorPostId()
): boolean {
	return (
		isGenerateFeedbackEnabled() &&
		isEditorLevelSuggestionPostType( currentPostType ) &&
		!! currentPostId
	);
}

function isProofreadAvailable(
	currentPostType: string | undefined = getCurrentEditorPostType(),
	currentPostId: EditorPostId | null | undefined = getCurrentEditorPostId()
): boolean {
	return (
		isProofreadEnabled() && isEditorLevelSuggestionPostType( currentPostType ) && !! currentPostId
	);
}

/**
 * The review tools as one dropdown, carrying only the options this post qualifies
 * for. With none available the dropdown is dropped entirely.
 */
function getFeedbackSuggestions( currentPostType?: string, currentPostId?: EditorPostId | null ) {
	const options = [
		...( isGenerateFeedbackAvailable( currentPostType, currentPostId )
			? [ POST_FEEDBACK_OPTION ]
			: [] ),
		...( isProofreadAvailable( currentPostType, currentPostId ) ? [ PROOFREAD_OPTION ] : [] ),
		...( isAiEditorialReviewAvailable( currentPostType ) ? [ AI_EDITORIAL_REVIEW_OPTION ] : [] ),
	];

	if ( options.length === 0 ) {
		return [];
	}

	return [
		{
			id: GET_FEEDBACK_SUGGESTION_ID,
			label: __( 'Get feedback', __i18n_text_domain__ ),
			// Empty, so the dropdown submits the picked option's value verbatim.
			prompt: '',
			options,
		},
	];
}

/**
 * `generate-featured-image` is absent on purpose: it opens Image Studio, where the
 * user writes their own prompt.
 */
const CONTENT_DEPENDENT_SUGGESTION_IDS: Set< string > = new Set( [
	OPTIMIZE_TITLE_SUGGESTION.id,
	GENERATE_EXCERPT_SUGGESTION.id,
	// Every review behind this chip needs content, so the chip gates as a whole.
	GET_FEEDBACK_SUGGESTION_ID,
	SEO_ENHANCER_SUGGESTION.id,
] );

function getContentRequiredReason(): string {
	return __( 'This feature requires content to work.', __i18n_text_domain__ );
}

function getPostLevelSuggestions(
	currentPostType?: string,
	currentPostId?: EditorPostId | null,
	supportsExcerpt?: boolean
) {
	if ( ! isEditorLevelSuggestionPostType( currentPostType ) ) {
		return [];
	}

	const suggestions = [
		// First: on an empty post this is the only one of these that can do anything.
		...( isDraftSuggestionAvailable( currentPostType )
			? [ getDraftSuggestion( currentPostType === 'page' ? 'page' : 'post' ) ]
			: [] ),
		...( isFeaturedImageSuggestionAvailable( currentPostType )
			? [ GENERATE_FEATURED_IMAGE_SUGGESTION ]
			: [] ),
		...( isOptimizeTitleSuggestionEnabled() ? [ OPTIMIZE_TITLE_SUGGESTION ] : [] ),
		...( isExcerptSuggestionAvailable( currentPostType, supportsExcerpt )
			? [ GENERATE_EXCERPT_SUGGESTION ]
			: [] ),
		...getFeedbackSuggestions( currentPostType, currentPostId ),
		// Surface the SEO Enhancer dropdown last.
		...( isSeoSuggestionsEnabled() ? [ SEO_ENHANCER_SUGGESTION ] : [] ),
	];

	if ( ! isPostContentEmpty() ) {
		return suggestions;
	}

	// Greyed out rather than dropped, so a blank post still shows what is on offer.
	const disabledReason = getContentRequiredReason();

	return suggestions.map( ( suggestion ) =>
		CONTENT_DEPENDENT_SUGGESTION_IDS.has( suggestion.id )
			? { ...suggestion, disabled: true, disabledReason }
			: suggestion
	);
}

function getReservedSuggestions< T extends { id: string } >( suggestions: T[] ): T[] {
	return [ GET_FEEDBACK_SUGGESTION_ID ]
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
const UPDATE_BLOCK_CONTENT_AGENT_TOOL_ID = 'wpcom__update_block_content';
const SHOW_COMPONENT_ABILITY_NAME = 'jetpack-ai/show-component';
const LEGACY_SHOW_COMPONENT_ABILITY_NAME = 'big-sky/show-component';
const SHOW_COMPONENT_TOOL_IDS = [ SHOW_COMPONENT_TOOL_ID, LEGACY_SHOW_COMPONENT_TOOL_ID ];

/**
 * Client-side ability definition for `jetpack-ai/show-component`.
 *
 * Surfaced to AM via `toolProvider.getAbilities()` so the orchestrator
 * recognizes Jetpack-owned component tool calls. Same pattern as
 * update-block-content.
 */
const SHOW_COMPONENT_ABILITY: any = {
	id: SHOW_COMPONENT_TOOL_ID,
	name: SHOW_COMPONENT_ABILITY_NAME,
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
	name: LEGACY_SHOW_COMPONENT_ABILITY_NAME,
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
	const responseTrackingProperties = getResponseRenderedTrackingProperties( type, componentProps );
	if ( responseTrackingProperties ) {
		data.responseTrackingProperties = responseTrackingProperties;
	}
	if ( type === 'ai-editorial-review' || type === 'post-feedback' || type === 'proofread' ) {
		const reviewedPostId =
			normalizeEditorPostId( componentProps.postId ) ?? getCurrentEditorPostId();
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
 * Captures AM's clearSuggestions callback and starts request-time shimmer only
 * for a known contextual block transformation.
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
	if ( isProcessing && ! wasAgentProcessing && pendingBlockShimmerClientId ) {
		startBlockShimmer( pendingBlockShimmerClientId );
		blockShimmerStartedForRequest = true;
	} else if ( ! isProcessing && wasAgentProcessing ) {
		stopBlockShimmer();
		if ( blockShimmerStartedForRequest ) {
			notifyBlockActionComplete();
		}
		pendingBlockShimmerClientId = null;
		blockShimmerStartedForRequest = false;
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
	return (
		SHOW_COMPONENT_TOOL_IDS.includes( toolId ) ||
		toolId === SHOW_COMPONENT_ABILITY_NAME ||
		toolId === LEGACY_SHOW_COMPONENT_ABILITY_NAME
	);
}

function isLegacyShowComponentTool( toolId: string ): boolean {
	return toolId === LEGACY_SHOW_COMPONENT_TOOL_ID || toolId === LEGACY_SHOW_COMPONENT_ABILITY_NAME;
}

function createUpdateBlockContentAgentMessage(
	toolCallId: string,
	result: Record< string, unknown >
): string {
	return JSON.stringify( {
		tool_id: UPDATE_BLOCK_CONTENT_AGENT_TOOL_ID,
		tool_call_id: toolCallId,
		data: {
			result,
			followUpTasks: false,
		},
	} );
}

async function handleUpdateBlockContentForChat( input: any ): Promise< any > {
	const toolCallId =
		typeof input?.toolCallId === 'string' && input.toolCallId ? input.toolCallId : undefined;
	const result = await handleUpdateBlockContent( input );
	if ( result?.success !== true ) {
		if ( toolCallId ) {
			blockEditSnapshots.delete( toolCallId );
		}
		const error =
			typeof result?.error === 'string' && result.error ? result.error : 'Block update failed';
		const message = __( 'I could not update the block. Please try again.', __i18n_text_domain__ );
		const agentMessage = toolCallId
			? createUpdateBlockContentAgentMessage( toolCallId, {
					success: false,
					message,
					error,
			  } )
			: result?.agentMessage;
		return {
			...result,
			returnToAgent: false,
			...( agentMessage && { agentMessage } ),
		};
	}

	const outcome =
		typeof result.contentBefore === 'string' &&
		typeof result.contentAfter === 'string' &&
		result.contentBefore === result.contentAfter
			? 'no-changes'
			: 'updated';

	if ( toolCallId ) {
		if (
			outcome === 'updated' &&
			typeof result.clientId === 'string' &&
			typeof result.contentBefore === 'string' &&
			typeof result.contentAfter === 'string'
		) {
			const editorBlocksAfter = getCurrentEditorBlocks();
			blockEditSnapshots.set( toolCallId, {
				clientId: result.clientId,
				contentBefore: result.contentBefore,
				contentAfter: result.contentAfter,
				editorBlocksSignatureAfter: getEditorBlocksSignature( editorBlocksAfter ),
				...( typeof result.editableAttribute === 'string' && {
					editableAttribute: result.editableAttribute,
				} ),
			} );
		} else {
			blockEditSnapshots.delete( toolCallId );
		}
	}

	let message = typeof input?.summary === 'string' ? input.summary.trim() : '';
	if ( ! message ) {
		message =
			outcome === 'updated'
				? __( 'Updated the selected block.', __i18n_text_domain__ )
				: __( 'No changes were needed.', __i18n_text_domain__ );
	}
	const agentMessage = toolCallId
		? createUpdateBlockContentAgentMessage( toolCallId, {
				success: true,
				message,
				outcome,
		  } )
		: result.agentMessage;

	return {
		...result,
		outcome,
		...( agentMessage && { agentMessage } ),
	};
}

export const toolProvider = {
	/**
	 * Client-side abilities this provider handles: `wpcom/update-block-content`
	 * (block edits + summary), `jetpack-ai/apply-draft-content` (first draft into
	 * an empty post) and Jetpack show-component tools (interactive pickers,
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
		abilities = filterAbility( abilities, APPLY_DRAFT_CONTENT_ABILITY_NAME );
		for ( const toolId of SHOW_COMPONENT_TOOL_IDS ) {
			abilities = filterAbility( abilities, toolId );
		}
		const jetpackAbilities = [
			...( isBlockTransformationsEnabled()
				? [
						{
							...UPDATE_BLOCK_CONTENT_ABILITY,
							callback: handleUpdateBlockContentForChat,
						},
				  ]
				: [] ),
			...( isDraftAssistEnabled()
				? [
						{
							...APPLY_DRAFT_CONTENT_ABILITY,
							callback: handleApplyDraftContent,
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
			const result = await handleUpdateBlockContentForChat( args );
			return {
				result,
				returnToAgent: false,
				...( result.agentMessage && { agentMessage: result.agentMessage } ),
			};
		}

		if ( isDraftAssistEnabled() && isApplyDraftContentTool( name ) ) {
			const result = handleApplyDraftContent( args );
			// A refusal (post not empty, unparseable markup) goes back to the
			// agent so it can explain it; a successful write ends the turn.
			return { result, returnToAgent: result.returnToAgent };
		}

		if ( isLegacyShowComponentTool( name ) && shouldDelegateLegacyShowComponent( args ) ) {
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
			// Pinned cross-repo contract with the wpcom draft ability: the server
			// grants it by ability category on every editor surface and has no view
			// of this client's preview flag, so it drops the ability unless this key
			// says the client can actually handle the tool call. Without it the
			// orchestrator would route `jetpack_ai__apply_draft_content` to clients
			// that never registered a handler. Do not rename.
			// Post type matters, not just the flag. The applier refuses anything that is
			// not a post or page, and in the site editor `core/editor` serves templates
			// — so on a template this said "I can handle it", the server generated a
			// whole draft and uploaded an image, and only then did the client refuse.
			jetpackAiDraftAssistEnabled:
				isDraftAssistEnabled() && isDraftAssistPostType( getCurrentEditorPostType() ),
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
	if ( type === 'ai-editorial-review' ) {
		return AiEditorialReview as ComponentType;
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
 * can attach to show-component and block-edit messages. Snapshots the selected
 * top-level post fields (title by default, excerpt for the excerpt picker) on
 * `setCheckpoint(id, fields)` and restores exactly those fields on
 * `restoreCheckpoint(id)` via `core/editor` dispatch — restoring one picker's
 * checkpoint must not clobber another field's later edits. Block-edit snapshots
 * are captured by `handleUpdateBlockContentForChat`; meta (SEO pickers) and
 * image alt text changes are not checkpointed. Stubs the rest of AM's
 * `UseCheckpointReturn` interface; block-edit checkpoints also support safe
 * inline Undo and Redo through `canSwapCheckpoint` and `swapCheckpoint`.
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
			return postSnapshots.has( id ) || blockEditSnapshots.has( id );
		},
		canSwapCheckpoint( id: string ): boolean | undefined {
			const snapshot = blockEditSnapshots.get( id );
			return snapshot ? canSwapBlockEditSnapshot( snapshot ) : undefined;
		},
		async swapCheckpoint( id: string ): Promise< void > {
			const snapshot = blockEditSnapshots.get( id );
			if (
				! snapshot ||
				! canSwapBlockEditSnapshot( snapshot ) ||
				! undoBlockEdit(
					snapshot.clientId,
					snapshot.contentBefore,
					snapshot.contentAfter,
					snapshot.editableAttribute
				)
			) {
				throw new Error( 'Failed to swap block edit checkpoint.' );
			}

			const editorBlocksAfter = getCurrentEditorBlocks();
			blockEditSnapshots.set( id, {
				...snapshot,
				contentBefore: snapshot.contentAfter,
				contentAfter: snapshot.contentBefore,
				editorBlocksSignatureAfter: getEditorBlocksSignature( editorBlocksAfter ),
			} );
		},
		async restoreCheckpoint( id: string ): Promise< void > {
			const blockEditSnapshot = blockEditSnapshots.get( id );
			if ( blockEditSnapshot ) {
				if ( ! canSwapBlockEditSnapshot( blockEditSnapshot ) ) {
					throw new Error( 'Failed to restore block edit checkpoint.' );
				}
				const didRestore = undoBlockEdit(
					blockEditSnapshot.clientId,
					blockEditSnapshot.contentBefore,
					blockEditSnapshot.contentAfter,
					blockEditSnapshot.editableAttribute
				);
				if ( ! didRestore ) {
					throw new Error( 'Failed to restore block edit checkpoint.' );
				}
				return;
			}

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
	// for the show-component and block-edit flows.
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
			blockEditSnapshots.delete( id );
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
	disabled?: boolean;
	disabledReason?: string;
	action?: () => boolean | Promise< boolean >;
} > {
	return getPostLevelSuggestions( getCurrentEditorPostType() );
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
	condition: ( block: any ) => boolean;
	options?: SuggestionOption[];
	// Runs on click instead of sending the prompt. AgentUI submits the prompt
	// only when this resolves true, so returning false keeps the chat untouched.
	action?: () => boolean | Promise< boolean >;
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
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
		options: TRANSLATE_LANGUAGE_OPTIONS,
	},
	{
		id: 'change-tone',
		label: __( 'Change tone', __i18n_text_domain__ ),
		prompt: '',
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
		options: CHANGE_TONE_OPTIONS,
	},
	{
		id: 'check-grammar',
		label: __( 'Check grammar', __i18n_text_domain__ ),
		prompt: __( 'Check the grammar and spelling of this text', __i18n_text_domain__ ),
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'simplify-text',
		label: __( 'Simplify text', __i18n_text_domain__ ),
		prompt: __( 'Simplify this text to make it easier to read', __i18n_text_domain__ ),
		condition: ( block: any ) => TEXT_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'generate-alt-text',
		label: __( 'Generate alt text', __i18n_text_domain__ ),
		prompt: __( 'Generate descriptive alt text for this image', __i18n_text_domain__ ),
		condition: ( block: any ) => IMAGE_BLOCK_TYPES.includes( block?.name ),
	},
	{
		id: 'generate-image',
		label: __( 'Generate image', __i18n_text_domain__ ),
		// Empty prompt — opening Image Studio replaces sending anything to the agent.
		prompt: '',
		condition: ( block: any ) => block?.name === 'core/image' && isImageStudioAvailable(),
		action: () => ! openImageStudioForBlock( getSelectedOrRememberedBlock(), 'generate' ),
	},
	{
		id: 'edit-image',
		label: __( 'Edit image', __i18n_text_domain__ ),
		prompt: '',
		condition: ( block: any ) =>
			block?.name === 'core/image' && !! block?.attributes?.id && isImageStudioAvailable(),
		action: () => ! openImageStudioForBlock( getSelectedOrRememberedBlock(), 'edit' ),
	},
];

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
 * Hides after a suggestion is clicked, then restores suggestions after a
 * suggestion action completes.
 *
 * Post-level suggestions (Optimize Title, reviews, SEO) are not returned
 * here — they surface through `getEmptyViewSuggestions`, so they render only
 * while the chat and its input are empty.
 * @returns {Object} Object containing a suggestions array.
 */
export function useSuggestions( maxSuggestions?: number ): {
	suggestions: Array< {
		id: string;
		label: string;
		description?: string;
		prompt?: string;
		options?: SuggestionOption[];
		action?: () => boolean | Promise< boolean >;
	} >;
	replaceEmptyViewSuggestions: boolean;
} {
	const [ hidden, setHidden ] = useState( false );

	useEffect( () => {
		const handleSuggestionClick = ( event: Event ) => {
			const { suggestionId, value } = ( event as CustomEvent ).detail ?? {};
			const matchesSuggestion = ( suggestion: { id: string; prompt: string } ) =>
				suggestionId === suggestion.id ||
				( ! suggestionId && typeof value === 'string' && value === suggestion.prompt );

			setHidden( true );
			clearSuggestionsFn?.();
			suppressCurrentPageContentForNextContext = false;
			pendingBlockShimmerClientId = BLOCK_SUGGESTIONS.some( matchesSuggestion )
				? getSelectedOrRememberedBlock()?.clientId ?? null
				: null;

			if ( typeof value === 'string' && SAVED_POST_PROMPTS.has( value ) ) {
				suppressCurrentPageContentForNextContext = true;
			}
		};
		window.addEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick, true );
		return () => {
			window.removeEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick, true );
		};
	}, [] );

	useEffect( () => {
		const handleSuggestionActionComplete = () => setHidden( false );
		window.addEventListener( SUGGESTION_ACTION_COMPLETE_EVENT, handleSuggestionActionComplete );
		return () => {
			window.removeEventListener(
				SUGGESTION_ACTION_COMPLETE_EVENT,
				handleSuggestionActionComplete
			);
		};
	}, [] );

	useEffect( () => {
		const handleBlockActionComplete = () => {
			blockShimmerStartedForRequest = false;
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
			pendingBlockShimmerClientId = null;
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
			getCurrentPostType?: () => string | undefined;
		};
		return {
			selectedBlock: blockEditor?.getSelectedBlock?.() ?? null,
			postType: editor?.getCurrentPostType?.(),
		};
	}, [] );

	// Re-show suggestions when block selection changes (unless conversation is active)
	useEffect( () => {
		pendingBlockShimmerClientId = null;
		setHidden( false );
	}, [ editorContext.selectedBlock?.clientId ] );

	const selectedBlock = editorContext.selectedBlock;
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
			applicable.map( ( { id, label, prompt, options, action } ) => ( {
				id,
				label,
				prompt,
				options,
				action,
			} ) ),
		[ applicable ]
	);
	// Only block transforms are returned dynamically; post-level chips come
	// from getEmptyViewSuggestions and render only in the chat's empty view.
	const visibleSuggestions = useMemo( () => {
		if ( hidden || ! selectedBlock ) {
			return [];
		}
		return applySuggestionLimit( blockTransformationSuggestions, maxSuggestions );
	}, [ blockTransformationSuggestions, hidden, maxSuggestions, selectedBlock ] );
	useEffect( () => {
		if ( editorContext.selectedBlock ) {
			rememberSelectedBlock( editorContext.selectedBlock );
		}
	}, [ editorContext.selectedBlock?.clientId, editorContext.selectedBlock ] );

	return {
		suggestions: visibleSuggestions,
		// Any selected block owns the suggestion surface, even when that block has
		// no contextual actions, so whole-post suggestions never leak into block context.
		replaceEmptyViewSuggestions: !! selectedBlock,
	};
}
