import { dispatch, select } from '@wordpress/data';

export const GET_EDITOR_BLOCKS_TOOL_NAME = 'get_editor_blocks_tool';
export const GET_SELECTED_BLOCK_TOOL_NAME = 'get_selected_block_tool';
export const GET_INSERTER_ITEMS_TOOL_NAME = 'get_inserter_items_tool';
export const HAS_SELECTED_BLOCK_TOOL_NAME = 'has_selected_block_tool';
export const SELECT_BLOCK_TOOL_NAME = 'select_block';
export const GET_BLOCK_TYPES_TOOL_NAME = 'get_block_types_tool';
export const GET_BLOCK_TYPE_TOOL_NAME = 'get_block_type_tool';
export const INSERT_BLOCK_TOOL_NAME = 'insert_block_tool';
export const INSERT_BLOCKS_TOOL_NAME = 'insert_blocks_tool';
export const UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME = 'update_block_attributes_tool';
export const REPLACE_BLOCK_TOOL_NAME = 'replace_block_tool';
export const REMOVE_BLOCK_TOOL_NAME = 'remove_block_tool';
export const MOVE_BLOCK_TOOL_NAME = 'move_block_tool';
export const GET_BLOCK_TOOL_NAME = 'get_block_tool';
export const FORMAT_TEXT_TOOL_NAME = 'format_text_tool';

const MAX_INNER_DEPTH = 12;
const MAX_INSERTER_ITEM_FIELDS = 250;
const MAX_BLOCK_TYPES_RETURNED = 200;
const MAX_INSERT_INNER_DEPTH = 6;
const MAX_BATCH_BLOCKS = 50;
const MAX_SAVED_HTML_LENGTH = 1200;
const MAX_ORIGINAL_CONTENT_LENGTH = 800;
const MAX_RICH_TEXT_HTML_LENGTH = 1200;

const FORMAT_TYPE_BY_KEY: Record< string, string > = {
	bold: 'core/bold',
	italic: 'core/italic',
	strikethrough: 'core/strikethrough',
	code: 'core/code',
	link: 'core/link',
	subscript: 'core/subscript',
	superscript: 'core/superscript',
	underline: 'core/underline',
	highlight: 'core/text-color',
};

type Blockish = {
	name: string;
	clientId: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: Blockish[];
	originalContent?: string;
};

type SerializedBlock = {
	name: string;
	title?: string;
	clientId: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: SerializedBlock[];
	originalContent?: string;
	saved_html?: string;
};

/**
 * Scroll the DOM element for a given block clientId into view. Gutenberg
 * renders each block as a wrapper element with id="block-<clientId>", so we
 * use that to locate the node. We defer with a double-rAF so React/Gutenberg
 * has a chance to flush the latest DOM changes from any preceding dispatch
 * (insertBlock, updateBlockAttributes, replaceBlock, …) before we scroll.
 */
function scrollBlockIntoView( clientId: string | null | undefined ): void {
	if ( ! clientId || typeof window === 'undefined' || typeof document === 'undefined' ) {
		return;
	}
	const tryScroll = () => {
		try {
			const editor = document.querySelector( 'iframe[name=editor-canvas]' ) as HTMLIFrameElement;
			const iframeDocument = editor?.contentWindow?.document;
			const el = iframeDocument?.getElementById( `block-${ clientId }` );
			if ( el && typeof el.scrollIntoView === 'function' ) {
				el.scrollIntoView( { behavior: 'smooth', block: 'center', inline: 'nearest' } );
			}
		} catch {
			// scrollIntoView is best-effort; never let it break the tool result.
		}
	};
	if ( typeof window.requestAnimationFrame === 'function' ) {
		window.requestAnimationFrame( () => window.requestAnimationFrame( tryScroll ) );
	} else {
		setTimeout( tryScroll, 16 );
	}
}

/**
 * Resolve a registered Gutenberg block name (e.g. "core/paragraph") to its
 * human-readable title (e.g. "Paragraph"). Falls back to title-casing the
 * suffix after the slash when the registry is unavailable or the block is not
 * registered.
 */
export function getBlockTitle( name: string | undefined | null ): string {
	if ( ! name || typeof name !== 'string' ) {
		return '';
	}
	const reg = getBlocksRegistrySelect();
	if ( reg ) {
		const bt =
			typeof reg.getBlockType === 'function'
				? reg.getBlockType( name )
				: reg.getBlockTypes().find( ( b ) => b.name === name );
		if ( bt && typeof bt.title === 'string' && bt.title ) {
			return bt.title;
		}
	}
	const suffix = name.includes( '/' ) ? name.split( '/' ).pop() ?? name : name;
	return suffix
		.replace( /[-_]/g, ' ' )
		.replace( /\b\w/g, ( c ) => c.toUpperCase() )
		.trim();
}

export const getEditorBlocksToolDefinition = {
	type: 'function',
	name: GET_EDITOR_BLOCKS_TOOL_NAME,
	description:
		'Get the list of blocks in the block editor. Uses wp.data select("core/block-editor").getBlocks. Pass root_client_id to read inner blocks of a parent; omit for top-level document blocks. Use to understand post structure, templates, and nesting.',
	parameters: {
		type: 'object',
		properties: {
			root_client_id: {
				type: 'string',
				description:
					'Optional parent block clientId. If omitted, returns top-level (root) blocks. If set, returns that block’s child blocks.',
			},
		},
		additionalProperties: false,
	},
} as const;

export const getSelectedBlockToolDefinition = {
	type: 'function',
	name: GET_SELECTED_BLOCK_TOOL_NAME,
	description:
		'Get the currently selected block in the Gutenberg block editor, including name, clientId, attributes, and inner blocks. Uses wp.data select("core/block-editor").getSelectedBlock. Use when the user is editing a specific block or asks what is selected.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

export const getInserterItemsToolDefinition = {
	type: 'function',
	name: GET_INSERTER_ITEMS_TOOL_NAME,
	description:
		'Get the items available in the block inserter for the current context (blocks, patterns, etc.). Uses wp.data select("core/block-editor").getInserterItems. Optionally pass root_client_id to match inserter for a specific parent. Use to suggest blocks the user can insert or to explain what can be added here.',
	parameters: {
		type: 'object',
		properties: {
			root_client_id: {
				type: 'string',
				description:
					'Optional. Scope inserter items to this parent block; omit for the default root context.',
			},
		},
		additionalProperties: false,
	},
} as const;

export const hasSelectedBlockToolDefinition = {
	type: 'function',
	name: HAS_SELECTED_BLOCK_TOOL_NAME,
	description:
		'Returns whether a block is currently selected in the editor. Uses wp.data select("core/block-editor").hasSelectedBlock. Use for quick checks before calling get_selected_block_tool.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

export const selectBlockToolDefinition = {
	type: 'function',
	name: SELECT_BLOCK_TOOL_NAME,
	description:
		'Select a block in the Gutenberg editor by its clientId. Uses wp.data dispatch("core/block-editor").selectBlock. Use a clientId from get_editor_blocks_tool or get_selected_block_tool. Optional initial_position can focus a specific block list position (e.g. 0) when relevant.',
	parameters: {
		type: 'object',
		properties: {
			client_id: {
				type: 'string',
				description: 'The block’s clientId to select.',
			},
			initial_position: {
				type: 'number',
				description:
					'Optional. Block list position to focus, or omit / null for default. Some flows pass 0 to focus the first inner block area.',
			},
		},
		required: [ 'client_id' ],
		additionalProperties: false,
	},
} as const;

export const getBlockTypesToolDefinition = {
	type: 'function',
	name: GET_BLOCK_TYPES_TOOL_NAME,
	description:
		'List all registered Gutenberg block type names only (strings like "core/paragraph"). Uses wp.data select("core/blocks").getBlockTypes. Optional search/category filters still match title, description, and keywords, but the response contains names only — no titles or descriptions. Use this to discover or search block names. You MUST call get_block_type_tool with each exact name before insert_block_tool, insert_blocks_tool, update_block_attributes_tool, replace_block_tool, or any write that sets block attributes (including every distinct block type in inner_blocks).',
	parameters: {
		type: 'object',
		properties: {
			search: {
				type: 'string',
				description:
					'Optional case-insensitive substring matched against block name, title, description and keywords (e.g. "heading", "image", "list").',
			},
			category: {
				type: 'string',
				description:
					'Optional category filter, e.g. "text", "media", "design", "widgets", "theme", "embed".',
			},
		},
		additionalProperties: false,
	},
} as const;

export const getBlockTypeToolDefinition = {
	type: 'function',
	name: GET_BLOCK_TYPE_TOOL_NAME,
	description:
		'Get the full schema for ONE registered Gutenberg block type by exact name (e.g. "core/paragraph"). Uses wp.data select("core/blocks").getBlockType (same shape as items from getBlockTypes). The returned block_type includes an attributes map (types, defaults, enum, source) and may include example.attributes — when example.attributes is present, use it as the structural template for insert_block_tool / createBlock payloads: start from those keys and values, then substitute the user\'s content while preserving the shape. When example is missing, build attributes from defaults and types in block_type.attributes. Call this immediately before every insert, replace, or attribute update for that block type.',
	parameters: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
				description: 'Exact block name to look up, e.g. "core/paragraph", "core/heading".',
			},
		},
		required: [ 'name' ],
		additionalProperties: false,
	},
} as const;

