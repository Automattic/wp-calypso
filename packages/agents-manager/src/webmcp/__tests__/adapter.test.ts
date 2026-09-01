import * as blocks from '@wordpress/blocks';
import { createWebMcpAdapter, normalizeInputSchema, shouldExposeWebMcpAbility } from '../adapter';
import { WEBMCP_SERVER_ABILITY_NAMES } from '../contracts';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';
import type { WebMcpModelContext, WebMcpTool } from '../types';

jest.mock( '@wordpress/blocks', () => ( {
	...jest.requireActual( '@wordpress/blocks' ),
	parse: jest.fn(),
} ) );

const createAbility = ( overrides: Partial< Ability > = {} ): Ability => ( {
	name: 'big-sky/apply-block-edits',
	label: 'Apply block edits',
	description: 'Apply deterministic edits to the current block canvas.',
	category: 'big-sky',
	input_schema: {
		type: 'object',
		properties: { edits: { type: 'array' } },
	},
	meta: {
		annotations: {
			clientRegistered: true,
			readonly: false,
		},
	},
	...overrides,
} );

const createBlockTreeAbility = (): Ability => ( {
	name: 'agents-manager/get-block-tree',
	label: 'Get block tree',
	description: 'Read the current editor block tree.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true, readonly: true, idempotent: true } },
} );

const createShowTemplateAbility = (): Ability => ( {
	name: 'big-sky/show-template',
	label: 'Show the page template',
	description: 'Show the page template, then call big_sky__get_page_structure again.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {}, additionalProperties: false },
	meta: {
		annotations: { clientRegistered: true, readonly: false, idempotent: true },
	},
} );

const createServerAbility = ( name: string, overrides: Partial< Ability > = {} ): Ability => ( {
	name,
	label: name,
	description: `Description for ${ name }`,
	category: 'wpcom',
	input_schema: { type: 'object', properties: {} },
	meta: {
		annotations: {
			serverRegistered: true,
			readonly: true,
			idempotent: true,
		},
		instructions: `Instructions for ${ name }`,
	},
	...overrides,
} );

function createHarness( initialAbilities: Ability[] = [ createAbility() ] ) {
	let abilities = initialAbilities;
	const tools = new Map< string, WebMcpTool >();
	const signals = new Map< string, AbortSignal | undefined >();
	const toolProvider: ToolProvider = {
		getAbilities: jest.fn( async () => abilities ),
		executeAbility: jest.fn( async ( _name, input ) => ( { input } ) ),
	};
	const modelContext: WebMcpModelContext = {
		registerTool: jest.fn( async ( tool, options ) => {
			tools.set( tool.name, tool );
			signals.set( tool.name, options?.signal );
		} ),
	};
	const adapter = createWebMcpAdapter( { toolProvider, modelContext } );

	return {
		adapter,
		modelContext,
		setAbilities: ( next: Ability[] ) => {
			abilities = next;
		},
		signals,
		toolProvider,
		tools,
	};
}

