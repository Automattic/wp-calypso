import { describe, expect, it } from 'vitest';
import { enhanceMessageWithTools } from '../messages';
import type { Ability, Message, ToolProvider } from '../../../types/index';

describe( 'enhanceMessageWithTools', () => {
	const createTestMessage = (): Message => ( {
		role: 'user',
		kind: 'message',
		parts: [
			{
				type: 'text',
				text: 'Test message',
			},
		],
		messageId: 'test-123',
	} );

	it( 'should add tool data parts to message', async () => {
		const toolProvider: ToolProvider = {
			async getAvailableTools() {
				return [
					{
						id: 'test_tool',
						name: 'Test Tool',
						description: 'A test tool',
						input_schema: {
							type: 'object',
							properties: {
								input: { type: 'string' },
							},
						},
					},
				];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		// Should have original text part plus tool data part
		expect( enhanced.parts ).toHaveLength( 2 );
		expect( enhanced.parts[ 0 ] ).toEqual( {
			type: 'text',
			text: 'Test message',
		} );
		expect( enhanced.parts[ 1 ] ).toEqual( {
			type: 'data',
			data: {
				toolId: 'test_tool',
				toolName: 'Test Tool',
				description: 'A test tool',
				inputSchema: {
					type: 'object',
					properties: {
						input: { type: 'string' },
					},
				},
			},
			metadata: {},
		} );
	} );

	it( 'should add ability data parts to message', async () => {
		const ability: Ability = {
			name: 'test/ability',
			label: 'Test Ability',
			description: 'A test ability',
			category: 'test',
			callback: async () => ( { result: 'test' } ),
		};

		const toolProvider: ToolProvider = {
			abilities: [ ability ],
			async getAvailableTools() {
				return [];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		// Should have original text part plus ability data part
		expect( enhanced.parts ).toHaveLength( 2 );
		expect( enhanced.parts[ 0 ] ).toEqual( {
			type: 'text',
			text: 'Test message',
		} );
		expect( enhanced.parts[ 1 ] ).toEqual( {
			type: 'data',
			data: {
				name: 'test/ability',
				label: 'Test Ability',
				description: 'A test ability',
				category: 'test',
				input_schema: undefined,
				output_schema: undefined,
				meta: undefined,
			},
			metadata: {},
		} );
	} );

	it( 'should add both tools and abilities to message', async () => {
		const ability: Ability = {
			name: 'demo/ability',
			label: 'Demo Ability',
			description: 'A demo ability',
			category: 'demo',
			input_schema: {
				type: 'object',
				properties: {
					value: { type: 'string' },
				},
			},
		};

		const toolProvider: ToolProvider = {
			abilities: [ ability ],
			async getAvailableTools() {
				return [
					{
						id: 'regular_tool',
						name: 'Regular Tool',
						description: 'A regular tool',
						input_schema: {
							type: 'object',
							properties: {},
						},
					},
				];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		// Should have original text part plus tool data part plus ability data part
		expect( enhanced.parts ).toHaveLength( 3 );
		expect( enhanced.parts[ 0 ].type ).toBe( 'text' );
		expect( enhanced.parts[ 1 ].type ).toBe( 'data' );
		expect( enhanced.parts[ 2 ].type ).toBe( 'data' );

		// Tool part
		const toolPart = enhanced.parts[ 1 ] as any;
		expect( toolPart.data.toolId ).toBe( 'regular_tool' );

		// Ability part
		const abilityPart = enhanced.parts[ 2 ] as any;
		expect( abilityPart.data.name ).toBe( 'demo/ability' );
	} );

	it( 'should add multiple abilities to message', async () => {
		const abilities: Ability[] = [
			{
				name: 'ability/one',
				label: 'Ability One',
				description: 'First ability',
				category: 'test',
			},
			{
				name: 'ability/two',
				label: 'Ability Two',
				description: 'Second ability',
				category: 'test',
			},
		];

		const toolProvider: ToolProvider = {
			abilities,
			async getAvailableTools() {
				return [];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		// Should have original text part plus two ability data parts
		expect( enhanced.parts ).toHaveLength( 3 );

		const abilityPart1 = enhanced.parts[ 1 ] as any;
		const abilityPart2 = enhanced.parts[ 2 ] as any;

		expect( abilityPart1.data.name ).toBe( 'ability/one' );
		expect( abilityPart2.data.name ).toBe( 'ability/two' );
	} );

	it( 'should return original message when no toolProvider', async () => {
		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, undefined );

		expect( enhanced ).toEqual( message );
		expect( enhanced.parts ).toHaveLength( 1 );
	} );

	it( 'should return original message when no tools or abilities', async () => {
		const toolProvider: ToolProvider = {
			async getAvailableTools() {
				return [];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		expect( enhanced ).toEqual( message );
		expect( enhanced.parts ).toHaveLength( 1 );
	} );

	it( 'should return original message when abilities array is empty', async () => {
		const toolProvider: ToolProvider = {
			abilities: [],
			async getAvailableTools() {
				return [];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		expect( enhanced ).toEqual( message );
		expect( enhanced.parts ).toHaveLength( 1 );
	} );

	it( 'should handle getAvailableTools error gracefully', async () => {
		const toolProvider: ToolProvider = {
			async getAvailableTools() {
				throw new Error( 'Failed to get tools' );
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		// Should return original message on error
		expect( enhanced ).toEqual( message );
		expect( enhanced.parts ).toHaveLength( 1 );
	} );

	it( 'should not include callback in ability data part', async () => {
		const ability: Ability = {
			name: 'callback/test',
			label: 'Callback Test',
			description: 'Test with callback',
			category: 'test',
			callback: async ( input: any ) => {
				return { result: input.value };
			},
		};

		const toolProvider: ToolProvider = {
			abilities: [ ability ],
			async getAvailableTools() {
				return [];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		const abilityPart = enhanced.parts[ 1 ] as any;
		expect( abilityPart.data ).not.toHaveProperty( 'callback' );
	} );

	it( 'should not include permissionCallback in ability data part', async () => {
		const ability: Ability = {
			name: 'permission/test',
			label: 'Permission Test',
			description: 'Test with permission callback',
			category: 'test',
			permissionCallback: async () => true,
		};

		const toolProvider: ToolProvider = {
			abilities: [ ability ],
			async getAvailableTools() {
				return [];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		const abilityPart = enhanced.parts[ 1 ] as any;
		expect( abilityPart.data ).not.toHaveProperty( 'permissionCallback' );
	} );

	it( 'should preserve ability schemas and metadata in data part', async () => {
		const ability: Ability = {
			name: 'full/ability',
			label: 'Full Ability',
			description: 'Ability with all fields',
			category: 'test',
			input_schema: {
				type: 'object',
				properties: {
					name: { type: 'string' },
				},
			},
			output_schema: {
				type: 'object',
				properties: {
					result: { type: 'string' },
				},
			},
			meta: {
				annotations: {
					instructions: 'Test instructions',
					readonly: true,
					destructive: false,
					idempotent: true,
				},
			},
		};

		const toolProvider: ToolProvider = {
			abilities: [ ability ],
			async getAvailableTools() {
				return [];
			},
			async executeTool() {
				return { result: 'test' };
			},
		};

		const message = createTestMessage();
		const enhanced = await enhanceMessageWithTools( message, toolProvider );

		const abilityPart = enhanced.parts[ 1 ] as any;
		expect( abilityPart.data.input_schema ).toEqual( ability.input_schema );
		expect( abilityPart.data.output_schema ).toEqual(
			ability.output_schema
		);
		expect( abilityPart.data.meta ).toEqual( ability.meta );
	} );
} );
