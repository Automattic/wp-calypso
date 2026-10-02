import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { executeComponentAction } from '../utils/component-action-transport';
import {
	getComponentOpenings,
	getComponentOpeningSignature,
	getValidatedComponentOpening,
} from '../utils/component-results';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { AgentConfig } from '../utils/create-agent-config';
import type { SubmitOptions, TaskUpdate } from '@automattic/agenttic-client';

type Submit = ( message: string, options?: SubmitOptions ) => Promise< void >;

/** Keeps live component payloads in the current chat scope, outside persisted history. */
export function useComponentResults( config: AgentConfig | null | undefined ) {
	const identity = JSON.stringify( [ config?.agentId, config?.authenticationScope ] );
	const configuredSession = config?.sessionId ?? '';
	const generationRef = useRef( { identity, configuredSession, liveSession: '', scope: Symbol() } );
	const previous = generationRef.current;
	if (
		previous.identity !== identity ||
		( previous.configuredSession !== configuredSession &&
			previous.liveSession !== configuredSession )
	) {
		generationRef.current = { identity, configuredSession, liveSession: '', scope: Symbol() };
	} else {
		previous.configuredSession = configuredSession;
	}
	const generation = generationRef.current;
	const scope = generation.scope;
	const mountedRef = useRef( true );
	useEffect( () => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, [] );
	const submitRef = useRef< Submit | undefined >( undefined );
	const [ entries, setEntries ] = useState<
		Array< {
			scope: symbol;
			signature: string;
			expiresAt: number;
			message: AgentsManagerUIMessage;
		} >
	>( [] );
	useEffect( () => {
		setEntries( ( previous ) =>
			previous.every( ( entry ) => entry.scope === scope )
				? previous
				: previous.filter( ( entry ) => entry.scope === scope )
		);
	}, [ scope ] );

	const expire = useCallback(
		( messageId: string ) => {
			if ( ! mountedRef.current || generationRef.current.scope !== scope ) {
				return;
			}
			setEntries( ( previous ) =>
				previous.map( ( entry ) =>
					entry.scope === scope && entry.message.id === messageId
						? { ...entry, signature: '', message: { ...entry.message, componentResult: undefined } }
						: entry
				)
			);
		},
		[ scope ]
	);
	useEffect( () => {
		const timers = entries
			.filter( ( entry ) => entry.scope === scope && entry.message.componentResult )
			.map( ( entry ) =>
				setTimeout( () => expire( entry.message.id ), Math.max( 0, entry.expiresAt - Date.now() ) )
			);
		return () => timers.forEach( clearTimeout );
	}, [ entries, scope, expire ] );

	const observe = useCallback(
		async ( update: TaskUpdate ) => {
			if ( ! config || ! mountedRef.current || generationRef.current.scope !== scope ) {
				return;
			}
			const openings = getComponentOpenings( update );
			if ( openings.length === 0 ) {
				return;
			}
			const sessionId = update.sessionId || config.sessionId;
			const expectedSession = generation.liveSession || generation.configuredSession;
			if ( expectedSession && expectedSession !== sessionId ) {
				return;
			}
			generation.liveSession = sessionId;
			const siteId = config.authenticationScope?.siteId;
			let validation: typeof import( '@automattic/agent-components/validation' ) | undefined;
			try {
				validation = await import( '@automattic/agent-components/validation' );
			} catch {
				validation = undefined;
			}
			if ( ! mountedRef.current || generationRef.current.scope !== scope ) {
				return;
			}
			for ( const opening of openings ) {
				const { toolCallId, toolId } = opening;
				const options = validation
					? getValidatedComponentOpening( opening.result, validation, opening.legacyOnly )
					: null;
				const result = options?.result;
				const instanceId = result?.instanceId;
				const messageId = `component-${ toolCallId }`;
				const receivedAt = Date.now();
				const expiresAt = Math.min(
					receivedAt + 60 * 60 * 1000,
					options?.expiresAt ? Date.parse( options.expiresAt ) : Infinity
				);
				const isCurrent = () =>
					mountedRef.current && generationRef.current.scope === scope && Date.now() < expiresAt;
				const usable =
					!! result &&
					!! opening.toolId &&
					!! sessionId &&
					!! siteId &&
					Number.isSafeInteger( siteId ) &&
					siteId > 0;
				const message: AgentsManagerUIMessage = {
					id: messageId,
					componentToolCallId: toolCallId,
					role: 'agent',
					archived: false,
					showIcon: true,
					timestamp: receivedAt,
					content: [
						{ type: 'text', text: __( 'This action is unavailable.', __i18n_text_domain__ ) },
					],
					suppressThinking: true,
					...( usable && result && options
						? {
								componentResult: {
									...options,
									onExpire: () => expire( messageId ),
									transport: async ( request ) => {
										if ( ! isCurrent() ) {
											throw new Error( 'This action is no longer available.' );
										}
										return executeComponentAction( config, request, isCurrent );
									},
									onContinue: async ( summary ) => {
										if ( ! isCurrent() || ! submitRef.current ) {
											throw new Error( 'The action completed, but the chat could not continue.' );
										}
										await submitRef.current( summary, {
											type: 'tool_result',
											toolCallId,
											toolId,
											sessionId,
											waitForIdle: true,
											componentInstanceId: instanceId,
										} );
									},
								},
							}
						: {} ),
				};
				const signature = getComponentOpeningSignature( {
					toolId: opening.toolId,
					legacyOnly: opening.legacyOnly,
					...options,
				} );
				setEntries( ( previous ) => {
					const existing = previous.find(
						( entry ) => entry.scope === scope && entry.message.id === message.id
					);
					if ( existing ) {
						if ( existing.signature === signature || ! existing.message.componentResult ) {
							return previous;
						}
						return previous.map( ( entry ) =>
							entry === existing
								? {
										...entry,
										message: {
											...entry.message,
											componentResult: {
												...entry.message.componentResult!,
												presentationFailed: true,
											},
										},
									}
								: entry
						);
					}
					return [
						...previous.filter( ( entry ) => entry.scope === scope ),
						{ scope, signature, expiresAt, message },
					];
				} );
			}
		},
		[ config, generation, scope, expire ]
	);

	const messages = useMemo(
		() => entries.filter( ( entry ) => entry.scope === scope ).map( ( entry ) => entry.message ),
		[ entries, scope ]
	);
	return {
		observe,
		messages,
		bindSubmit: ( submit: Submit ) => {
			submitRef.current = submit;
		},
	};
}