export const insertBlockToolDefinition = {
	type: 'function',
	name: INSERT_BLOCK_TOOL_NAME,
	description:
		'Insert a new block into the post using wp.blocks.createBlock and wp.data dispatch("core/block-editor").insertBlock. Call get_block_type_tool for this block name (and for every inner block type) immediately before this call; build the attributes argument from block_type.example.attributes when present, otherwise from block_type.attributes defaults. Common dictation use cases: insert a "core/paragraph" with content, a "core/heading" with content/level, a "core/list" with inner list-item blocks, a "core/quote", "core/image", etc. For dictation: ALWAYS append at the end of the post (omit index, root_client_id, after_client_id) unless the user explicitly asked to place it elsewhere; never choose a middle position based on selection alone. Pass index and root_client_id to insert at a specific location, or pass after_client_id to insert immediately after an existing block — only when instructed. inner_blocks can be supplied recursively for container blocks (list, group, columns, quote).',
	parameters: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
				description:
					'Block name to insert, e.g. "core/paragraph", "core/heading", "core/list", "core/list-item", "core/image", "core/quote".',
			},
			attributes: {
				type: 'object',
				description:
					'Attributes for the block. After get_block_type_tool, prefer starting from block_type.example.attributes when it exists (same keys/shape; swap in user text and media). Otherwise use block_type.attributes defaults and types. For "core/paragraph" typically { "content": "text" }; "core/heading" { "content": "text", "level": 2 }; RichText values are strings.',
				additionalProperties: true,
			},
			inner_blocks: {
				type: 'array',
				description:
					"Optional nested child blocks. Each item has the same shape as this tool's arguments (name, attributes, inner_blocks). Use for container blocks like core/list (inner_blocks of core/list-item), core/group, core/columns, core/quote.",
				items: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						attributes: { type: 'object', additionalProperties: true },
						inner_blocks: { type: 'array', items: { type: 'object' } },
					},
					required: [ 'name' ],
					additionalProperties: false,
				},
			},
			index: {
				type: 'number',
				description:
					'Optional zero-based position within the parent. Omit to append at the end. Ignored when after_client_id is provided.',
			},
			root_client_id: {
				type: 'string',
				description:
					'Optional clientId of the parent block to insert into. Omit to insert at the top level of the post. Ignored when after_client_id is provided (the parent is inferred from that block).',
			},
			after_client_id: {
				type: 'string',
				description:
					"Optional clientId of an existing block. The new block will be inserted immediately after this block, in the same parent. Convenient when continuing the user's dictation after the currently selected block.",
			},
			update_selection: {
				type: 'boolean',
				description:
					'Optional. Whether to move the editor selection to the newly inserted block. Defaults to true so the user can keep dictating into it.',
			},
		},
		required: [ 'name' ],
		additionalProperties: false,
	},
} as const;

export const insertBlocksToolDefinition = {
	type: 'function',
	name: INSERT_BLOCKS_TOOL_NAME,
	description:
		'Insert MULTIPLE blocks in a single batched call using wp.data dispatch("core/block-editor").insertBlocks. Call get_block_type_tool for every distinct block name in the batch (including nested inner_blocks) immediately before this call; use each block_type.example.attributes as the attributes template when available. Prefer this over calling insert_block_tool repeatedly when laying down a structured chunk (e.g. a heading followed by a couple of paragraphs and a list). Same placement as insert_block_tool: for dictation omit placement args to append at the end of the post — do not splice into the middle unless the user explicitly directed a position. Or specify index + root_client_id, or after_client_id to insert immediately after an existing block when they asked for that.',
	parameters: {
		type: 'object',
		properties: {
			blocks: {
				type: 'array',
				description:
					'Array of block specs (1–50). Each item has the same shape as insert_block_tool args: { name, attributes?, inner_blocks? }.',
				items: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						attributes: { type: 'object', additionalProperties: true },
						inner_blocks: { type: 'array', items: { type: 'object' } },
					},
					required: [ 'name' ],
					additionalProperties: false,
				},
				minItems: 1,
			},
			index: {
				type: 'number',
				description:
					'Optional zero-based position within the parent. Omit to append at the end. Ignored when after_client_id is provided.',
			},
			root_client_id: {
				type: 'string',
				description:
					'Optional clientId of the parent block to insert into. Omit to insert at the top level. Ignored when after_client_id is provided.',
			},
			after_client_id: {
				type: 'string',
				description:
					'Optional clientId of an existing block. The new blocks will be inserted immediately after this block, in the same parent.',
			},
			update_selection: {
				type: 'boolean',
				description:
					'Optional. Whether to move selection to the first inserted block. Defaults to true.',
			},
		},
		required: [ 'blocks' ],
		additionalProperties: false,
	},
} as const;

export const updateBlockAttributesToolDefinition = {
	type: 'function',
	name: UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME,
	description:
		'Update one or more attributes on an existing block, leaving other attributes unchanged. Uses wp.data dispatch("core/block-editor").updateBlockAttributes. Call get_block_type_tool for that block\'s type (from get_block_tool or get_editor_blocks_tool) immediately before this call if you are not already certain of the attribute schema. Use this for things like appending or rewriting a paragraph\'s content, changing a heading\'s level, or tweaking image alt text. For steady forward dictation, prefer the LAST top-level trailing block\'s clientId (see get_editor_blocks_tool) unless the user clearly asked you to patch a named or selected block ("this"/"that", positional edit).',
	parameters: {
		type: 'object',
		properties: {
			client_id: {
				type: 'string',
				description:
					"The block's clientId. Default dictation/streaming writes: prefer the LAST top-level trailing block unless the batch instructions say otherwise — do not infer mid-article clientId from selection alone. Use the selected block when they said 'this' / 'that' or gave an explicit positional edit.",
			},
			attributes: {
				type: 'object',
				description:
					'Partial attribute object to merge into the block. For core/paragraph use { "content": "new text" }. For core/heading use { "level": 3 }. Only the keys you provide will be changed.',
				additionalProperties: true,
			},
		},
		required: [ 'client_id', 'attributes' ],
		additionalProperties: false,
	},
} as const;

export const replaceBlockToolDefinition = {
	type: 'function',
	name: REPLACE_BLOCK_TOOL_NAME,
	description:
		'Replace an existing block with a brand-new block (different type or wholesale rewrite). Uses wp.data dispatch("core/block-editor").replaceBlock combined with wp.blocks.createBlock. Call get_block_type_tool for the new block name (and inner types) immediately before this call. Use this when the user says things like "turn this paragraph into a heading" or "change this list to a quote". Prefer update_block_attributes_tool when the block type stays the same.',
	parameters: {
		type: 'object',
		properties: {
			client_id: {
				type: 'string',
				description: 'The clientId of the block to replace.',
			},
			name: {
				type: 'string',
				description:
					'Name of the new block, e.g. "core/heading", "core/quote", "core/list". Call get_block_type_tool for this name immediately before replace_block_tool.',
			},
			attributes: {
				type: 'object',
				description:
					"Attributes for the new block. Reuse the previous block's text content where it makes sense (e.g. moving a paragraph's content into a heading).",
				additionalProperties: true,
			},
			inner_blocks: {
				type: 'array',
				description:
					'Optional nested child block specs, same shape as insert_block_tool inner_blocks.',
				items: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						attributes: { type: 'object', additionalProperties: true },
						inner_blocks: { type: 'array', items: { type: 'object' } },
					},
					required: [ 'name' ],
					additionalProperties: false,
				},
			},
		},
		required: [ 'client_id', 'name' ],
		additionalProperties: false,
	},
} as const;

