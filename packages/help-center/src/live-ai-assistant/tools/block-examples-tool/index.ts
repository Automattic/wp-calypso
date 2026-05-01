import { getBlockExamples, getBlocksWithExamples } from '../../block-examples';

export const GET_BLOCK_EXAMPLES_TOOL_NAME = 'get_block_examples_tool';

export const getBlockExamplesToolDefinition = {
	type: 'function',
	name: GET_BLOCK_EXAMPLES_TOOL_NAME,
	description:
		"Return curated reference examples for a Gutenberg block, when one is available. Each example is the canonical comment-delimited HTML for that block (including the JSON attributes inside the `<!-- wp:... -->` comment and the saved fallback markup). Use this BEFORE insert_block_tool / replace_block_tool whenever you need to compose a non-trivial block whose exact attribute shape you are not sure of (e.g. jetpack/map, embeds, structured/data-driven blocks). When an example exists, copy its attribute shape verbatim and substitute the user's data; do not invent attribute keys. Returns an empty list when no curated example exists for the block — in that case, fall back to get_block_type_tool. The response also includes which other blocks currently have examples.",
	parameters: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
				description: 'Exact block name to look up examples for, e.g. "jetpack/map".',
			},
		},
		required: [ 'name' ],
		additionalProperties: false,
	},
} as const;

interface ParsedArgs {
	name?: string;
}

function parseArgs( rawArgs: unknown ): ParsedArgs {
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

export function executeGetBlockExamplesTool( rawArgs: unknown ) {
	const { name } = parseArgs( rawArgs );
	if ( ! name ) {
		return { ok: false, error: 'A "name" argument is required (e.g. "jetpack/map").' };
	}
	const examples = getBlockExamples( name );
	return {
		ok: true,
		name,
		count: examples.length,
		examples: examples.map( ( ex ) => ( {
			title: ex.title,
			notes: ex.notes,
			serialized_html: ex.serializedHtml,
		} ) ),
		blocks_with_examples: getBlocksWithExamples(),
	};
}
