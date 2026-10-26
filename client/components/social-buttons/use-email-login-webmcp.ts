import page from '@automattic/calypso-router';
import { useEffect, useRef } from 'react';
import type { WebMcpToolRegistry } from '@automattic/webmcp';

export function useEmailLoginWebMcp( {
	loginUrl,
	isDisabled,
	onOpen,
}: {
	loginUrl: string;
	isDisabled: boolean;
	onOpen: () => void;
} ) {
	const current = useRef( { isDisabled, onOpen } );
	useEffect( () => {
		current.current = { isDisabled, onOpen };
	}, [ isDisabled, onOpen ] );

	useEffect( () => {
		const controller = new AbortController();
		let registry: WebMcpToolRegistry | undefined;
		const reportError = ( error: unknown ) => {
			// eslint-disable-next-line no-console
			console.warn( '[WebMCP] Email login navigation failed:', error );
		};

		import( /* webpackChunkName: "webmcp" */ '@automattic/webmcp' )
			.then( async ( { getWebMcpModelContext, createWebMcpToolRegistry } ) => {
				const modelContext = getWebMcpModelContext();
				if ( controller.signal.aborted || ! modelContext ) {
					return;
				}
				registry = createWebMcpToolRegistry( {
					modelContext,
					getTools: () => [
						{
							name: 'wpcom_open_email_login',
							title: 'Open email login',
							description:
								'Open the existing email-login screen, preserving the login return destination. Does not send an email or submit credentials. Use wpcom_request_email_login on the next screen.',
							inputSchema: { type: 'object', properties: {}, additionalProperties: false },
							annotations: { readOnlyHint: false, consequentialHint: false },
							execute: () => {
								if ( current.current.isDisabled ) {
									return {
										isError: true,
										content: [
											{ type: 'text', text: 'The login form is busy. Try again when it is ready.' },
										],
									};
								}
								current.current.onOpen();
								page( loginUrl );
								return { content: [ { type: 'text', text: 'Opening email login.' } ] };
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
	}, [ loginUrl ] );
}
