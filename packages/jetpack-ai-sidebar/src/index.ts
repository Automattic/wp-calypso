/**
 * Jetpack AI provider module for Agents Manager.
 *
 * Exports the full AM provider contract:
 * - useAbilitiesSetup: captures AM's addMessage callback
 * - toolProvider: wraps `@wordpress/abilities` and adds Jetpack AI abilities
 * - contextProvider: sends gutenberg editor state to the orchestrator
 * - getChatComponent: maps tool IDs to React components
 * - getEmptyViewSuggestions: initial suggestions before conversation starts
 * - useSuggestions: block-aware dynamic suggestions during conversation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import TitlePicker from './components/title-picker';
import './components/title-picker.scss';
import {
	SELECT_TITLE_TOOL_ID,
	SELECT_TITLE_ABILITY,
	isSelectTitleTool,
	UPDATE_BLOCK_CONTENT_TOOL_ID,
	UPDATE_BLOCK_CONTENT_ABILITY,
	isUpdateBlockContentTool,
} from './utils/tool-provider';
import type { ComponentType } from 'react';

// ---------- Module state ----------

let addMessageFn: ( ( message: any ) => void ) | null = null;
let clearSuggestionsFn: ( () => void ) | null = null;
let isAbilityRegistered = false;

/** Default suggestion shown when no block is selected. */
const OPTIMIZE_TITLE_SUGGESTION = {
	id: 'optimize-title',
	label: __( 'Optimize Title', 'jetpack' ),
	prompt: __( 'Optimize the title of this post', 'jetpack' ),
};

// ---------- Block element helpers ----------

/**
 * Find a block element by clientId in the main document or editor iframe.
 *
 * @param {string} clientId - The block's clientId.
 * @returns The block element, or null.
 */
function findBlockElement( clientId: string ): HTMLElement | null {
	// Validate clientId format to prevent selector injection.
	if ( ! /^[0-9a-f-]+$/i.test( clientId ) ) {
		return null;
	}

	try {
		const el = document.querySelector( `[data-block="${ clientId }"]` ) as HTMLElement | null;
		if ( el ) {
			return el;
		}
		const iframe = document.querySelector(
			'iframe[name="editor-canvas"]'
		) as HTMLIFrameElement | null;
		return iframe?.contentDocument?.querySelector(
			`[data-block="${ clientId }"]`
		) as HTMLElement | null;
	} catch {
		return null;
	}
}

// ---------- Processing effect (Flow Block shimmer) ----------

/**
 * Inject processing styles into the document containing the block.
 * Uses Flow Block font + flash animation matching Big Sky's effect.
 * @param doc
 */
function ensureProcessingStyles( doc: Document ): void {
	if ( doc.getElementById( 'jetpack-ai-processing-styles' ) ) {
		return;
	}
	const style = doc.createElement( 'style' );
	style.id = 'jetpack-ai-processing-styles';
	style.textContent = `
		@import url("https://fonts.googleapis.com/css2?family=Flow+Block&display=swap");
		@keyframes jetpack-ai-flash-text {
			0% { opacity: 0.4; }
			50% { opacity: 0.8; }
			100% { opacity: 0.4; }
		}
		@keyframes jetpack-ai-highlight-fade {
			0% { outline-color: rgba(56, 88, 233, 0.8); }
			100% { outline-color: transparent; }
		}
		.jetpack-ai-is-processing,
		.jetpack-ai-is-processing .wp-block-heading,
		.jetpack-ai-is-processing .wp-block-paragraph {
			font-family: "Flow Block", system-ui !important;
			font-style: normal;
			font-weight: 200;
			transition: transform 1s;
		}
		.jetpack-ai-is-processing:not(:has(img)) {
			animation: jetpack-ai-flash-text 2s infinite;
		}
		.jetpack-ai-has-processed {
			outline: 2px solid rgba(56, 88, 233, 0.8);
			outline-offset: 2px;
			border-radius: 4px;
			animation: jetpack-ai-highlight-fade 1s ease-out forwards;
		}
	`;
	doc.head.appendChild( style );
}

/**
 * Apply processing effect to a block element.
 *
 * @param el - The block element.
 */
function applyProcessingEffect( el: HTMLElement ): void {
	ensureProcessingStyles( el.ownerDocument );
	el.classList.add( 'jetpack-ai-is-processing' );
}

/**
 * Remove processing effect and show a brief highlight.
 *
 * @param el - The block element.
 */
function removeProcessingEffect( el: HTMLElement ): void {
	el.classList.remove( 'jetpack-ai-is-processing' );
	el.classList.add( 'jetpack-ai-has-processed' );
	setTimeout( () => {
		el.classList.remove( 'jetpack-ai-has-processed' );
	}, 1000 );
}

/**
 * Start shimmer on the currently selected block (if any).
 */
