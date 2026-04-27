import { dispatch, select } from '@wordpress/data';

export const GET_EDITOR_BLOCKS_TOOL_NAME = 'get_editor_blocks_tool';
export const GET_SELECTED_BLOCK_TOOL_NAME = 'get_selected_block_tool';
export const GET_INSERTER_ITEMS_TOOL_NAME = 'get_inserter_items_tool';
export const HAS_SELECTED_BLOCK_TOOL_NAME = 'has_selected_block_tool';
export const SELECT_BLOCK_TOOL_NAME = 'select_block';

const MAX_INNER_DEPTH = 12;
const MAX_INSERTER_ITEM_FIELDS = 250;

type Blockish = {
	name: string;
	clientId: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: Blockish[];
};

type SerializedBlock = {
	name: string;
	clientId: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: SerializedBlock[];
};

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

type BlockEditorSelectors = {
	getBlocks: ( rootClientId?: string ) => Blockish[];
	getSelectedBlock: () => Blockish | null;
	hasSelectedBlock: () => boolean;
	getInserterItems?: ( rootClientId?: string ) => InserterItemLike[];
	__unstableGetInserterItems?: ( rootClientId?: string ) => InserterItemLike[];
};

type BlockEditorActions = {
	selectBlock: ( clientId: string, initialPosition?: number | null ) => void | Promise< unknown >;
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

function serializeBlock( block: Blockish, depth: number ): SerializedBlock {
	if ( depth <= 0 ) {
		return { name: block.name, clientId: block.clientId, innerBlocks: [] };
	}
	return {
		name: block.name,
		clientId: block.clientId,
		attributes: truncateAttributes( block.attributes ),
		innerBlocks: Array.isArray( block.innerBlocks )
			? block.innerBlocks.map( ( b ) => serializeBlock( b, depth - 1 ) )
			: undefined,
	};
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
	return { ok: true, client_id: clientId, initial_position: initialPosition };
}