export const removeBlockToolDefinition = {
	type: 'function',
	name: REMOVE_BLOCK_TOOL_NAME,
	description:
		'Remove a block from the post. Uses wp.data dispatch("core/block-editor").removeBlock. Use this when the user says "delete that", "remove the last paragraph", "scratch the heading", etc. Pass the clientId of the block to delete.',
	parameters: {
		type: 'object',
		properties: {
			client_id: {
				type: 'string',
				description: 'The clientId of the block to remove.',
			},
			select_previous: {
				type: 'boolean',
				description:
					'Optional. Whether to move selection to the previous block after removal. Defaults to true so the user can keep dictating.',
			},
		},
		required: [ 'client_id' ],
		additionalProperties: false,
	},
} as const;

export const moveBlockToolDefinition = {
	type: 'function',
	name: MOVE_BLOCK_TOOL_NAME,
	description:
		'Reorder a block within the post. Uses wp.data dispatch("core/block-editor") moveBlocksUp / moveBlocksDown / moveBlocksToPosition. Use direction="up" or "down" for relative moves ("move that paragraph up"), or pass to_index (with optional to_root_client_id) for absolute moves ("move this block to the top" → to_index: 0).',
	parameters: {
		type: 'object',
		properties: {
			client_id: {
				type: 'string',
				description: 'The clientId of the block to move.',
			},
			direction: {
				type: 'string',
				enum: [ 'up', 'down' ],
				description:
					'Optional. Move the block one position up or down within its current parent. Required if to_index is not provided.',
			},
			to_index: {
				type: 'number',
				description:
					'Optional. Absolute zero-based target position. When provided, takes precedence over direction.',
			},
			to_root_client_id: {
				type: 'string',
				description:
					'Optional. Target parent clientId for absolute moves. Omit to keep the block in its current parent (or to move to the top level).',
			},
		},
		required: [ 'client_id' ],
		additionalProperties: false,
	},
} as const;

export const getBlockToolDefinition = {
	type: 'function',
	name: GET_BLOCK_TOOL_NAME,
	description:
		'Fetch a single block by its clientId, including attributes and inner blocks. Uses wp.data select("core/block-editor").getBlock. Lighter than get_editor_blocks_tool when you just want to confirm what was inserted or read one block\'s current state.',
	parameters: {
		type: 'object',
		properties: {
			client_id: {
				type: 'string',
				description: 'The clientId of the block to fetch.',
			},
		},
		required: [ 'client_id' ],
		additionalProperties: false,
	},
} as const;

export const formatTextToolDefinition = {
	type: 'function',
	name: FORMAT_TEXT_TOOL_NAME,
	description:
		'Apply a RichText format (bold, italic, strikethrough, code, link, underline, subscript, superscript) to text inside a block. Uses wp.richText.applyFormat and dispatch("core/block-editor").updateBlockAttributes. By default targets the currently selected block\'s "content" attribute. Provide target_text to format a specific substring (case-insensitive first match), or omit it to format the editor\'s active text selection. For format="link", pass url.',
	parameters: {
		type: 'object',
		properties: {
			format: {
				type: 'string',
				enum: [
					'bold',
					'italic',
					'strikethrough',
					'code',
					'link',
					'underline',
					'subscript',
					'superscript',
				],
				description: 'Which RichText format to apply.',
			},
			url: {
				type: 'string',
				description: 'Required when format is "link". The href to link to.',
			},
			target_text: {
				type: 'string',
				description:
					"Optional substring to format inside the block content (case-insensitive first match). Omit to use the editor's active text selection.",
			},
			client_id: {
				type: 'string',
				description: 'Optional clientId. Defaults to the currently selected block.',
			},
			attribute_key: {
				type: 'string',
				description:
					'Optional attribute name on the block that holds the RichText. Defaults to "content".',
			},
		},
		required: [ 'format' ],
		additionalProperties: false,
	},
} as const;

type BlockEditorSelectors = {
	getBlocks: ( rootClientId?: string ) => Blockish[];
	getBlock?: ( clientId: string ) => Blockish | null;
	getSelectedBlock: () => Blockish | null;
	getSelectedBlockClientId?: () => string | null;
	hasSelectedBlock: () => boolean;
	getInserterItems?: ( rootClientId?: string ) => InserterItemLike[];
	__unstableGetInserterItems?: ( rootClientId?: string ) => InserterItemLike[];
	getSelectionStart?: () => SelectionPoint | null;
	getSelectionEnd?: () => SelectionPoint | null;
};

type BlockEditorActions = {
	selectBlock: ( clientId: string, initialPosition?: number | null ) => void | Promise< unknown >;
	insertBlock: (
		block: unknown,
		index?: number,
		rootClientId?: string,
		updateSelection?: boolean
	) => void | Promise< unknown >;
	insertBlocks: (
		blocks: unknown[],
		index?: number,
		rootClientId?: string,
		updateSelection?: boolean
	) => void | Promise< unknown >;
	updateBlockAttributes: (
		clientId: string | string[],
		attributes: Record< string, unknown >,
		uniqueByBlock?: boolean
	) => void | Promise< unknown >;
	replaceBlock: ( clientId: string | string[], block: unknown ) => void | Promise< unknown >;
	removeBlock: ( clientId: string, selectPrevious?: boolean ) => void | Promise< unknown >;
	moveBlocksUp: ( clientIds: string[], rootClientId?: string ) => void | Promise< unknown >;
	moveBlocksDown: ( clientIds: string[], rootClientId?: string ) => void | Promise< unknown >;
	moveBlocksToPosition: (
		clientIds: string[],
		fromRootClientId: string | undefined,
		toRootClientId: string | undefined,
		index: number
	) => void | Promise< unknown >;
};

type SelectionPoint = {
	clientId?: string;
	attributeKey?: string;
	offset?: number;
};

type InserterItemLike = {
	id?: string;
	name?: string;
	title?: string;
	category?: string;
	isDisabled?: boolean;
	keywords?: string[];
	[ key: string ]: unknown;
};

type BlockAttributeSpec = {
	type?: string | string[];
	default?: unknown;
	enum?: unknown[];
	source?: string;
	selector?: string;
	attribute?: string;
	[ key: string ]: unknown;
};

type BlockTypeLike = {
	name: string;
	title?: string;
	description?: string;
	category?: string;
	keywords?: string[];
	icon?: unknown;
	parent?: string[];
	ancestor?: string[];
	allowedBlocks?: string[];
	supports?: Record< string, unknown >;
	attributes?: Record< string, BlockAttributeSpec >;
	[ key: string ]: unknown;
};

type BlocksRegistrySelectors = {
	getBlockTypes: () => BlockTypeLike[];
	getBlockType?: ( name: string ) => BlockTypeLike | undefined;
};

type BlockEditorRootSelectors = {
	getBlockRootClientId?: ( clientId: string ) => string | null;
	getBlockIndex?: ( clientId: string, rootClientId?: string ) => number;
};

type CreateBlockFn = (
	name: string,
	attributes?: Record< string, unknown >,
	innerBlocks?: unknown[]
) => unknown;

type InsertBlockSpec = {
	name: string;
	attributes?: Record< string, unknown >;
	inner_blocks?: InsertBlockSpec[];
};

