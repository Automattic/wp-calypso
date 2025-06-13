import type {
	Tool,
	ToolProvider,
	ToolResultDataPart,
} from '../client/types/index';
import { cliLog, logger } from '../client/utils/logger';

/**
 * Callback type for sending tool results back to the agent
 */
export type SendToolResultCallback = (
	toolResult: ToolResultDataPart
) => Promise< void >;

/**
 * Tool registry interface for CLI usage
 */
interface ToolRegistry {
	tools: Map< string, Tool & { callback: ( args: any ) => Promise< any > } >;
}

/**
 * Create a CLI tool provider with the simplified interface
 */
export function createCLIToolProvider(): ToolProvider & {
	registerTool: (
		tool: Tool,
		callback: ( args: any ) => Promise< any >
	) => void;
	unregisterTool: ( toolId: string ) => boolean;
	getToolCount: () => number;
	clearTools: () => void;
} {
	const registry: ToolRegistry = {
		tools: new Map(),
	};

	return {
		async getAvailableTools(): Promise< Tool[] > {
			return Array.from( registry.tools.values() ).map(
				( { callback, ...tool } ) => tool
			);
		},

		async executeTool(
			toolId: string,
			args: any,
			toolCallId?: string
		): Promise< any > {
			const tool = registry.tools.get( toolId );
			if ( ! tool ) {
				throw new Error( `Tool not found: ${ toolId }` );
			}

			logger( 'Executing tool %s with args: %O', toolId, args );

			try {
				const result = await tool.callback( args );
				logger( 'Tool %s completed successfully', toolId );
				return result;
			} catch ( error ) {
				logger( 'Tool %s failed: %s', toolId, error );
				throw error;
			}
		},

		registerTool(
			tool: Tool,
			callback: ( args: any ) => Promise< any >
		): void {
			registry.tools.set( tool.id, { ...tool, callback } );
			logger( 'Registered tool: %s', tool.id );
		},

		unregisterTool( toolId: string ): boolean {
			const removed = registry.tools.delete( toolId );
			if ( removed ) {
				logger( 'Unregistered tool: %s', toolId );
			}
			return removed;
		},

		getToolCount(): number {
			return registry.tools.size;
		},

		clearTools(): void {
			registry.tools.clear();
			logger( 'Cleared all tools' );
		},
	};
}

/**
 * Create some example tools for CLI testing
 * @param sendToolResult - Callback to send tool results back to the agent
 */
export function createExampleTools(
	sendToolResult?: SendToolResultCallback
): ReturnType< typeof createCLIToolProvider > {
	const provider = createCLIToolProvider();

	provider.registerTool(
		{
			id: 'calculator',
			name: 'Calculator',
			description:
				'Always use this tool to perform basic mathematical operations',
			input_schema: {
				type: 'object',
				properties: {
					operation: {
						type: 'string',
						description: 'Mathematical operation to perform',
					},
					a: {
						type: 'number',
						description: 'First number',
					},
					b: {
						type: 'number',
						description: 'Second number',
					},
				},
				required: [ 'operation', 'a', 'b' ],
			},
		},
		async ( args ) => {
			const { operation, a, b } = args;
			cliLog.agent( `🧮 Executing Calculator` );
			switch ( operation ) {
				case 'add':
					cliLog.agent( `Adding ${ a } and ${ b } = ${ a + b }` );
					return { result: a + b };
				case 'subtract':
					cliLog.agent(
						`Subtracting ${ a } and ${ b } = ${ a - b }`
					);
					return { result: a - b };
				case 'multiply':
					cliLog.agent(
						`Multiplying ${ a } and ${ b } = ${ a * b }`
					);
					return { result: a * b };
				case 'divide':
					if ( b === 0 ) {
						throw new Error( 'Division by zero' );
					}
					cliLog.agent( `Dividing ${ a } by ${ b } = ${ a / b }` );
					return { result: a / b };
				default:
					throw new Error( `Unknown operation: ${ operation }` );
			}
		}
	);

	return provider;
}
