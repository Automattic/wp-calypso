export type WebMcpTool = {
	name: string;
	title?: string;
	description: string;
	inputSchema: Record< string, unknown >;
	annotations: {
		readOnlyHint: boolean;
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
