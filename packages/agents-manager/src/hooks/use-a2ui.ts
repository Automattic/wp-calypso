import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { A2uiMessage } from '../a2ui';
import type { A2uiPresentation } from '../components/a2ui-surface';
import type { AgentConfig } from '../utils/create-agent-config';
import type { UIMessage } from '@automattic/agenttic-client';

interface Options {
	messages: UIMessage[];
	historyRevision: number;
	scopeIdentity: string;
	sessionId: string;
	agentConfig: Pick<
		AgentConfig,
		'agentId' | 'agentUrl' | 'authProvider' | 'contextProvider' | 'credentials'
	> | null;
	isProcessing: boolean;
}

/**
 * Applies completed history once to a conversation's SDK runtime. Explicit history replacements
 * replay from scratch; ordinary appends preserve the SDK data model and unsent form input.
 * Button events execute server abilities directly so clicks do not start another model turn.
 */
export default function useA2ui( options: Options ) {
	const latest = useRef( options );
	latest.current = options;
	const [ , refresh ] = useState( 0 );
	const identityRef = useRef( { scope: options.scopeIdentity, session: options.sessionId } );
	if ( identityRef.current.scope === options.scopeIdentity && identityRef.current.session === '' ) {
		identityRef.current.session = options.sessionId;
	}
	if (
		identityRef.current.scope !== options.scopeIdentity ||
		identityRef.current.session !== options.sessionId
	) {
		identityRef.current = { scope: options.scopeIdentity, session: options.sessionId };
	}
	const identity = identityRef.current;
	const conversation = useMemo(
		() => ( {
			identity,
			historyRevision: options.historyRevision,
			cursor: 0,
			active: false,
			loading: false,
			actionRequest: undefined as AbortController | undefined,
			presentation: {} as A2uiPresentation,
		} ),
		[ identity, options.historyRevision ]
	);
	useEffect( () => {
		conversation.active = true;
		return () => {
			conversation.active = false;
			conversation.actionRequest?.abort();
			conversation.presentation.runtime?.dispose();
			conversation.presentation = {};
			conversation.cursor = 0;
		};
	}, [ conversation ] );
	useEffect( () => {
		const isCurrent = () =>
			conversation.active &&
			conversation.identity === identityRef.current &&
			conversation.historyRevision === latest.current.historyRevision;
		const reportError = ( surfaceId?: string ) => {
			if ( isCurrent() ) {
				conversation.presentation = {
					...conversation.presentation,
					errorSurfaceId: surfaceId,
					error: __(
						'Unable to display or submit this form. Please try again.',
						__i18n_text_domain__
					),
				};
				refresh( ( revision ) => revision + 1 );
			}
		};
		const sync = () => {
			if ( ! isCurrent() || conversation.loading ) {
				return;
			}
			const { runtime } = conversation.presentation;
			let changed = false;
			const messages = latest.current.messages;
			for ( ; conversation.cursor < messages.length; conversation.cursor++ ) {
				const message = messages[ conversation.cursor ];
				const text = message.content[ 0 ]?.text;
				if ( message.role !== 'agent' || ! text ) {
					continue;
				}
				let payload: A2uiMessage[];
				try {
					payload = JSON.parse( text );
				} catch {
					continue;
				}
				if ( ! Array.isArray( payload ) || payload[ 0 ]?.version !== 'v0.9' ) {
					continue;
				}
				if ( ! runtime ) {
					conversation.loading = true;
					void import( '../a2ui' )
						.then( ( sdk ) => {
							if ( ! isCurrent() ) {
								return;
							}
							const runtime = sdk.createA2uiRuntime( {
								onAction: async ( action ) => {
									if (
										! isCurrent() ||
										latest.current.isProcessing ||
										conversation.actionRequest
									) {
										return;
									}
									const controller = new AbortController();
									conversation.actionRequest = controller;
									conversation.presentation = {
										...conversation.presentation,
										isExecuting: true,
										error: undefined,
										errorSurfaceId: undefined,
									};
									refresh( ( revision ) => revision + 1 );
									try {
										const config = latest.current.agentConfig;
										if ( ! config ) {
											throw new Error( 'Agent configuration is unavailable.' );
										}
										const headers = await config.authProvider?.();
										const clientContext = await config.contextProvider?.getClientContext();
										if ( ! isCurrent() || controller.signal.aborted ) {
											return;
										}
										const response = await fetch( `${ config.agentUrl }/${ config.agentId }`, {
											method: 'POST',
											headers: {
												...headers,
												'Content-Type': 'application/json',
												Accept: 'application/json',
											},
											credentials: config.credentials,
											signal: controller.signal,
											body: JSON.stringify( {
												jsonrpc: '2.0',
												id: action.timestamp,
												method: 'action/execute',
												params: {
													event: { version: 'v0.9', action },
													...( clientContext && {
														message: { parts: [ { type: 'data', data: { clientContext } } ] },
													} ),
												},
											} ),
										} );
										const body = await response.json();
										if ( ! response.ok || body.error ) {
											throw new Error( body.error?.message ?? 'Unable to execute this action.' );
										}
									} finally {
										conversation.actionRequest = undefined;
										if ( isCurrent() ) {
											conversation.presentation = {
												...conversation.presentation,
												isExecuting: false,
											};
											refresh( ( revision ) => revision + 1 );
										}
									}
								},
								onError: ( _error, surfaceId ) => reportError( surfaceId ),
							} );
							conversation.presentation = { runtime, Surface: sdk.A2uiSurface };
							conversation.loading = false;
							sync();
						} )
						.catch( () => {
							conversation.loading = false;
							reportError();
						} );
					return;
				}
				runtime.processMessages( payload, message.id );
				changed = true;
			}
			if ( changed ) {
				conversation.presentation = { ...conversation.presentation };
				refresh( ( revision ) => revision + 1 );
			}
		};
		sync();
	}, [ conversation, options.messages ] );
	return {
		presentation: conversation.presentation,
		getMessageMetadata: () =>
			conversation.active ? conversation.presentation.runtime?.getMessageMetadata() : undefined,
	};
}