function isPlainObject( value: unknown ): value is Record< string, unknown > {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

function normalizeTableCell(
	cellRaw: unknown,
	defaultTag: 'th' | 'td'
): Record< string, unknown > {
	if ( isPlainObject( cellRaw ) ) {
		const contentRaw = cellRaw.content;
		const richTextHtml = richTextValueToHtml( contentRaw );
		let content: string;
		if ( typeof contentRaw === 'string' ) {
			content = contentRaw;
		} else if ( richTextHtml !== null ) {
			content = richTextHtml;
		} else if ( contentRaw === undefined || contentRaw === null ) {
			content = '';
		} else {
			content = String( contentRaw );
		}
		const tag = cellRaw.tag === 'th' || cellRaw.tag === 'td' ? cellRaw.tag : defaultTag;
		return {
			...cellRaw,
			content,
			tag,
		};
	}
	return {
		content: cellRaw === undefined || cellRaw === null ? '' : String( cellRaw ),
		tag: defaultTag,
	};
}

function normalizeTableSectionRows(
	sectionRaw: unknown,
	defaultTag: 'th' | 'td'
): Record< string, unknown >[] | null {
	if ( sectionRaw === undefined ) {
		return null;
	}
	if ( ! Array.isArray( sectionRaw ) ) {
		return [];
	}
	return sectionRaw.map( ( rowRaw ) => {
		if ( Array.isArray( rowRaw ) ) {
			return {
				cells: rowRaw.map( ( cell ) => normalizeTableCell( cell, defaultTag ) ),
			};
		}
		if ( isPlainObject( rowRaw ) ) {
			const cellsRaw = Array.isArray( rowRaw.cells ) ? rowRaw.cells : [];
			return {
				...rowRaw,
				cells: cellsRaw.map( ( cell ) => normalizeTableCell( cell, defaultTag ) ),
			};
		}
		return {
			cells: [ normalizeTableCell( rowRaw, defaultTag ) ],
		};
	} );
}

function normalizeTableRowsToColumnCount(
	rows: Record< string, unknown >[] | undefined,
	columnCount: number,
	defaultTag: 'th' | 'td'
): Record< string, unknown >[] | undefined {
	if ( ! rows ) {
		return rows;
	}
	return rows.map( ( row ) => {
		const rawCells = Array.isArray( row.cells ) ? row.cells : [];
		const normalizedCells = rawCells.map( ( cell ) => normalizeTableCell( cell, defaultTag ) );
		while ( normalizedCells.length < columnCount ) {
			normalizedCells.push( normalizeTableCell( '', defaultTag ) );
		}
		if ( normalizedCells.length > columnCount ) {
			normalizedCells.length = columnCount;
		}
		return {
			...row,
			cells: normalizedCells,
		};
	} );
}

function sanitizeTableAttributes( attrs: Record< string, unknown > ): Record< string, unknown > {
	const next: Record< string, unknown > = { ...attrs };

	const headRows = normalizeTableSectionRows( next.head, 'th' );
	const bodyRows = normalizeTableSectionRows( next.body, 'td' );
	const footRows = normalizeTableSectionRows( next.foot, 'td' );

	if ( headRows !== null ) {
		next.head = headRows;
	}
	if ( bodyRows !== null ) {
		next.body = bodyRows;
	}
	if ( footRows !== null ) {
		next.foot = footRows;
	}

	const allRows = [ ...( headRows ?? [] ), ...( bodyRows ?? [] ), ...( footRows ?? [] ) ];
	let columnCount = 0;
	for ( const row of allRows ) {
		if ( Array.isArray( row.cells ) && row.cells.length > 0 ) {
			columnCount = row.cells.length;
			break;
		}
	}

	if ( columnCount > 0 ) {
		next.head = normalizeTableRowsToColumnCount(
			Array.isArray( next.head ) ? ( next.head as Record< string, unknown >[] ) : undefined,
			columnCount,
			'th'
		);
		next.body = normalizeTableRowsToColumnCount(
			Array.isArray( next.body ) ? ( next.body as Record< string, unknown >[] ) : undefined,
			columnCount,
			'td'
		);
		next.foot = normalizeTableRowsToColumnCount(
			Array.isArray( next.foot ) ? ( next.foot as Record< string, unknown >[] ) : undefined,
			columnCount,
			'td'
		);
	}

	const style = isPlainObject( next.style )
		? { ...( next.style as Record< string, unknown > ) }
		: null;
	const styleClassName = style && typeof style.className === 'string' ? style.className : null;
	if ( styleClassName && ( typeof next.className !== 'string' || ! next.className.length ) ) {
		next.className = styleClassName;
	}
	if ( style && 'className' in style ) {
		delete style.className;
	}
	if ( style && Object.keys( style ).length > 0 ) {
		next.style = style;
	}

	return next;
}

function getBlockEditorSelect(): BlockEditorSelectors | null {
	try {
		return select( 'core/block-editor' ) as unknown as BlockEditorSelectors;
	} catch {
		return null;
	}
}

function getBlockEditorDispatch(): BlockEditorActions | null {
	try {
		return dispatch( 'core/block-editor' ) as unknown as BlockEditorActions;
	} catch {
		return null;
	}
}

function parseOptionalRootId( rawArgs: unknown, key = 'root_client_id' ): string | undefined {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: rawArgs;
		if ( ! args || typeof args !== 'object' ) {
			return undefined;
		}
		const value = ( args as Record< string, unknown > )[ key ];
		if ( typeof value === 'string' && value.length ) {
			return value;
		}
		return undefined;
	} catch {
		return undefined;
	}
}

function parseSelectBlockArgs(
	rawArgs: unknown
): { ok: true; clientId: string; initialPosition: number | null } | { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: rawArgs;
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object with client_id.' };
		}
		const id = ( args as Record< string, unknown > ).client_id;
		if ( typeof id !== 'string' || ! id.length ) {
			return { ok: false, error: 'client_id is required and must be a non-empty string.' };
		}
		const pos = ( args as Record< string, unknown > ).initial_position;
		let initialPosition: number | null = null;
		if ( pos !== undefined && pos !== null ) {
			if ( typeof pos === 'number' && Number.isFinite( pos ) ) {
				initialPosition = pos;
			} else {
				return { ok: false, error: 'initial_position must be a finite number if provided.' };
			}
		}
		return { ok: true, clientId: id, initialPosition };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

function truncateAttributeValue( value: unknown, depth: number ): unknown {
	if ( depth <= 0 ) {
		return '[…]';
	}
	if (
		value === null ||
		value === undefined ||
		typeof value === 'boolean' ||
		typeof value === 'number'
	) {
		return value;
	}
	if ( typeof value === 'string' ) {
		return value.length > 400 ? value.slice( 0, 400 ) + '…' : value;
	}
	if ( Array.isArray( value ) ) {
		return value.slice( 0, 20 ).map( ( v ) => truncateAttributeValue( v, depth - 1 ) );
	}
	if ( typeof value === 'object' ) {
		const richTextHtml = richTextValueToHtml( value );
		if ( richTextHtml !== null ) {
			return richTextHtml.length > MAX_RICH_TEXT_HTML_LENGTH
				? richTextHtml.slice( 0, MAX_RICH_TEXT_HTML_LENGTH ) + '…'
				: richTextHtml;
		}
		const out: Record< string, unknown > = {};
		const entries = Object.entries( value as Record< string, unknown > ).slice( 0, 30 );
		for ( const [ k, v ] of entries ) {
			out[ k ] = truncateAttributeValue( v, depth - 1 );
		}
		return out;
	}
	return String( value );
}

function truncateAttributes( attributes?: Record< string, unknown > ) {
	if ( ! attributes || typeof attributes !== 'object' ) {
		return undefined;
	}
	return Object.fromEntries(
		Object.entries( attributes )
			.slice( 0, 40 )
			.map( ( [ k, v ] ) => [ k, truncateAttributeValue( v, 3 ) ] )
	);
}

function truncateForOutput( value: string, max: number ): string {
	return value.length > max ? value.slice( 0, max ) + '…' : value;
}

function getSavedHtmlForBlock( block: Blockish ): string | undefined {
	const serialize = getSerializeBlockFn();
	if ( ! serialize ) {
		return undefined;
	}
	try {
		const html = serialize( block );
		if ( typeof html !== 'string' || ! html.length ) {
			return undefined;
		}
		return truncateForOutput( html, MAX_SAVED_HTML_LENGTH );
	} catch {
		return undefined;
	}
}

function serializeBlock(
	block: Blockish,
	depth: number,
	includeSavedHtml = true
): SerializedBlock {
	if ( depth <= 0 ) {
		return {
			name: block.name,
			title: getBlockTitle( block.name ),
			clientId: block.clientId,
			innerBlocks: [],
		};
	}
	const out: SerializedBlock = {
		name: block.name,
		title: getBlockTitle( block.name ),
		clientId: block.clientId,
		attributes: truncateAttributes( block.attributes ),
		innerBlocks: Array.isArray( block.innerBlocks )
			? block.innerBlocks.map( ( b ) => serializeBlock( b, depth - 1, false ) )
			: undefined,
	};
	if ( typeof block.originalContent === 'string' && block.originalContent.length ) {
		out.originalContent = truncateForOutput( block.originalContent, MAX_ORIGINAL_CONTENT_LENGTH );
	}
	if ( includeSavedHtml ) {
		const savedHtml = getSavedHtmlForBlock( block );
		if ( savedHtml ) {
			out.saved_html = savedHtml;
		}
	}
	return out;
}

function getInserterItemsForRoot( be: BlockEditorSelectors, rootClientId?: string ) {
	if ( typeof be.getInserterItems === 'function' ) {
		return be.getInserterItems( rootClientId );
	}
	if ( typeof be.__unstableGetInserterItems === 'function' ) {
		return be.__unstableGetInserterItems( rootClientId );
	}
	return null;
}

function mapInserterItem( item: InserterItemLike ) {
	return {
		id: item.id,
		name: item.name,
		title: item.title,
		category: item.category,
		isDisabled: item.isDisabled,
		keywords: item.keywords,
	};
}

