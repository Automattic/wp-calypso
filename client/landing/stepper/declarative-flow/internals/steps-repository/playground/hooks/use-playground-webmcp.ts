import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { PlaygroundClient } from '../lib/types';

export function usePlaygroundWebMcp( {
	client,
	slug,
	launch,
}: {
	client: PlaygroundClient | null;
	slug: string | null;
	launch: () => boolean;
} ): void {
	const launchRef = useRef( launch );
	launchRef.current = launch;

	useEffect( () => {
		if ( ! client || ! slug || ! document.modelContext?.registerTool ) {
			return;
		}

		const controller = new AbortController();
		let stopProxy: ( () => void ) | undefined;
		let unregisterTools: ( () => void ) | undefined;

		void ( async () => {
			const { registerWebMCPTools, unregisterWebMCPTools, startWebMCPSiteToolProxy } = await import(
				/* webpackChunkName: "playground-webmcp" */ '@wp-playground/mcp/client'
			);
			if ( controller.signal.aborted ) {
				return;
			}

			type WebMcpClient = PlaygroundClient &
				NonNullable< ReturnType< Parameters< typeof registerWebMCPTools >[ 0 ][ 'getClient' ] > > &
				Parameters< typeof startWebMCPSiteToolProxy >[ 0 ];
			const playground = client as WebMcpClient;

			const proxy = startWebMCPSiteToolProxy( playground );
			stopProxy = () => proxy.stop();
			const launchRegistration = document.modelContext?.registerTool(
				{
					name: 'wpcom_launch_site',
					description:
						'Continue with this Playground site in WordPress.com signup. Publishing and purchases happen later in signup.',
					inputSchema: { type: 'object', properties: {}, additionalProperties: false },
					annotations: { readOnlyHint: false },
					execute: async () => {
						recordTracksEvent( 'calypso_playground_webmcp_tool_call', {
							tool_name: 'wpcom_launch_site',
						} );
						if ( controller.signal.aborted || ! launchRef.current() ) {
							throw new Error( 'The Playground launch action is not available.' );
						}
						return { content: [ { type: 'text', text: 'Continuing to WordPress.com signup.' } ] };
					},
				},
				{ signal: controller.signal }
			);
			const registration = registerWebMCPTools( {
				list: () => [ { slug, name: 'WordPress.com Playground', storage: 'opfs', isActive: true } ],
				getClient: () => playground,
				rename: async () => {
					throw new Error( 'Renaming this Playground is not supported during onboarding.' );
				},
				saveInBrowser: async () => ( { slug, storage: 'opfs' } ),
			} );
			unregisterTools = unregisterWebMCPTools;
			await Promise.all( [ launchRegistration, registration ] );
		} )().catch( ( error ) => {
			if ( ! controller.signal.aborted ) {
				// eslint-disable-next-line no-console
				console.warn( '[WebMCP] Playground integration failed:', error );
			}
		} );

		return () => {
			controller.abort();
			unregisterTools?.();
			stopProxy?.();
		};
	}, [ client, slug ] );
}
