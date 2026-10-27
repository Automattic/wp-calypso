import { registerWebMCPTools, startWebMCPSiteToolProxy } from '@wp-playground/mcp/client';

export type PlaygroundWebMcpClient = NonNullable<
	ReturnType< Parameters< typeof registerWebMCPTools >[ 0 ][ 'getClient' ] >
>;

export async function connectPlaygroundWebMcp(
	client: PlaygroundWebMcpClient,
	slug: string,
	signal: AbortSignal
): Promise< void > {
	if ( signal.aborted ) {
		return;
	}

	if (
		typeof client.onWebMCPToolsChanged !== 'function' ||
		typeof client.callWebMCPTool !== 'function'
	) {
		throw new Error( 'This Playground client does not support WordPress WebMCP tools.' );
	}

	const proxy = startWebMCPSiteToolProxy( client );
	signal.addEventListener( 'abort', () => proxy.stop(), { once: true } );

	await registerWebMCPTools(
		{
			list: () => [ { slug, name: 'WordPress.com Playground', storage: 'opfs', isActive: true } ],
			getClient: () => client,
			rename: async () => {
				throw new Error( 'Renaming this Playground is not supported during onboarding.' );
			},
			saveInBrowser: async () => ( { slug, storage: 'opfs' } ),
		},
		{ signal }
	);
}