export function executeGetEditorBlocksTool( rawArgs: unknown ) {
	const be = getBlockEditorSelect();
	if ( ! be ) {
		return { ok: false, error: 'Block editor is not available (core/block-editor store missing).' };
	}
	const rootClientId = parseOptionalRootId( rawArgs );
	const blocks = be.getBlocks( rootClientId );
	return {
		ok: true,
		root_client_id: rootClientId ?? null,
		blocks: blocks.map( ( b ) => serializeBlock( b, MAX_INNER_DEPTH ) ),
	};
}

export function executeGetSelectedBlockTool() {
	const be = getBlockEditorSelect();
	if ( ! be ) {
		return { ok: false, error: 'Block editor is not available (core/block-editor store missing).' };
	}
	const block = be.getSelectedBlock();
	if ( ! block ) {
		return { ok: true, block: null };
	}
	return { ok: true, block: serializeBlock( block, MAX_INNER_DEPTH ) };
}

export function executeGetInserterItemsTool( rawArgs: unknown ) {
	const be = getBlockEditorSelect();
	if ( ! be ) {
		return { ok: false, error: 'Block editor is not available (core/block-editor store missing).' };
	}
	const rootClientId = parseOptionalRootId( rawArgs );
	const items = getInserterItemsForRoot( be, rootClientId );
	if ( ! items ) {
		return {
			ok: false,
			error: 'getInserterItems is not available in this editor build.',
		};
	}
	const sliced = items.slice( 0, MAX_INSERTER_ITEM_FIELDS );
	return {
		ok: true,
		root_client_id: rootClientId ?? null,
		count: items.length,
		returned: sliced.length,
		truncated: items.length > sliced.length,
		items: sliced.map( mapInserterItem ),
	};
}

export function executeHasSelectedBlockTool() {
	const be = getBlockEditorSelect();
	if ( ! be ) {
		return { ok: false, error: 'Block editor is not available (core/block-editor store missing).' };
	}
	return { ok: true, hasSelectedBlock: be.hasSelectedBlock() };
}

export async function executeSelectBlockTool( rawArgs: unknown ) {
	const d = getBlockEditorDispatch();
	if ( ! d || typeof d.selectBlock !== 'function' ) {
		return {
			ok: false,
			error:
				'Block editor is not available (core/block-editor store missing or selectBlock missing).',
		};
	}
	const parsed = parseSelectBlockArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}
	const { clientId, initialPosition } = parsed;
	const out = d.selectBlock( clientId, initialPosition );
	if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
		await ( out as Promise< unknown > );
	}
	scrollBlockIntoView( clientId );
	return { ok: true, client_id: clientId, initial_position: initialPosition };
}

function getBlocksRegistrySelect(): BlocksRegistrySelectors | null {
	try {
		return select( 'core/blocks' ) as unknown as BlocksRegistrySelectors;
	} catch {
		return null;
	}
}

function getBlockEditorRootSelect(): BlockEditorRootSelectors | null {
	try {
		return select( 'core/block-editor' ) as unknown as BlockEditorRootSelectors;
	} catch {
		return null;
	}
}

function getCreateBlockFn(): CreateBlockFn | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	const wp = ( window as unknown as { wp?: { blocks?: { createBlock?: CreateBlockFn } } } ).wp;
	const fn = wp?.blocks?.createBlock;
	return typeof fn === 'function' ? fn : null;
}

type SerializeBlockFn = ( block: unknown ) => string;

function getSerializeBlockFn(): SerializeBlockFn | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	const wp = ( window as unknown as { wp?: { blocks?: { serialize?: SerializeBlockFn } } } ).wp;
	const fn = wp?.blocks?.serialize;
	return typeof fn === 'function' ? fn : null;
}

/**
 * Detect a RichTextData (or RichText value) instance and flatten it to its HTML
 * string. Modern Gutenberg passes RichText attributes as objects shaped like
 * { text, formats, replacements } with a toHTMLString()/toString() method that
 * yields the canonical HTML; without this conversion the model only sees the
 * internal structure, which is noisy and loses inline formatting.
 */
function richTextValueToHtml( value: unknown ): string | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}
	const obj = value as {
		toHTMLString?: () => string;
		toString?: () => string;
		text?: unknown;
		formats?: unknown;
		replacements?: unknown;
	};
	if ( typeof obj.toHTMLString === 'function' ) {
		try {
			const html = obj.toHTMLString();
			if ( typeof html === 'string' ) {
				return html;
			}
		} catch {
			// fall through
		}
	}
	const looksLikeRichText =
		typeof obj.text === 'string' &&
		Array.isArray( obj.formats ) &&
		Array.isArray( obj.replacements );
	if ( looksLikeRichText ) {
		if ( typeof obj.toString === 'function' ) {
			try {
				const out = obj.toString();
				if ( typeof out === 'string' && out !== '[object Object]' ) {
					return out;
				}
			} catch {
				// fall through
			}
		}
		return obj.text as string;
	}
	return null;
}

function parseGetBlockTypesArgs( rawArgs: unknown ): {
	search?: string;
	category?: string;
} {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return {};
		}
		const search = typeof args.search === 'string' ? args.search.trim() : undefined;
		const category = typeof args.category === 'string' ? args.category.trim() : undefined;
		return {
			search: search && search.length ? search : undefined,
			category: category && category.length ? category : undefined,
		};
	} catch {
		return {};
	}
}

function parseGetBlockTypeArgs( rawArgs: unknown ): { name?: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return {};
		}
		const name = typeof args.name === 'string' ? args.name.trim() : undefined;
		return { name: name && name.length ? name : undefined };
	} catch {
		return {};
	}
}

export function executeGetBlockTypesTool( rawArgs: unknown ) {
	const reg = getBlocksRegistrySelect();
	if ( ! reg || typeof reg.getBlockTypes !== 'function' ) {
		return {
			ok: false,
			error: 'Block registry is not available (core/blocks store missing).',
		};
	}
	const { search, category } = parseGetBlockTypesArgs( rawArgs );

	const all = reg.getBlockTypes() || [];
	const lowerSearch = search?.toLowerCase();
	const filtered = all.filter( ( bt ) => {
		if ( category && bt.category !== category ) {
			return false;
		}
		if ( lowerSearch ) {
			const haystack = [
				bt.name,
				bt.title,
				bt.description,
				...( Array.isArray( bt.keywords ) ? bt.keywords : [] ),
			]
				.filter( ( v ): v is string => typeof v === 'string' )
				.join( ' ' )
				.toLowerCase();
			if ( ! haystack.includes( lowerSearch ) ) {
				return false;
			}
		}
		return true;
	} );

	const sliced = filtered.slice( 0, MAX_BLOCK_TYPES_RETURNED );
	return {
		ok: true,
		count: filtered.length,
		returned: sliced.length,
		truncated: filtered.length > sliced.length,
		names: sliced.map( ( bt ) => bt.name ),
	};
}

export function executeGetBlockTypeTool( rawArgs: unknown ) {
	const reg = getBlocksRegistrySelect();
	if ( ! reg || typeof reg.getBlockTypes !== 'function' ) {
		return {
			ok: false,
			error: 'Block registry is not available (core/blocks store missing).',
		};
	}
	const { name } = parseGetBlockTypeArgs( rawArgs );
	if ( ! name ) {
		return { ok: false, error: 'A "name" argument is required (e.g. "core/paragraph").' };
	}
	const bt =
		typeof reg.getBlockType === 'function'
			? reg.getBlockType( name )
			: reg.getBlockTypes().find( ( b ) => b.name === name );
	if ( ! bt ) {
		return { ok: false, error: `Block type "${ name }" is not registered in this editor.` };
	}
	return { ok: true, block_type: bt };
}

function normalizeInsertBlockSpec(
	value: unknown,
	depth: number
): { ok: true; spec: InsertBlockSpec } | { ok: false; error: string } {
	if ( depth <= 0 ) {
		return { ok: false, error: 'inner_blocks nested too deep.' };
	}
	if ( ! value || typeof value !== 'object' ) {
		return { ok: false, error: 'Block spec must be an object with a "name" string.' };
	}
	const obj = value as Record< string, unknown >;
	if ( typeof obj.name !== 'string' || ! obj.name.length ) {
		return { ok: false, error: 'Block spec is missing a non-empty "name".' };
	}
	let attributes: Record< string, unknown > | undefined;
	if ( obj.attributes !== undefined && obj.attributes !== null ) {
		if ( typeof obj.attributes !== 'object' || Array.isArray( obj.attributes ) ) {
			return { ok: false, error: 'attributes must be an object if provided.' };
		}
		attributes = obj.attributes as Record< string, unknown >;
	}
	let innerBlocks: InsertBlockSpec[] | undefined;
	if ( obj.inner_blocks !== undefined && obj.inner_blocks !== null ) {
		if ( ! Array.isArray( obj.inner_blocks ) ) {
			return { ok: false, error: 'inner_blocks must be an array if provided.' };
		}
		innerBlocks = [];
		for ( const child of obj.inner_blocks ) {
			const childRes = normalizeInsertBlockSpec( child, depth - 1 );
			if ( ! childRes.ok ) {
				return childRes;
			}
			innerBlocks.push( childRes.spec );
		}
	}
	return {
		ok: true,
		spec: { name: obj.name, attributes, inner_blocks: innerBlocks },
	};
}

