import * as blocks from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { type Mock, vi } from 'vitest';
import { createWebMcpAdapter, normalizeInputSchema, shouldExposeWebMcpAbility } from '../adapter';
import { WEBMCP_SERVER_ABILITY_NAMES } from '../contracts';
import type { ToolProvider } from '../../extension-types';
import type { WebMcpModelContext, WebMcpTool } from '../types';
import type { Ability } from '@wordpress/abilities';

vi.mock( '@wordpress/blocks', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/blocks' ) >( '@wordpress/blocks' ) ),
	parse: vi.fn(),
} ) );

vi.mock( '@wordpress/data', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/data' ) >( '@wordpress/data' ) ),
	select: vi.fn(),
} ) );

function openInEditor( postType: string, postId: number ) {
	vi.mocked( select ).mockReturnValue( {
		getCurrentPostType: () => postType,
		getCurrentPostId: () => postId,
	} as unknown as ReturnType< typeof select > );
}

const flaggedMeta = { webmcp: { public: true } };

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
		...flaggedMeta,
	},
	callback: vi.fn(),
	...overrides,
} );

const createBlockTreeAbility = (): Ability => ( {
	name: 'agents-manager/get-block-tree',
	label: 'Get block tree',
	description: 'Read the current editor block tree.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {} },
	meta: {
		annotations: { clientRegistered: true, readonly: true, idempotent: true },
		webmcp: { public: true },
	},
	callback: vi.fn(),
} );

const createShowTemplateAbility = (): Ability => ( {
	name: 'big-sky/show-template',
	label: 'Show the page template',
	description: 'Show the page template.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {}, additionalProperties: false },
	meta: {
		annotations: { clientRegistered: true, readonly: false, idempotent: true },
		webmcp: { public: true },
	},
	callback: vi.fn(),
} );

