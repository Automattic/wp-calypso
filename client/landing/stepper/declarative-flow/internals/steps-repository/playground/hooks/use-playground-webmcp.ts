import { useEffect, useRef } from 'react';
import type { PlaygroundClient } from '../lib/types';
import type { WebMcpToolRegistry } from '@automattic/webmcp';
import type { PlaygroundWebMcpClient } from '@automattic/webmcp/playground';

function reportError( error: unknown ) {
	// eslint-disable-next-line no-console
	console.warn( '[WebMCP] Playground integration failed:', error );
}

/** Keeps browser tools scoped to the current Playground without blocking onboarding. */
export function usePlaygroundWebMcp( {
	enabled,
	client,
	slug,
	launch,
}: {
	enabled: boolean;
	client: PlaygroundClient | null;
	slug: string | null;
	launch: () => Promise< boolean >;
} ): void {
	const launchRef = useRef( launch );
	useEffect( () => {
		launchRef.current = launch;
	}, [ launch ] );

	useEffect( () => {
		if ( ! enabled || ! client || ! slug ) {
			return;
		}

		const controller = new AbortController();
		let registry: WebMcpToolRegistry | undefined;

		import( /* webpackChunkName: "webmcp" */ '@automattic/webmcp' )
			.then( ( { getWebMcpModelContext, createWebMcpToolRegistry } ) => {
				if ( controller.signal.aborted ) {
					return;
				}
				const modelContext = getWebMcpModelContext();
				if ( ! modelContext ) {
					return;
				}

				registry = createWebMcpToolRegistry( {
					modelContext,
					getTools: () => [
						{
							name: 'wpcom_launch_site',
							title: 'Launch on WordPress.com',
							description:
								"Continue with this Playground site in WordPress.com signup using the page's launch action. Opens domain selection, or WooCommerce signup for a store. Publishing and any purchases happen later in signup.",
							inputSchema: { type: 'object', properties: {}, additionalProperties: false },
							annotations: { readOnlyHint: false, consequentialHint: false },
							execute: async () => {
								if ( ! ( await launchRef.current() ) ) {
									throw new Error(
										'The Playground launch action is not available. Try again when the site is ready.'
									);
								}
								return {
									content: [ { type: 'text', text: 'Continuing to WordPress.com signup.' } ],
								};
							},
						},
					],
				} );
				void registry.sync().catch( reportError );

				void import( /* webpackChunkName: "webmcp-playground" */ '@automattic/webmcp/playground' )
					.then( ( { connectPlaygroundWebMcp } ) =>
						// startPlaygroundWeb returns the full client; Calypso's local type covers only its own calls.
						connectPlaygroundWebMcp( client as PlaygroundWebMcpClient, slug, controller.signal )
					)
					.catch( reportError );
			} )
			.catch( reportError );

		return () => {
			controller.abort();
			registry?.dispose();
		};
	}, [ enabled, client, slug ] );
}