function parseInsertBlockArgs( rawArgs: unknown ):
	| {
			ok: true;
			spec: InsertBlockSpec;
			index: number | undefined;
			rootClientId: string | undefined;
			afterClientId: string | undefined;
			updateSelection: boolean;
	  }
	| { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const specRes = normalizeInsertBlockSpec( args, MAX_INSERT_INNER_DEPTH );
		if ( ! specRes.ok ) {
			return specRes;
		}
		const idxRaw = args.index;
		let index: number | undefined;
		if ( idxRaw !== undefined && idxRaw !== null ) {
			if ( typeof idxRaw === 'number' && Number.isFinite( idxRaw ) && idxRaw >= 0 ) {
				index = Math.floor( idxRaw );
			} else {
				return { ok: false, error: 'index must be a non-negative finite number.' };
			}
		}
		const rootRaw = args.root_client_id;
		const rootClientId = typeof rootRaw === 'string' && rootRaw.length ? rootRaw : undefined;
		const afterRaw = args.after_client_id;
		const afterClientId = typeof afterRaw === 'string' && afterRaw.length ? afterRaw : undefined;
		const updateSelectionRaw = args.update_selection;
		const updateSelection = typeof updateSelectionRaw === 'boolean' ? updateSelectionRaw : true;
		return {
			ok: true,
			spec: specRes.spec,
			index,
			rootClientId,
			afterClientId,
			updateSelection,
		};
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

function buildBlockFromSpec(
	create: CreateBlockFn,
	spec: InsertBlockSpec
): { ok: true; block: unknown } | { ok: false; error: string } {
	const innerBlocks: unknown[] = [];
	if ( spec.inner_blocks ) {
		for ( const child of spec.inner_blocks ) {
			const childRes = buildBlockFromSpec( create, child );
			if ( ! childRes.ok ) {
				return childRes;
			}
			innerBlocks.push( childRes.block );
		}
	}
	try {
		const attributes =
			spec.name === 'core/table' && spec.attributes
				? sanitizeTableAttributes( spec.attributes )
				: spec.attributes ?? {};
		const block = create( spec.name, attributes, innerBlocks );
		if ( ! block || typeof block !== 'object' ) {
			return { ok: false, error: `createBlock returned an invalid block for "${ spec.name }".` };
		}
		return { ok: true, block };
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `createBlock("${ spec.name }") failed: ${ message }` };
	}
}

function summarizeCreatedBlock( block: unknown, depth: number ): SerializedBlock | null {
	if ( ! block || typeof block !== 'object' ) {
		return null;
	}
	return serializeBlock( block as Blockish, depth );
}

export async function executeInsertBlockTool( rawArgs: unknown ) {
	const reg = getBlocksRegistrySelect();
	if ( reg && typeof reg.getBlockType === 'function' ) {
		// Best-effort registry sanity check; if the registry exists but the block is unknown
		// we surface a helpful error before attempting to construct it.
	}

	const create = getCreateBlockFn();
	if ( ! create ) {
		return {
			ok: false,
			error:
				'wp.blocks.createBlock is not available. This tool only works inside the Gutenberg block editor.',
		};
	}
	const d = getBlockEditorDispatch();
	if ( ! d || typeof d.insertBlock !== 'function' ) {
		return {
			ok: false,
			error:
				'Block editor is not available (core/block-editor store missing or insertBlock missing).',
		};
	}
	const parsed = parseInsertBlockArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}

	if ( reg && typeof reg.getBlockType === 'function' && ! reg.getBlockType( parsed.spec.name ) ) {
		return {
			ok: false,
			error: `Block type "${ parsed.spec.name }" is not registered. Call get_block_types_tool to see available blocks.`,
		};
	}

	const built = buildBlockFromSpec( create, parsed.spec );
	if ( ! built.ok ) {
		return built;
	}

	let { index, rootClientId } = parsed;
	if ( parsed.afterClientId ) {
		const root = getBlockEditorRootSelect();
		if ( root?.getBlockRootClientId && root?.getBlockIndex ) {
			const parentId = root.getBlockRootClientId( parsed.afterClientId ) || undefined;
			const siblingIndex = root.getBlockIndex( parsed.afterClientId, parentId );
			if ( typeof siblingIndex === 'number' && siblingIndex >= 0 ) {
				rootClientId = parentId;
				index = siblingIndex + 1;
			}
		}
	}

	// Auto-wrap: when the block type declares a `parent` constraint (e.g.
	// core/button requires core/buttons) and we are inserting at the top
	// level, wrap the block inside an instance of its first allowed parent
	// so Gutenberg does not silently discard it.
	let blockToInsert = built.block;
	let wasAutoWrapped = false;
	if ( ! rootClientId && reg && typeof reg.getBlockType === 'function' ) {
		const bt = reg.getBlockType( parsed.spec.name );
		if ( bt?.parent && bt.parent.length > 0 ) {
			const wrapperName = bt.parent[ 0 ];
			const wrapperType = reg.getBlockType( wrapperName );
			if ( wrapperType ) {
				try {
					blockToInsert = create( wrapperName, {}, [ built.block ] );
					wasAutoWrapped = true;
				} catch {
					// Fall through — insert the original block and let Gutenberg decide.
				}
			}
		}
	}

	try {
		const out = d.insertBlock( blockToInsert, index, rootClientId, parsed.updateSelection );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `insertBlock failed: ${ message }` };
	}

	const insertedClientId = wasAutoWrapped
		? ( blockToInsert as { clientId?: string } | null )?.clientId
		: ( built.block as { clientId?: string } | null )?.clientId;
	scrollBlockIntoView( insertedClientId );

	return {
		ok: true,
		inserted: wasAutoWrapped
			? summarizeCreatedBlock( blockToInsert, MAX_INNER_DEPTH )
			: summarizeCreatedBlock( built.block, MAX_INNER_DEPTH ),
		auto_wrapped_in: wasAutoWrapped ? ( blockToInsert as { name?: string } ).name : undefined,
		index: index ?? null,
		root_client_id: rootClientId ?? null,
		update_selection: parsed.updateSelection,
	};
}

function resolvePlacement( parsed: {
	index?: number;
	rootClientId?: string;
	afterClientId?: string;
} ): { index: number | undefined; rootClientId: string | undefined } {
	let { index, rootClientId } = parsed;
	if ( parsed.afterClientId ) {
		const root = getBlockEditorRootSelect();
		if ( root?.getBlockRootClientId && root?.getBlockIndex ) {
			const parentId = root.getBlockRootClientId( parsed.afterClientId ) || undefined;
			const siblingIndex = root.getBlockIndex( parsed.afterClientId, parentId );
			if ( typeof siblingIndex === 'number' && siblingIndex >= 0 ) {
				rootClientId = parentId;
				index = siblingIndex + 1;
			}
		}
	}
	return { index, rootClientId };
}