function startBlockShimmer(): void {
	const wpData = ( window as any ).wp?.data;
	if ( ! wpData ) {
		return;
	}
	const block = wpData.select( 'core/block-editor' ).getSelectedBlock();
	if ( block?.clientId ) {
		const blockEl = findBlockElement( block.clientId );
		if ( blockEl ) {
			applyProcessingEffect( blockEl );
		}
	}
}

// ---------- Ability callbacks ----------

/**
 * Handle the select-title tool call: render TitlePicker in chat.
 *
 * @param {any} input - Tool input with titles array.
 * @returns {Object} Result with returnToAgent: false.
 */
function handleSelectTitle( input: any ): any {
	if ( ! addMessageFn ) {
		return { success: false, error: 'Provider not initialized', returnToAgent: false };
	}
	const titles = input?.titles;
	if ( ! titles?.length ) {
		return { success: false, error: 'No titles provided', returnToAgent: false };
	}
	addMessageFn( {
		id: `title-picker-${ Date.now() }`,
		role: 'assistant',
		content: [
			{
				type: 'component',
				component: TitlePicker,
				componentProps: { titles },
			},
		],
		created_at: Math.floor( Date.now() / 1000 ),
		showIcon: true,
	} );
	return { success: true, returnToAgent: false };
}

/**
 * Handle the update-block-content tool call: apply text changes to a block.
 *
 * @param {any} input - Tool input with clientId, content, and optional summary.
 * @returns {Object} Result with returnToAgent: false.
 */
function handleUpdateBlockContent( input: any ): any {
	const { clientId, content, summary } = input;
	if ( ! clientId || ! content ) {
		return { success: false, error: 'clientId and content are required', returnToAgent: false };
	}

	const wpData = ( window as any ).wp?.data;
	if ( ! wpData ) {
		return { success: false, error: 'WordPress data not available', returnToAgent: false };
	}

	const blockEditor = wpData.dispatch( 'core/block-editor' );
	if ( ! blockEditor ) {
		return { success: false, error: 'Block editor not available', returnToAgent: false };
	}

	// Apply shimmer briefly, then update content and show highlight
	const blockEl = findBlockElement( clientId );
	if ( blockEl ) {
		applyProcessingEffect( blockEl );
	}

	// Short delay so the shimmer is visible before content swaps
	return new Promise< any >( ( resolve ) => {
		setTimeout( () => {
			blockEditor.updateBlockAttributes( clientId, { content } );

			if ( blockEl ) {
				removeProcessingEffect( blockEl );
			}

			// Show summary in chat
			if ( addMessageFn && summary ) {
				addMessageFn( {
					id: `block-update-${ Date.now() }`,
					role: 'assistant',
					content: [ { type: 'text', text: summary } ],
					created_at: Math.floor( Date.now() / 1000 ),
					showIcon: true,
				} );
			}

			resolve( { success: true, returnToAgent: false } );
		}, 800 );
	} );
}

// ---------- WP Abilities registration ----------

/**
 * Check whether the `@wordpress/abilities` API is available.
 *
 * @returns {boolean} True when window.wp.abilities.getAbilities exists.
 */
function hasAbilitiesApi(): boolean {
	try {
		return !! ( window as any ).wp?.abilities?.getAbilities;
	} catch {
		return false;
	}
}

/**
 * Register wpcom/select-title as a client-side ability via `@wordpress/abilities`.
 */
async function registerSelectTitleAbility(): Promise< void > {
	if ( isAbilityRegistered || ! hasAbilitiesApi() ) {
		return;
	}

	// Set guard before await to prevent concurrent registration attempts.
	isAbilityRegistered = true;

	try {
		const { registerAbility } = ( window as any ).wp.abilities;
		await registerAbility( {
			name: SELECT_TITLE_TOOL_ID,
			label: 'Select title',
			category: 'jetpack-ai',
			description: SELECT_TITLE_ABILITY.description,
			input_schema: SELECT_TITLE_ABILITY.input_schema,
			callback: async ( input: any ) => handleSelectTitle( input ),
		} );
	} catch ( e: any ) {
		if ( ! e?.message?.includes?.( 'already registered' ) ) {
			isAbilityRegistered = false; // Reset on genuine failure.
			// eslint-disable-next-line no-console
			console.warn( '[Jetpack AI] Failed to register select-title ability:', e );
		}
	}
}

// ---------- useAbilitiesSetup ----------

/**
 * Captures AM's addMessage/clearSuggestions callbacks and registers abilities.
 *
 * @param {Object} actions                  - The actions object provided by AM.
 * @param          actions.addMessage
 * @param          actions.clearSuggestions
 */
export function useAbilitiesSetup( actions: {
	addMessage: ( message: any ) => void;
	clearSuggestions?: () => void;
	[ key: string ]: unknown;
} ): void {
	addMessageFn = actions.addMessage;
	if ( actions.clearSuggestions ) {
		clearSuggestionsFn = actions.clearSuggestions;
	}
	registerSelectTitleAbility();
}

// ---------- toolProvider ----------

