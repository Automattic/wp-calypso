import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	approvalRequestsToMessages,
	loadActionApprovals,
	postApprovalDecision,
} from '../utils/action-approval-api';
import {
	getApprovalCardProps,
	isPendingApproval,
	upsertActionApprovals,
} from '../utils/action-approvals';
import { isSessionBootstrap, isUnsentSession } from '../utils/agent-session';
import type { ActionApprovalRecord } from '../utils/action-approvals';
import type {
	AuthProvider,
	Message,
	TaskUpdate,
	UseAgentChatReturn,
} from '@automattic/agenttic-client';
import type { ApprovalDecision } from '@automattic/agenttic-ui';

interface Options {
	enabled: boolean;
	scopeIdentity: string;
	sessionId: string;
	authProvider?: AuthProvider;
	waitForHistory?: boolean;
	onFetch: ( messages: Message[] ) => void;
}

function createScope( scopeIdentity: string, sessionId: string, waitForHistory: boolean ) {
	return {
		scopeIdentity,
		sessionId,
		records: new Map< string, ActionApprovalRecord >(),
		sending: new Set< string >(),
		resumeNeeded: new Set< string >(),
		resumeFailed: new Set< string >(),
		controller: new AbortController(),
		historyReady: ! waitForHistory || ! sessionId || isUnsentSession( sessionId ),
		chatId: undefined as number | undefined,
		error: null as string | null,
	};
}

/** Owns scoped approval decisions and continuation delivery separately so retries never re-POST. */
export function useActionApprovals( {
	enabled,
	scopeIdentity,
	sessionId,
	authProvider,
	waitForHistory = false,
	onFetch,
}: Options ) {
	const [ , render ] = useState( 0 );
	const current = useRef( createScope( scopeIdentity, sessionId, waitForHistory ) );
	if (
		current.current.scopeIdentity !== scopeIdentity ||
		current.current.sessionId !== sessionId
	) {
		if ( isSessionBootstrap( current.current, { scopeIdentity, sessionId } ) ) {
			current.current.sessionId = sessionId;
		} else {
			current.current = createScope( scopeIdentity, sessionId, waitForHistory );
		}
	}
	const scope = current.current;
	useEffect( () => {
		if ( scope.controller.signal.aborted ) {
			scope.controller = new AbortController();
		}
		return () => scope.controller.abort();
	}, [ scope ] );
	const isCurrent = useCallback(
		() => current.current === scope && ! scope.controller.signal.aborted,
		[ scope ]
	);
	const ingest = useCallback(
		( messages: Message[] ) => {
			if ( ! enabled || ! isCurrent() ) {
				return;
			}
			scope.records = upsertActionApprovals( scope.records, messages );
			render( ( count ) => count + 1 );
		},
		[ enabled, isCurrent, scope ]
	);
	const recordTaskUpdate = useCallback(
		( update: TaskUpdate ) => {
			if ( update.status?.message ) {
				ingest( [ update.status.message ] );
			}
		},
		[ ingest ]
	);
	const onHistoryFetch = useCallback(
		( messages: Message[], chatId?: number ) => {
			if ( ! isCurrent() ) {
				return;
			}
			scope.historyReady = true;
			scope.chatId = chatId;
			ingest( messages );
			for ( const record of scope.records.values() ) {
				if ( record.request.state === 'approved' && ! scope.sending.has( record.id ) ) {
					scope.resumeNeeded.add( record.id );
					scope.resumeFailed.add( record.id );
				}
			}
			onFetch( messages );
		},
		[ ingest, isCurrent, onFetch, scope ]
	);
	const isBlocked = useCallback(
		() =>
			enabled &&
			( ! isCurrent() ||
				! scope.historyReady ||
				scope.sending.size > 0 ||
				Array.from( scope.records.values() ).some( isPendingApproval ) ),
		[ enabled, isCurrent, scope ]
	);

	const continueApproval = useCallback(
		async ( record: ActionApprovalRecord, onSubmit: UseAgentChatReturn[ 'onSubmit' ] ) => {
			await onSubmit( '', {
				type: 'approval_resume',
				approvalResume: { proposalId: record.request.proposalId, chatId: record.request.chatId },
				sessionId: scope.sessionId,
				abortSignal: scope.controller.signal,
			} );
			if ( ! isCurrent() ) {
				return;
			}
			const requests = await loadActionApprovals(
				record.request.chatId,
				authProvider,
				scope.controller.signal
			);
			if ( ! isCurrent() ) {
				return;
			}
			ingest( approvalRequestsToMessages( requests ) );
			const updated = requests.find(
				( request ) => request.proposalId === record.request.proposalId
			);
			if ( ! updated || [ 'pending', 'approved', 'executing' ].includes( updated.state ) ) {
				throw new Error( 'Approval continuation has not completed' );
			}
			scope.resumeNeeded.delete( record.id );
			scope.resumeFailed.delete( record.id );
		},
		[ authProvider, ingest, isCurrent, scope ]
	);

	const submit = useCallback(
		async (
			id: string,
			onSubmit: UseAgentChatReturn[ 'onSubmit' ],
			decision?: ApprovalDecision
		) => {
			const record = scope.records.get( id );
			if ( ! enabled || ! isCurrent() || ! record || scope.sending.has( id ) ) {
				return;
			}
			if (
				decision &&
				( record.request.state !== 'pending' ||
					( decision === 'allow_for_chat' && ! record.request.allowForChat ) )
			) {
				return;
			}
			if ( ! decision && ! scope.resumeNeeded.has( id ) ) {
				return;
			}
			scope.error = null;
			scope.sending.add( id );
			render( ( count ) => count + 1 );
			try {
				if ( decision ) {
					const result = await postApprovalDecision(
						record.request,
						decision,
						authProvider,
						scope.controller.signal
					);
					if ( ! isCurrent() ) {
						return;
					}
					ingest( approvalRequestsToMessages( [ result.request ] ) );
					if ( result.alreadyDecided ) {
						return;
					}
					scope.resumeNeeded.add( id );
				}
				await continueApproval( record, onSubmit );
			} catch ( error ) {
				if ( ! isCurrent() ) {
					return;
				}
				if ( scope.resumeNeeded.has( id ) ) {
					scope.resumeFailed.add( id );
					scope.error = __(
						'Your decision was saved, but the conversation could not continue. Retry the continuation below.',
						__i18n_text_domain__
					);
				} else {
					scope.error = __(
						'The decision could not be sent. Please try again.',
						__i18n_text_domain__
					);
				}
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Approval request failed:', error );
			} finally {
				if ( isCurrent() ) {
					scope.sending.delete( id );
					render( ( count ) => count + 1 );
				}
			}
		},
		[ authProvider, continueApproval, enabled, ingest, isCurrent, scope ]
	);

	const getCards = ( onSubmit: UseAgentChatReturn[ 'onSubmit' ] ) =>
		enabled
			? Array.from( scope.records.values(), ( record ) => ( {
					id: record.id,
					props: {
						...getApprovalCardProps(
							record,
							( decision ) => {
								void submit( record.id, onSubmit, decision );
							},
							scope.sending.has( record.id )
						),
						...( scope.resumeFailed.has( record.id ) && {
							onRetryResume: () => {
								void submit( record.id, onSubmit );
							},
							isResuming: scope.sending.has( record.id ),
						} ),
					},
				} ) )
			: [];
	return {
		error: scope.error,
		getCards,
		recordTaskUpdate,
		onHistoryFetch,
		isBlocked,
		hasPendingApproval: isBlocked(),
	};
}