function parseInsertBlocksArgs( rawArgs: unknown ):
	| {
			ok: true;
			specs: InsertBlockSpec[];
			index: number | undefined;
			rootClientId: string | undefined;
			afterClientId: string | undefined;
			updateSelection: boolean;
	  }
	| { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const blocksRaw = args.blocks;
		if ( ! Array.isArray( blocksRaw ) || ! blocksRaw.length ) {
			return { ok: false, error: 'blocks must be a non-empty array.' };
		}
		if ( blocksRaw.length > MAX_BATCH_BLOCKS ) {
			return {
				ok: false,
				error: `blocks length ${ blocksRaw.length } exceeds the limit of ${ MAX_BATCH_BLOCKS }.`,
			};
		}
		const specs: InsertBlockSpec[] = [];
		for ( const item of blocksRaw ) {
			const res = normalizeInsertBlockSpec( item, MAX_INSERT_INNER_DEPTH );
			if ( ! res.ok ) {
				return res;
			}
			specs.push( res.spec );
		}
		const idxRaw = args.index;
		let index: number | undefined;
		if ( idxRaw !== undefined && idxRaw !== null ) {
			if ( typeof idxRaw === 'number' && Number.isFinite( idxRaw ) && idxRaw >= 0 ) {
				index = Math.floor( idxRaw );
			} else {
				return { ok: false, error: 'index must be a non-negative finite number.' };
			}
		}
		const rootRaw = args.root_client_id;
		const rootClientId = typeof rootRaw === 'string' && rootRaw.length ? rootRaw : undefined;
		const afterRaw = args.after_client_id;
		const afterClientId = typeof afterRaw === 'string' && afterRaw.length ? afterRaw : undefined;
		const updateSelectionRaw = args.update_selection;
		const updateSelection = typeof updateSelectionRaw === 'boolean' ? updateSelectionRaw : true;
		return { ok: true, specs, index, rootClientId, afterClientId, updateSelection };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export async function executeInsertBlocksTool( rawArgs: unknown ) {
	const create = getCreateBlockFn();
	if ( ! create ) {
		return {
			ok: false,
			error:
				'wp.blocks.createBlock is not available. This tool only works inside the Gutenberg block editor.',
		};
	}
	const d = getBlockEditorDispatch();
	if ( ! d || typeof d.insertBlocks !== 'function' ) {
		return {
			ok: false,
			error:
				'Block editor is not available (core/block-editor store missing or insertBlocks missing).',
		};
	}
	const parsed = parseInsertBlocksArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}

	const reg = getBlocksRegistrySelect();
	const built: unknown[] = [];
	const insertedSummary: ( SerializedBlock | null )[] = [];
	for ( const spec of parsed.specs ) {
		if ( reg && typeof reg.getBlockType === 'function' && ! reg.getBlockType( spec.name ) ) {
			return {
				ok: false,
				error: `Block type "${ spec.name }" is not registered. Call get_block_types_tool to see available blocks.`,
			};
		}
		const res = buildBlockFromSpec( create, spec );
		if ( ! res.ok ) {
			return res;
		}
		built.push( res.block );
		insertedSummary.push( summarizeCreatedBlock( res.block, MAX_INNER_DEPTH ) );
	}

	const { index, rootClientId } = resolvePlacement( parsed );

	try {
		const out = d.insertBlocks( built, index, rootClientId, parsed.updateSelection );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `insertBlocks failed: ${ message }` };
	}

	const firstClientId = ( built[ 0 ] as { clientId?: string } | undefined )?.clientId;
	scrollBlockIntoView( firstClientId );

	return {
		ok: true,
		inserted: insertedSummary,
		count: insertedSummary.length,
		index: index ?? null,
		root_client_id: rootClientId ?? null,
		update_selection: parsed.updateSelection,
	};
}

function parseClientIdAndAttributes(
	rawArgs: unknown
):
	| { ok: true; clientId: string; attributes: Record< string, unknown > }
	| { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const id = args.client_id;
		if ( typeof id !== 'string' || ! id.length ) {
			return { ok: false, error: 'client_id is required and must be a non-empty string.' };
		}
		const attrs = args.attributes;
		if ( ! attrs || typeof attrs !== 'object' || Array.isArray( attrs ) ) {
			return { ok: false, error: 'attributes must be a plain object.' };
		}
		return { ok: true, clientId: id, attributes: attrs as Record< string, unknown > };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export async function executeUpdateBlockAttributesTool( rawArgs: unknown ) {
	const d = getBlockEditorDispatch();
	if ( ! d || typeof d.updateBlockAttributes !== 'function' ) {
		return {
			ok: false,
			error:
				'Block editor is not available (core/block-editor store missing or updateBlockAttributes missing).',
		};
	}
	const parsed = parseClientIdAndAttributes( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}
	const be = getBlockEditorSelect();
	const targetBlock = be?.getBlock?.( parsed.clientId ) ?? null;
	const nextAttributes =
		targetBlock?.name === 'core/table'
			? sanitizeTableAttributes( parsed.attributes )
			: parsed.attributes;
	try {
		const out = d.updateBlockAttributes( parsed.clientId, nextAttributes );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `updateBlockAttributes failed: ${ message }` };
	}
	scrollBlockIntoView( parsed.clientId );
	return { ok: true, client_id: parsed.clientId, updated_keys: Object.keys( nextAttributes ) };
}

function parseReplaceBlockArgs(
	rawArgs: unknown
): { ok: true; clientId: string; spec: InsertBlockSpec } | { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const id = args.client_id;
		if ( typeof id !== 'string' || ! id.length ) {
			return { ok: false, error: 'client_id is required and must be a non-empty string.' };
		}
		const specRes = normalizeInsertBlockSpec( args, MAX_INSERT_INNER_DEPTH );
		if ( ! specRes.ok ) {
			return specRes;
		}
		return { ok: true, clientId: id, spec: specRes.spec };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export async function executeReplaceBlockTool( rawArgs: unknown ) {
	const create = getCreateBlockFn();
	if ( ! create ) {
		return {
			ok: false,
			error:
				'wp.blocks.createBlock is not available. This tool only works inside the Gutenberg block editor.',
		};
	}
	const d = getBlockEditorDispatch();
	if ( ! d || typeof d.replaceBlock !== 'function' ) {
		return {
			ok: false,
			error:
				'Block editor is not available (core/block-editor store missing or replaceBlock missing).',
		};
	}
	const parsed = parseReplaceBlockArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}

	const reg = getBlocksRegistrySelect();
	if ( reg && typeof reg.getBlockType === 'function' && ! reg.getBlockType( parsed.spec.name ) ) {
		return {
			ok: false,
			error: `Block type "${ parsed.spec.name }" is not registered. Call get_block_types_tool to see available blocks.`,
		};
	}

	const built = buildBlockFromSpec( create, parsed.spec );
	if ( ! built.ok ) {
		return built;
	}

	try {
		const out = d.replaceBlock( parsed.clientId, built.block );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `replaceBlock failed: ${ message }` };
	}

	const newClientId = ( built.block as { clientId?: string } | null )?.clientId;
	scrollBlockIntoView( newClientId );

	return {
		ok: true,
		client_id: parsed.clientId,
		replaced_with: summarizeCreatedBlock( built.block, MAX_INNER_DEPTH ),
	};
}

function parseRemoveBlockArgs(
	rawArgs: unknown
): { ok: true; clientId: string; selectPrevious: boolean } | { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const id = args.client_id;
		if ( typeof id !== 'string' || ! id.length ) {
			return { ok: false, error: 'client_id is required and must be a non-empty string.' };
		}
		const sp = args.select_previous;
		const selectPrevious = typeof sp === 'boolean' ? sp : true;
		return { ok: true, clientId: id, selectPrevious };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export async function executeRemoveBlockTool( rawArgs: unknown ) {
	const d = getBlockEditorDispatch();
	if ( ! d || typeof d.removeBlock !== 'function' ) {
		return {
			ok: false,
			error:
				'Block editor is not available (core/block-editor store missing or removeBlock missing).',
		};
	}
	const parsed = parseRemoveBlockArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}
	try {
		const out = d.removeBlock( parsed.clientId, parsed.selectPrevious );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `removeBlock failed: ${ message }` };
	}
	if ( parsed.selectPrevious ) {
		const be = getBlockEditorSelect();
		const newSelectedClientId =
			be?.getSelectedBlockClientId?.() ?? be?.getSelectedBlock()?.clientId ?? null;
		scrollBlockIntoView( newSelectedClientId );
	}
	return { ok: true, client_id: parsed.clientId, select_previous: parsed.selectPrevious };
}

