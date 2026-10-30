/**
 * The tool descriptor from the WebMCP draft: `ModelContextTool` with the three
 * `ToolAnnotations` members it defines.
 */
export type WebMcpTool = {
	name: string;
	title?: string;
	description: string;
	inputSchema: Record< string, unknown >;
	annotations: {
		readOnlyHint: boolean;
		untrustedContentHint?: boolean;
		consequentialHint?: boolean;
	};
	execute: (
		input: Record< string, unknown >,
		options?: { signal?: AbortSignal }
	) => Promise< unknown >;
};

export type WebMcpModelContext = {
	registerTool: ( tool: WebMcpTool, options?: { signal?: AbortSignal } ) => void | Promise< void >;
	unregisterTool?: ( name: string ) => void | Promise< void >;
};

export type WebMcpAdapter = {
	sync: () => Promise< void >;
	dispose: () => void;
};

/**
 * State shared by the tools of one adapter for the lifetime of the page.
 */
export type WebMcpExecutionContext = {
	knownBlockClientIds: Set< string >;
};

/**
 * Per-ability adjustments applied when an ability is projected to a tool.
 * Everything not set here derives from the ability itself.
 */
export type WebMcpAbilityContract = {
	description?: string;
	inputSchema?: Record< string, unknown >;
	consequential?: boolean;
	prepareInput?: (
		input: Record< string, unknown >,
		context: WebMcpExecutionContext
	) => Record< string, unknown >;
	afterExecute?: ( result: unknown, context: WebMcpExecutionContext ) => void;
	adaptResult?: ( result: unknown ) => unknown;
};