const createEditEntityRecordAbility = (): Ability =>
	createAbility( {
		name: 'big-sky/edit-entity-record',
		label: 'Manage Entity Records',
		description: 'Create, edit, or delete WordPress data entity records using the data layer',
		input_schema: { type: 'object', properties: { addEntities: { type: 'array' } } },
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
		getAbilities: vi.fn( async () => abilities ),
		executeAbility: vi.fn( async ( _name, input ) => ( { input } ) ),
	};
	const modelContext: WebMcpModelContext = {
		registerTool: vi.fn( async ( tool, options ) => {
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
		vi.mocked( blocks.parse ).mockReset().mockReturnValue( [] );
	} );

	afterEach( () => vi.restoreAllMocks() );

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

	it.each< [ string, Ability ] >( [
		[ 'a flagged ability with a client callback', createAbility() ],
		...WEBMCP_SERVER_ABILITY_NAMES.map( ( name ): [ string, Ability ] => [
			`the read-only server ability ${ name }`,
			createServerAbility( name ),
		] ),
	] )( 'exposes %s', ( _case, ability ) => {
		expect( shouldExposeWebMcpAbility( ability ) ).toBe( true );
	} );

	it.each< [ string, Ability ] >( [
		[
			'an unflagged ability',
			createAbility( { meta: { annotations: { clientRegistered: true } } } ),
		],
		[
			'an ability whose flag is not public',
			createAbility( { meta: { annotations: { clientRegistered: true }, webmcp: true } } ),
		],
		[
			'a flagged server-registered ability',
			createAbility( {
				meta: { ...flaggedMeta, annotations: { serverRegistered: true, clientRegistered: true } },
			} ),
		],
		[
			'a flagged client-registered ability without a callback',
			createAbility( { callback: undefined } ),
		],
		[
			'a flagged server ability off the server allowlist',
			createServerAbility( 'wpcom/delete-site', {
				meta: { ...flaggedMeta, annotations: { serverRegistered: true, readonly: true } },
			} ),
		],
		[
			'a client ability named like an allowlisted server ability',
			createServerAbility( 'wpcom/get-block-schemas', {
				meta: { ...flaggedMeta, annotations: { clientRegistered: true } },
				callback: vi.fn(),
			} ),
		],
		[
			'an allowlisted server ability that is not read-only',
			createServerAbility( 'wpcom/get-block-schemas', {
				meta: { annotations: { serverRegistered: true, readonly: false } },
			} ),
		],
	] )( 'hides %s', ( _case, ability ) => {
		expect( shouldExposeWebMcpAbility( ability ) ).toBe( false );
	} );

	it.each< [ string, Ability, string ] >( [
		[
			'server-registered',
			createAbility( { meta: { ...flaggedMeta, annotations: { serverRegistered: true } } } ),
			'it is server-registered',
		],
		[
			'missing a client callback',
			createAbility( { callback: undefined } ),
			'it has no client callback',
		],
	] )( 'warns once about a flagged ability that is %s', async ( _case, ability, reason ) => {
		// eslint-disable-next-line no-console
		const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const harness = createHarness( [ ability ] );

		await harness.adapter.sync();
		await harness.adapter.sync();

		expect( warn ).toHaveBeenCalledTimes( 1 );
		expect( warn ).toHaveBeenCalledWith(
			expect.stringContaining( `WebMCP doesn't expose big-sky/apply-block-edits: ${ reason }` )
		);
	} );

	it( "doesn't warn about exposed or unflagged abilities", async () => {
		// eslint-disable-next-line no-console
		const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const harness = createHarness( [
			createAbility(),
			createAbility( { name: 'big-sky/unflagged', meta: {} } ),
			createServerAbility( 'wpcom/get-block-schemas' ),
		] );

		await harness.adapter.sync();

		expect( warn ).not.toHaveBeenCalled();
	} );

	it( 'registers a server ability with its schema and executes through the provider', async () => {
		const ability = createServerAbility( 'wpcom/get-block-schemas', {
			input_schema: {
				type: 'object',
				properties: { fields: { type: 'string', enum: [ 'summary', 'full' ] } },
			},
		} );
		const harness = createHarness( [ ability ] );
		await harness.adapter.sync();

		const tool = harness.tools.get( 'wpcom__get_block_schemas' );
		expect( tool ).toMatchObject( {
			description: expect.stringContaining( 'Instructions for wpcom/get-block-schemas' ),
			inputSchema: ability.input_schema,
			annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
		} );

		await tool?.execute( { fields: 'summary' } );

		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith( 'wpcom/get-block-schemas', {
			fields: 'summary',
		} );
	} );

	it( 'maps show-template guidance to the WebMCP block reader', async () => {
		const harness = createHarness( [ createShowTemplateAbility() ] );
		( harness.toolProvider.executeAbility as Mock ).mockResolvedValue( {
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
			description: 'Apply deterministic edits to the current block canvas.',
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
			},
		} );
		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'big-sky/apply-block-edits',
			{
				updates: input.updates,
				reverseMap: {},
			}
		);
	} );

	it( 'pairs the block-tree IDs with the edit bridge', async () => {
		const harness = createHarness( [ createBlockTreeAbility(), createAbility() ] );
		( harness.toolProvider.executeAbility as Mock ).mockImplementation(
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
			}
		);
	} );

	it( 'turns pattern markup into ordered block insertions', async () => {
		vi.mocked( blocks.parse ).mockReturnValue( [
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

	it( 'exposes only title and excerpt edits for the entity record tool', async () => {
		const harness = createHarness( [ createEditEntityRecordAbility() ] );
		await harness.adapter.sync();

		expect( harness.tools.get( 'big_sky__edit_entity_record' ) ).toMatchObject( {
			inputSchema: {
				description: expect.stringContaining( 'post or page open in the editor' ),
				properties: { title: { type: 'string' }, excerpt: { type: 'string' } },
				additionalProperties: false,
			},
		} );
	} );

	it( 'targets the open post when editing its title', async () => {
		openInEditor( 'page', 42 );
		const harness = createHarness( [ createEditEntityRecordAbility() ] );
		await harness.adapter.sync();

		await harness.tools.get( 'big_sky__edit_entity_record' )?.execute( { title: 'About us' } );

		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'big-sky/edit-entity-record',
			{
				editEntities: [
					{
						entityType: 'postType',
						entityName: 'page',
						recordId: 42,
						record: { title: 'About us' },
					},
				],
			}
		);
	} );

	it.each( [
		[ 'a template is open', 'wp_template', { title: 'Home' }, 'does not have a post or page open' ],
		[ 'a field is not allowed', 'post', { status: 'publish' }, 'Unknown field: status' ],
		[ 'a field is not a string', 'post', { title: 7 }, 'must be strings' ],
		[ 'no field is given', 'post', {}, 'Provide a title or an excerpt' ],
	] )( 'refuses an entity record edit when %s', async ( _case, postType, input, message ) => {
		openInEditor( postType, 42 );
		const harness = createHarness( [ createEditEntityRecordAbility() ] );
		await harness.adapter.sync();

		await expect(
			harness.tools.get( 'big_sky__edit_entity_record' )?.execute( input )
		).rejects.toThrow( message );
		expect( harness.toolProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( "uses a client ability's own description and leaves out its chat instructions", async () => {
		const ability = createEditEntityRecordAbility();
		const harness = createHarness( [
			{ ...ability, meta: { ...ability.meta, instructions: 'Chat-only instructions.' } },
		] );

		await harness.adapter.sync();

		expect( harness.tools.get( 'big_sky__edit_entity_record' )?.description ).toBe(
			ability.description
		);
	} );

	it( 'returns structured provider results without double encoding', async () => {
		const harness = createHarness();
		const result = { result: { success: true }, returnToAgent: true };
		( harness.toolProvider.executeAbility as Mock ).mockResolvedValue( result );
		await harness.adapter.sync();

		await expect( harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {} ) ).resolves.toBe(
			result
		);
	} );

	it( 'preserves provider execution rejections', async () => {
		const harness = createHarness();
		const error = new Error( 'Canvas rejected the edit' );
		( harness.toolProvider.executeAbility as Mock ).mockRejectedValue( error );
		await harness.adapter.sync();

		await expect( harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {} ) ).rejects.toBe(
			error
		);
	} );

	it.each<
		[ string, ( controller: AbortController, harness: ReturnType< typeof createHarness > ) => void ]
	>( [
		[ 'before the call', ( controller ) => controller.abort() ],
		[
			'while the tool is looked up',
			( controller, harness ) =>
				( harness.toolProvider.getAbilities as Mock ).mockImplementationOnce( async () => {
					controller.abort();

					return [ createAbility() ];
				} ),
		],
	] )( 'does not dispatch an execution aborted %s', async ( _case, abort ) => {
		const harness = createHarness();
		await harness.adapter.sync();
		const controller = new AbortController();
		abort( controller, harness );

		await expect(
			harness.tools
				.get( 'big_sky__apply_block_edits' )
				?.execute( {}, { signal: controller.signal } )
		).rejects.toMatchObject( { name: 'AbortError' } );

		expect( harness.toolProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it.each< [ string, string, Ability, Ability[] ] >( [
		[ 'removed', 'big_sky__apply_block_edits', createAbility(), [] ],
		[
			'replaced by an unflagged ability',
			'big_sky__apply_block_edits',
			createAbility(),
			[ createAbility( { meta: { annotations: { clientRegistered: true } } } ) ],
		],
		[
			'no longer read-only on the server',
			'wpcom__get_block_schemas',
			createServerAbility( 'wpcom/get-block-schemas' ),
			[
				createServerAbility( 'wpcom/get-block-schemas', {
					meta: { annotations: { serverRegistered: true, readonly: false } },
				} ),
			],
		],
	] )(
		'refuses a tool whose ability was %s before the next sync',
		async ( _case, toolName, ability, next ) => {
			const harness = createHarness( [ ability ] );
			await harness.adapter.sync();
			harness.setAbilities( next );

			await expect( harness.tools.get( toolName )?.execute( {} ) ).rejects.toThrow(
				'no longer available'
			);

			expect( harness.toolProvider.executeAbility ).not.toHaveBeenCalled();
		}
	);

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
		( harness.toolProvider.getAbilities as Mock )
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

	it( 'registers the other tools when one fails and retries it on the next sync', async () => {
		const harness = createHarness( [ createAbility(), createBlockTreeAbility() ] );
		( harness.modelContext.registerTool as Mock ).mockRejectedValueOnce(
			new Error( 'Invalid WebMCP schema' )
		);

		await expect( harness.adapter.sync() ).rejects.toThrow( 'Invalid WebMCP schema' );

		expect( [ ...harness.tools.keys() ] ).toEqual( [ 'agents_manager__get_block_tree' ] );

		await expect( harness.adapter.sync() ).resolves.toBeUndefined();

		expect( [ ...harness.tools.keys() ] ).toEqual( [
			'agents_manager__get_block_tree',
			'big_sky__apply_block_edits',
		] );
	} );
} );
