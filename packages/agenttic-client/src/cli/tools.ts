import type { Tool, ToolProvider } from '../types/index';
import { cliLog, logger } from '../utils/logger';

/**
 * Simple in-memory tool registry for CLI usage
 */
export class CLIToolProvider implements ToolProvider {
	private tools: Map<
		string,
		Tool & { callback: ( args: any ) => Promise< any > }
	> = new Map();

	/**
	 * Register a tool with the provider
	 * @param tool
	 * @param callback
	 */
	registerTool(
		tool: Tool,
		callback: ( args: any ) => Promise< any >
	): void {
		this.tools.set( tool.id, { ...tool, callback } );
		logger( 'Registered tool: %s', tool.id );
	}

	/**
	 * Get all available tools
	 */
	async getAvailableTools(): Promise< Tool[] > {
		return Array.from( this.tools.values() ).map(
			( { callback, ...tool } ) => tool
		);
	}

	/**
	 * Execute a tool by ID
	 * @param toolId
	 * @param args
	 */
	async executeTool( toolId: string, args: any ): Promise< any > {
		const tool = this.tools.get( toolId );
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
	}

	/**
	 * Remove a tool from the registry
	 * @param toolId
	 */
	unregisterTool( toolId: string ): boolean {
		const removed = this.tools.delete( toolId );
		if ( removed ) {
			logger( 'Unregistered tool: %s', toolId );
		}
		return removed;
	}

	/**
	 * Get the number of registered tools
	 */
	getToolCount(): number {
		return this.tools.size;
	}

	/**
	 * Clear all registered tools
	 */
	clearTools(): void {
		this.tools.clear();
		logger( 'Cleared all tools' );
	}
}

/**
 * Create some example tools for CLI testing
 */
export function createExampleTools(): CLIToolProvider {
	const provider = new CLIToolProvider();

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
			cliLog.agent( `Executing Calculator` );
			switch ( operation ) {
				// TODO: we need to return the result of the operation to the agent.
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
