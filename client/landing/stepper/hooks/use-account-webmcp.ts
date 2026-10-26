import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import type { WebMcpToolRegistry } from '@automattic/webmcp';

type Account = {
	ID: number;
	username: string;
	email: string;
	email_verified: boolean;
};

export function useAccountWebMcp() {
	useEffect( () => {
		const controller = new AbortController();
		let registry: WebMcpToolRegistry | undefined;
		const reportError = ( error: unknown ) => {
			// eslint-disable-next-line no-console
			console.warn( '[WebMCP] Account status integration failed:', error );
		};

		void import( /* webpackChunkName: "webmcp" */ '@automattic/webmcp' )
			.then( async ( { getWebMcpModelContext, createWebMcpToolRegistry } ) => {
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
							name: 'wpcom_get_current_account',
							title: 'Get current account',
							description:
								'Read the currently authenticated WordPress.com account ID, username, email, and email-verification status from the server. Use this to verify which account is active during signup. Does not change the account or send email.',
							inputSchema: { type: 'object', properties: {}, additionalProperties: false },
							annotations: { readOnlyHint: true, consequentialHint: false },
							execute: async () => {
								const account: Account = await wpcom.req.get( '/me' );
								return {
									content: [
										{
											type: 'text',
											text: JSON.stringify( {
												ID: account.ID,
												username: account.username,
												email: account.email,
												emailVerified: account.email_verified,
											} ),
										},
									],
								};
							},
						},
					],
				} );
				await registry.sync();
			} )
			.catch( reportError );

		return () => {
			controller.abort();
			registry?.dispose();
		};
	}, [] );
}