/**
 * Normalize an ability name to the format used by agenttic-client for matching.
 *
 * @param {string} name - Ability name (e.g., 'wpcom/select-title').
 * @returns {string} Normalized name (e.g., 'wpcom__select_title').
 */
function normalizeAbilityName( name: string ): string {
	return name.replace( /\//g, '__' ).replace( /-/g, '_' );
}

/**
 * Filter out an ability by name from a list.
 *
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

export const toolProvider = {
	/**
	 * Return all available abilities with Jetpack AI callbacks.
	 *
	 * Replaces any existing select-title and update-block-content abilities
	 * with versions that have callbacks returning returnToAgent: false.
	 * This is necessary because agenttic-client's executeAbility path
	 * hardcodes returnToAgent: true, but the callback path respects it.
	 *
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

		// Remove existing versions and add ours with callbacks
		abilities = filterAbility( abilities, SELECT_TITLE_TOOL_ID );
		abilities = filterAbility( abilities, UPDATE_BLOCK_CONTENT_TOOL_ID );

		abilities.unshift(
			{
				...SELECT_TITLE_ABILITY,
				callback: async ( input: any ) => handleSelectTitle( input ),
			},
			{
				...UPDATE_BLOCK_CONTENT_ABILITY,
				callback: async ( input: any ) => handleUpdateBlockContent( input ),
			}
		);

		return abilities;
	},

	/**
	 * Execute an ability by name (fallback when callback path is not used).
	 *
	 * @param {string} name - The ability identifier.
	 * @param {any}    args - Arguments to pass to the ability.
	 * @returns {Promise<{result: Record<string, unknown>, returnToAgent?: boolean}>} Execution result.
	 */
	async executeAbility(
		name: string,
		args: any
	): Promise< { result: Record< string, unknown >; returnToAgent?: boolean } > {
		if ( isSelectTitleTool( name ) ) {
			return { result: handleSelectTitle( args ), returnToAgent: false };
		}

		if ( isUpdateBlockContentTool( name ) ) {
			const result = await handleUpdateBlockContent( args );
			return { result, returnToAgent: false };
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
 *
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
 *
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
	 *
	 * @returns {any} Context with page content, selected block, and block content.
	 */
	getClientContext(): any {
		const wpData = ( window as any ).wp?.data;
		let currentPageContent: any[] = [];
		let selectedBlockClientId = '';
		let selectedBlockContent = '';

		if ( wpData ) {
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
 *
 * @param {string} type - The component type identifier.
 * @returns {ComponentType|null} The matching component, or null.
 */
export function getChatComponent( type: string ): ComponentType | null {
	if ( type === 'title-picker' || isSelectTitleTool( type ) ) {
		return TitlePicker as ComponentType;
	}
	return null;
}

// ---------- getEmptyViewSuggestions ----------

/**
 * Suggestions shown in the AM empty view (before any messages).
 *
 * @returns {Array} Array of suggestion objects.
 */
export function getEmptyViewSuggestions(): Array< {
	id: string;
	label: string;
	prompt?: string;
} > {
	return [ OPTIMIZE_TITLE_SUGGESTION ];
}

// ---------- useSuggestions ----------

/** Block types that support text editing suggestions. */
const TEXT_BLOCK_TYPES = [
	'core/paragraph',
	'core/heading',
	'core/list',
	'core/quote',
	'core/pullquote',
	'core/verse',
	'core/preformatted',
	'core/freeform',
	'core/list-item',
	'core/table',
];

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

/**
 * Block-aware dynamic suggestions for the AM sidebar.
 *
 * Returns contextual suggestions based on the selected block type.
 * Hides permanently once the conversation becomes active.
 *
 * @returns {Object} Object containing a suggestions array.
 */
export function useSuggestions(): {
	suggestions: Array< { id: string; label: string; prompt?: string } >;
} {
	const [ hidden, setHidden ] = useState( false );

	useEffect( () => {
		const handleSuggestionClick = () => {
			setHidden( true );
			clearSuggestionsFn?.();
			startBlockShimmer();
		};
		window.addEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick );
		return () => {
			window.removeEventListener( 'big-sky-inline-suggestion-click', handleSuggestionClick );
		};
	}, [] );

	const selectedBlock = useSelect(
		( select ) =>
			( select( 'core/block-editor' ) as { getSelectedBlock: () => any } ).getSelectedBlock(),
		[]
	);

	// Re-show suggestions when block selection changes (unless conversation is active)
	useEffect( () => {
		setHidden( false );
	}, [ selectedBlock?.clientId ] );

	if ( hidden ) {
		return { suggestions: [] };
	}

	if ( ! selectedBlock ) {
		return { suggestions: [ OPTIMIZE_TITLE_SUGGESTION ] };
	}

	const applicable = BLOCK_SUGGESTIONS.filter( ( s ) => s.condition( selectedBlock ) );
	return {
		suggestions: applicable.map( ( { id, label, prompt } ) => ( { id, label, prompt } ) ),
	};
}