describe( 'WebMCP adapter', () => {
	beforeEach( () => {
		jest.mocked( blocks.parse ).mockReset().mockReturnValue( [] );
	} );

	it( 'normalizes missing and malformed input schemas', () => {
		expect( normalizeInputSchema( undefined ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( 'invalid' ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( [] ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( { properties: { value: { type: 'string' } } } ) ).toEqual( {
			properties: { value: { type: 'string' } },
			type: 'object',
		} );
		expect( normalizeInputSchema( { anyOf: [ { type: 'string' } ] } ) ).toEqual( {
			anyOf: [ { type: 'string' } ],
		} );
		expect( normalizeInputSchema( { oneOf: [ { type: 'number' } ] } ) ).toEqual( {
			oneOf: [ { type: 'number' } ],
		} );
	} );

	it( 'requires the explicit allowlist and matching client or server provenance', () => {
		expect( shouldExposeWebMcpAbility( createAbility() ) ).toBe( true );
		expect( shouldExposeWebMcpAbility( createBlockTreeAbility() ) ).toBe( true );
		expect( shouldExposeWebMcpAbility( createShowTemplateAbility() ) ).toBe( true );
		for ( const name of WEBMCP_SERVER_ABILITY_NAMES ) {
			expect( shouldExposeWebMcpAbility( createServerAbility( name ) ) ).toBe( true );
		}
		expect(
			shouldExposeWebMcpAbility( createAbility( { meta: undefined, callback: jest.fn() } ) )
		).toBe( true );
		expect( shouldExposeWebMcpAbility( createAbility( { name: 'big-sky/save-post' } ) ) ).toBe(
			false
		);
		expect(
			shouldExposeWebMcpAbility(
				createAbility( {
					meta: { annotations: { serverRegistered: true, clientRegistered: true } },
				} )
			)
		).toBe( false );
		expect( shouldExposeWebMcpAbility( createServerAbility( 'wpcom/delete-site' ) ) ).toBe( false );
		expect(
			shouldExposeWebMcpAbility(
				createServerAbility( 'wpcom/get-posts', {
					meta: { annotations: { clientRegistered: true } },
				} )
			)
		).toBe( false );
		expect(
			shouldExposeWebMcpAbility(
				createServerAbility( 'wpcom/get-posts', {
					meta: { annotations: { serverRegistered: true, readonly: false } },
				} )
			)
		).toBe( false );
		expect(
			shouldExposeWebMcpAbility(
				createServerAbility( 'wpcom/media-create', {
					meta: { annotations: { serverRegistered: true, readonly: false } },
				} )
			)
		).toBe( true );
		expect(
			shouldExposeWebMcpAbility(
				createAbility( { meta: { annotations: {} }, callback: undefined } )
			)
		).toBe( false );
	} );

	it( 'registers a server ability with its schema and executes through the provider', async () => {
		const ability = createServerAbility( 'wpcom/get-posts', {
			input_schema: {
				type: 'object',
				properties: { fields: { type: 'string', enum: [ 'summary', 'full' ] } },
			},
		} );
		const harness = createHarness( [ ability ] );
		await harness.adapter.sync();

		const tool = harness.tools.get( 'wpcom__get_posts' );
		expect( tool ).toMatchObject( {
			description: expect.stringContaining( 'Instructions for wpcom/get-posts' ),
			inputSchema: ability.input_schema,
			annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
		} );
		await tool?.execute( { fields: 'summary' } );
		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith( 'wpcom/get-posts', {
			fields: 'summary',
		} );
	} );

	it( 'maps show-template guidance to the WebMCP block reader', async () => {
		const harness = createHarness( [ createShowTemplateAbility() ] );
		( harness.toolProvider.executeAbility as jest.Mock ).mockResolvedValue( {
			result: {
				success: true,
				message: 'The template is showing.',
				details: {
					nextStep: 'Call big_sky__get_page_structure again before editing.',
				},
			},
			returnToAgent: true,
		} );
		await harness.adapter.sync();

		const tool = harness.tools.get( 'big_sky__show_template' );
		expect( tool ).toMatchObject( {
			description: expect.stringContaining( 'agents_manager__get_block_tree' ),
			inputSchema: { type: 'object', properties: {}, additionalProperties: false },
			annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
		} );
		await expect( tool?.execute( {} ) ).resolves.toEqual( {
			result: {
				success: true,
				message: 'The template is showing.',
				details: {
					nextStep: 'Call agents_manager__get_block_tree again before editing.',
				},
			},
			returnToAgent: true,
		} );
		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'big-sky/show-template',
			{}
		);
	} );

	it( 'registers mapped metadata and executes through the provider with the original name', async () => {
		const harness = createHarness();
		await harness.adapter.sync();

		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 1 );
		const tool = harness.tools.get( 'big_sky__apply_block_edits' );
		expect( tool ).toMatchObject( {
			name: 'big_sky__apply_block_edits',
			title: 'Apply block edits',
			description: expect.stringContaining( 'agents_manager__get_block_tree' ),
			inputSchema: {
				type: 'object',
				properties: {
					updates: expect.objectContaining( { type: 'array' } ),
					inserts: expect.objectContaining( { type: 'array' } ),
					deletes: expect.objectContaining( {
						type: 'array',
						items: { type: 'string' },
					} ),
				},
				additionalProperties: false,
			},
			annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
		} );

		const input = {
			updates: [ { clientId: 'block-1', name: 'core/paragraph', attributes: {} } ],
			customCSS: 'body { display: none }',
		};
		await expect( tool?.execute( input ) ).resolves.toEqual( {
			input: {
				updates: input.updates,
				reverseMap: {},
				suppressAssistantMessage: true,
			},
		} );
		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'big-sky/apply-block-edits',
			{
				updates: input.updates,
				reverseMap: {},
				suppressAssistantMessage: true,
			}
		);
	} );

	it( 'pairs the block-tree IDs with the edit bridge', async () => {
		const harness = createHarness( [ createBlockTreeAbility(), createAbility() ] );
		( harness.toolProvider.executeAbility as jest.Mock ).mockImplementation(
			async ( name: string, input: unknown ) => {
				if ( name === 'agents-manager/get-block-tree' ) {
					return {
						result: {
							success: true,
							details: {
								blocks: [
									{
										clientId: 'group-1',
										innerBlocks: [ { clientId: 'paragraph-1', innerBlocks: [] } ],
									},
								],
							},
						},
						returnToAgent: true,
					};
				}

				return { input };
			}
		);
		await harness.adapter.sync();

		const readTool = harness.tools.get( 'agents_manager__get_block_tree' );
		expect( readTool ).toMatchObject( {
			annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
		} );
		await readTool?.execute( {} );

		const editInput = {
			updates: [
				{ clientId: 'paragraph-1', name: 'core/paragraph', attributes: { content: 'Updated' } },
			],
			summary: 'Updated the paragraph.',
		};
		await harness.tools.get( 'big_sky__apply_block_edits' )?.execute( editInput );

		expect( harness.toolProvider.executeAbility ).toHaveBeenLastCalledWith(
			'big-sky/apply-block-edits',
			{
				...editInput,
				reverseMap: {
					'group-1': 'group-1',
					'paragraph-1': 'paragraph-1',
				},
				suppressAssistantMessage: true,
			}
		);
	} );

	it( 'turns pattern markup into ordered block insertions', async () => {
		jest.mocked( blocks.parse ).mockReturnValue( [
			{
				clientId: 'parsed-heading',
				name: 'core/heading',
				isValid: true,
				attributes: { content: 'Pattern heading' },
				innerBlocks: [],
			},
			{
				clientId: 'parsed-paragraph',
				name: 'core/paragraph',
				isValid: true,
				attributes: { content: 'Pattern copy' },
				innerBlocks: [],
			},
		] );
		const harness = createHarness();
		await harness.adapter.sync();

		await harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {
			inserts: [
				{
					parentClientId: 'group-1',
					index: 2,
					blockMarkup:
						'<!-- wp:heading --><h2 class="wp-block-heading">Pattern heading</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Pattern copy</p><!-- /wp:paragraph -->',
				},
			],
			summary: 'Inserted a pattern.',
		} );

		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'big-sky/apply-block-edits',
			{
				inserts: [
					{
						parentClientId: 'group-1',
						index: 2,
						block: {
							name: 'core/heading',
							attributes: { content: 'Pattern heading' },
						},
					},
					{
						parentClientId: 'group-1',
						index: 3,
						block: {
							name: 'core/paragraph',
							attributes: { content: 'Pattern copy' },
						},
					},
				],
				summary: 'Inserted a pattern.',
				reverseMap: {},
				suppressAssistantMessage: true,
			}
		);
		expect( blocks.parse ).toHaveBeenCalledWith( expect.stringContaining( 'Pattern heading' ) );
	} );

	it( 'rejects empty pattern markup before dispatching the edit', async () => {
		const harness = createHarness();
		await harness.adapter.sync();

		await expect(
			harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {
				inserts: [ { blockMarkup: '' } ],
			} )
		).rejects.toThrow( 'did not contain any Gutenberg blocks' );
		expect( harness.toolProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'returns structured provider results without double encoding', async () => {
		const harness = createHarness();
		const result = { result: { success: true }, returnToAgent: true };
		( harness.toolProvider.executeAbility as jest.Mock ).mockResolvedValue( result );
		await harness.adapter.sync();

		await expect( harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {} ) ).resolves.toBe(
			result
		);
	} );

	it( 'preserves provider execution rejections', async () => {
		const harness = createHarness();
		const error = new Error( 'Canvas rejected the edit' );
		( harness.toolProvider.executeAbility as jest.Mock ).mockRejectedValue( error );
		await harness.adapter.sync();

		await expect( harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {} ) ).rejects.toBe(
			error
		);
	} );

	it( 'does not dispatch an already-aborted execution', async () => {
		const harness = createHarness();
		await harness.adapter.sync();
		const controller = new AbortController();
		controller.abort();

		await expect(
			harness.tools
				.get( 'big_sky__apply_block_edits' )
				?.execute( {}, { signal: controller.signal } )
		).rejects.toMatchObject( { name: 'AbortError' } );
		expect( harness.toolProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'reconciles late, removed, and changed abilities without duplicates', async () => {
		const harness = createHarness( [] );
		await harness.adapter.sync();
		expect( harness.modelContext.registerTool ).not.toHaveBeenCalled();

		harness.setAbilities( [ createAbility() ] );
		await harness.adapter.sync();
		await harness.adapter.sync();
		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 1 );

		const firstSignal = harness.signals.get( 'big_sky__apply_block_edits' );
		harness.setAbilities( [ createAbility( { label: 'Updated label' } ) ] );
		await harness.adapter.sync();
		expect( firstSignal?.aborted ).toBe( true );
		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 2 );

		const secondSignal = harness.signals.get( 'big_sky__apply_block_edits' );
		harness.setAbilities( [] );
		await harness.adapter.sync();
		expect( secondSignal?.aborted ).toBe( true );
	} );

	it( 'serializes overlapping synchronization', async () => {
		const harness = createHarness();
		let releaseFirst: () => void = () => {};
		( harness.toolProvider.getAbilities as jest.Mock )
			.mockImplementationOnce(
				() =>
					new Promise< Ability[] >(
						( resolve ) => ( releaseFirst = () => resolve( [ createAbility() ] ) )
					)
			)
			.mockResolvedValue( [ createAbility() ] );

		const first = harness.adapter.sync();
		await Promise.resolve();
		const second = harness.adapter.sync();
		releaseFirst();
		await Promise.all( [ first, second ] );

		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 1 );
		expect( harness.toolProvider.getAbilities ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'disposal unregisters every owned tool', async () => {
		const harness = createHarness();
		await harness.adapter.sync();
		const signal = harness.signals.get( 'big_sky__apply_block_edits' );

		harness.adapter.dispose();
		expect( signal?.aborted ).toBe( true );
		await expect( harness.adapter.sync() ).resolves.toBeUndefined();
	} );

	it( 'surfaces registration failures and can retry them', async () => {
		const harness = createHarness();
		( harness.modelContext.registerTool as jest.Mock )
			.mockRejectedValueOnce( new Error( 'Invalid WebMCP schema' ) )
			.mockResolvedValueOnce( undefined );

		await expect( harness.adapter.sync() ).rejects.toThrow( 'Invalid WebMCP schema' );
		await expect( harness.adapter.sync() ).resolves.toBeUndefined();
		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 2 );
	} );
} );