function parseMoveBlockArgs( rawArgs: unknown ):
	| {
			ok: true;
			clientId: string;
			direction?: 'up' | 'down';
			toIndex?: number;
			toRootClientId?: string;
	  }
	| { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const id = args.client_id;
		if ( typeof id !== 'string' || ! id.length ) {
			return { ok: false, error: 'client_id is required and must be a non-empty string.' };
		}
		const dir = args.direction;
		let direction: 'up' | 'down' | undefined;
		if ( dir !== undefined && dir !== null ) {
			if ( dir === 'up' || dir === 'down' ) {
				direction = dir;
			} else {
				return { ok: false, error: 'direction must be "up" or "down".' };
			}
		}
		const idxRaw = args.to_index;
		let toIndex: number | undefined;
		if ( idxRaw !== undefined && idxRaw !== null ) {
			if ( typeof idxRaw === 'number' && Number.isFinite( idxRaw ) && idxRaw >= 0 ) {
				toIndex = Math.floor( idxRaw );
			} else {
				return { ok: false, error: 'to_index must be a non-negative finite number.' };
			}
		}
		if ( ! direction && toIndex === undefined ) {
			return { ok: false, error: 'Either direction or to_index is required.' };
		}
		const rootRaw = args.to_root_client_id;
		const toRootClientId = typeof rootRaw === 'string' && rootRaw.length ? rootRaw : undefined;
		return { ok: true, clientId: id, direction, toIndex, toRootClientId };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export async function executeMoveBlockTool( rawArgs: unknown ) {
	const d = getBlockEditorDispatch();
	if ( ! d ) {
		return { ok: false, error: 'Block editor is not available (core/block-editor store missing).' };
	}
	const parsed = parseMoveBlockArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}
	const root = getBlockEditorRootSelect();
	const fromRootClientId = root?.getBlockRootClientId?.( parsed.clientId ) || undefined;

	try {
		if ( parsed.toIndex !== undefined ) {
			if ( typeof d.moveBlocksToPosition !== 'function' ) {
				return { ok: false, error: 'moveBlocksToPosition is not available in this editor build.' };
			}
			const out = d.moveBlocksToPosition(
				[ parsed.clientId ],
				fromRootClientId,
				parsed.toRootClientId ?? fromRootClientId,
				parsed.toIndex
			);
			if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
				await ( out as Promise< unknown > );
			}
		} else if ( parsed.direction === 'up' ) {
			if ( typeof d.moveBlocksUp !== 'function' ) {
				return { ok: false, error: 'moveBlocksUp is not available in this editor build.' };
			}
			const out = d.moveBlocksUp( [ parsed.clientId ], fromRootClientId );
			if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
				await ( out as Promise< unknown > );
			}
		} else if ( parsed.direction === 'down' ) {
			if ( typeof d.moveBlocksDown !== 'function' ) {
				return { ok: false, error: 'moveBlocksDown is not available in this editor build.' };
			}
			const out = d.moveBlocksDown( [ parsed.clientId ], fromRootClientId );
			if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
				await ( out as Promise< unknown > );
			}
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `move failed: ${ message }` };
	}

	scrollBlockIntoView( parsed.clientId );

	return {
		ok: true,
		client_id: parsed.clientId,
		direction: parsed.direction ?? null,
		to_index: parsed.toIndex ?? null,
		to_root_client_id: parsed.toRootClientId ?? null,
	};
}

function parseGetBlockArgs(
	rawArgs: unknown
): { ok: true; clientId: string } | { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const id = args.client_id;
		if ( typeof id !== 'string' || ! id.length ) {
			return { ok: false, error: 'client_id is required and must be a non-empty string.' };
		}
		return { ok: true, clientId: id };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export function executeGetBlockTool( rawArgs: unknown ) {
	const be = getBlockEditorSelect();
	if ( ! be ) {
		return { ok: false, error: 'Block editor is not available (core/block-editor store missing).' };
	}
	const parsed = parseGetBlockArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}
	if ( typeof be.getBlock !== 'function' ) {
		return { ok: false, error: 'getBlock is not available in this editor build.' };
	}
	const block = be.getBlock( parsed.clientId );
	if ( ! block ) {
		return { ok: true, block: null };
	}
	return { ok: true, block: serializeBlock( block, MAX_INNER_DEPTH ) };
}

type RichTextValue = {
	text: string;
	formats?: unknown[];
	[ key: string ]: unknown;
};

type RichTextApi = {
	create?: ( opts: { html?: string; text?: string } ) => RichTextValue;
	applyFormat?: (
		value: RichTextValue,
		format: { type: string; attributes?: Record< string, string > },
		start: number,
		end: number
	) => RichTextValue;
	toHTMLString?: ( opts: { value: RichTextValue } ) => string;
};

function getRichTextApi(): RichTextApi | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	const wp = ( window as unknown as { wp?: { richText?: RichTextApi } } ).wp;
	const api = wp?.richText;
	if (
		! api ||
		typeof api.create !== 'function' ||
		typeof api.applyFormat !== 'function' ||
		typeof api.toHTMLString !== 'function'
	) {
		return null;
	}
	return api;
}

function parseFormatTextArgs( rawArgs: unknown ):
	| {
			ok: true;
			format: string;
			url?: string;
			targetText?: string;
			clientId?: string;
			attributeKey: string;
	  }
	| { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const format = args.format;
		if ( typeof format !== 'string' || ! ( format in FORMAT_TYPE_BY_KEY ) ) {
			return {
				ok: false,
				error: `format must be one of: ${ Object.keys( FORMAT_TYPE_BY_KEY ).join( ', ' ) }.`,
			};
		}
		let url: string | undefined;
		if ( format === 'link' ) {
			if ( typeof args.url !== 'string' || ! args.url.length ) {
				return { ok: false, error: 'url is required when format is "link".' };
			}
			url = args.url;
		}
		const targetText =
			typeof args.target_text === 'string' && args.target_text.length
				? args.target_text
				: undefined;
		const clientId =
			typeof args.client_id === 'string' && args.client_id.length ? args.client_id : undefined;
		const attributeKey =
			typeof args.attribute_key === 'string' && args.attribute_key.length
				? args.attribute_key
				: 'content';
		return { ok: true, format, url, targetText, clientId, attributeKey };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export async function executeFormatTextTool( rawArgs: unknown ) {
	const richText = getRichTextApi();
	if ( ! richText ) {
		return {
			ok: false,
			error:
				'wp.richText is not available. This tool only works inside the Gutenberg block editor.',
		};
	}
	const be = getBlockEditorSelect();
	const d = getBlockEditorDispatch();
	if ( ! be || ! d || typeof d.updateBlockAttributes !== 'function' ) {
		return {
			ok: false,
			error: 'Block editor is not available (core/block-editor store missing).',
		};
	}
	const parsed = parseFormatTextArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}

	let clientId = parsed.clientId;
	if ( ! clientId ) {
		clientId = be.getSelectedBlockClientId?.() ?? be.getSelectedBlock()?.clientId;
	}
	if ( ! clientId ) {
		return { ok: false, error: 'No client_id provided and no block is currently selected.' };
	}

	const block = be.getBlock?.( clientId ) ?? null;
	if ( ! block ) {
		return { ok: false, error: `Block ${ clientId } not found.` };
	}
	const attrs = ( block.attributes ?? {} ) as Record< string, unknown >;
	const raw = attrs[ parsed.attributeKey ];
	let inputHtml: string;
	if ( typeof raw === 'string' ) {
		inputHtml = raw;
	} else {
		const converted = richTextValueToHtml( raw );
		if ( converted !== null ) {
			inputHtml = converted;
		} else {
			return {
				ok: false,
				error: `Block attribute "${ parsed.attributeKey }" is not a string and cannot be formatted.`,
			};
		}
	}

	let value: RichTextValue;
	try {
		value = richText.create!( { html: inputHtml } );
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `richText.create failed: ${ message }` };
	}

	let start = 0;
	let end = value.text.length;
	if ( parsed.targetText ) {
		const idx = value.text.toLowerCase().indexOf( parsed.targetText.toLowerCase() );
		if ( idx < 0 ) {
			return {
				ok: false,
				error: `target_text "${ parsed.targetText }" not found in block content.`,
			};
		}
		start = idx;
		end = idx + parsed.targetText.length;
	} else {
		const sStart = be.getSelectionStart?.();
		const sEnd = be.getSelectionEnd?.();
		const matchesBlock =
			sStart?.clientId === clientId &&
			sEnd?.clientId === clientId &&
			sStart?.attributeKey === parsed.attributeKey;
		if ( matchesBlock && typeof sStart?.offset === 'number' && typeof sEnd?.offset === 'number' ) {
			start = Math.min( sStart.offset, sEnd.offset );
			end = Math.max( sStart.offset, sEnd.offset );
		}
		if ( start === end ) {
			return {
				ok: false,
				error: 'No text selection in this block. Pass target_text to format a specific substring.',
			};
		}
	}

	const formatType = FORMAT_TYPE_BY_KEY[ parsed.format ];
	const formatPayload: { type: string; attributes?: Record< string, string > } = {
		type: formatType,
	};
	if ( parsed.format === 'link' && parsed.url ) {
		formatPayload.attributes = { url: parsed.url };
	}

	let nextValue: RichTextValue;
	try {
		nextValue = richText.applyFormat!( value, formatPayload, start, end );
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `richText.applyFormat failed: ${ message }` };
	}

	let html: string;
	try {
		html = richText.toHTMLString!( { value: nextValue } );
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `richText.toHTMLString failed: ${ message }` };
	}

	try {
		const out = d.updateBlockAttributes( clientId, { [ parsed.attributeKey ]: html } );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `updateBlockAttributes failed: ${ message }` };
	}

	scrollBlockIntoView( clientId );

	return {
		ok: true,
		client_id: clientId,
		attribute_key: parsed.attributeKey,
		format: parsed.format,
		range: { start, end },
	};
}
