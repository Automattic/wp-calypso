import type { ContextProvider, ToolProvider } from '../types';

/**
 * Create a basic context provider
 * This is a default implementation that can be overridden
 * @param context
 */
export const createBasicContextProvider = (
	context: any = {}
): ContextProvider => {
	return {
		getClientContext: () => context,
	};
};

/**
 * Create a basic tool provider
 * This is a default implementation that can be overridden
 * @param tools
 */
export const createBasicToolProvider = ( tools: any[] = [] ): ToolProvider => {
	return {
		getAvailableTools: async () => tools,
		executeTool: async (
			toolId: string,
			args: any,
			messageId: string,
			toolCallId: string
		) => {
			console.log( `Tool executed: ${ toolId }`, {
				args,
				messageId,
				toolCallId,
			} );
			return { success: true, result: 'Tool executed successfully' };
		},
	};
};

/**
 * Create a no-op context provider
 */
export const createNoOpContextProvider = (): ContextProvider => {
	return {
		getClientContext: () => ( {} ),
	};
};

/**
 * Create a no-op tool provider
 */
export const createNoOpToolProvider = (): ToolProvider => {
	return {
		getAvailableTools: async () => [],
		executeTool: async () => ( {
			success: true,
			result: 'No tools available',
		} ),
	};
};

/**
 * Validate agent configuration
 * @param config
 */
export const validateAgentConfig = ( config: any ): boolean => {
	if ( ! config || typeof config !== 'object' ) {
		return false;
	}

	const required = [ 'agentId', 'agentUrl', 'sessionId' ];
	return required.every( ( key ) => {
		const value = config[ key ];
		return typeof value === 'string' && value.trim().length > 0;
	} );
};

/**
 * Generate a unique agent key
 * @param agentId
 * @param sessionId
 */
export const generateAgentKey = (
	agentId: string,
	sessionId: string
): string => {
	return `${ agentId }-${ sessionId }-${ Date.now() }`;
};

/**
 * Create default agent configuration
 * @param overrides
 */
export const createDefaultAgentConfig = ( overrides: Partial< any > = {} ) => {
	return {
		agentId: 'agenttic-ui',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: `session-${ Date.now() }`,
		...overrides,
	};
};
