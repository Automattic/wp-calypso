import { useCallback, useEffect, useState } from 'react';
import {
	normalizeLoadedSession,
	normalizeSendResponse,
	normalizeSessions,
} from './normalizer';
import type {
	AgentsApiAttachment,
	AgentsApiChatOptions,
	AgentsApiChatState,
	AgentsApiMessage,
	AgentsApiSession,
} from './types';

async function uploadFiles(
	files: File[] | undefined,
	uploadFn: AgentsApiChatOptions[ 'mediaUploadFn' ]
): Promise< AgentsApiAttachment[] > {
	if ( ! files?.length || ! uploadFn ) {
		return [];
	}
	return Promise.all( files.map( ( file ) => uploadFn( file ) ) );
}

function unreadTotal( sessions: AgentsApiSession[] ): number {
	return sessions.reduce(
		( total, session ) => total + ( session.unread_count ?? 0 ),
		0
	);
}

export function useAgentsApiChat( {
	adapter,
	mediaUploadFn,
	runAdapter,
	getRunId,
	onMessage,
	onError,
	onResponseMetadata,
	onUnreadChange,
	isVisible = true,
}: AgentsApiChatOptions ): AgentsApiChatState {
	const [ messages, setMessages ] = useState< AgentsApiMessage[] >( [] );
	const [ sessions, setSessions ] = useState< AgentsApiSession[] >( [] );
	const [ sessionId, setSessionId ] = useState< string | null >( null );
	const [ runId, setRunId ] = useState< string | null >( null );
	const [ isProcessing, setIsProcessing ] = useState( false );
	const [ error, setError ] = useState< Error | null >( null );

	const refreshSessions = useCallback( async () => {
		const response = await adapter.listSessions();
		const nextSessions = normalizeSessions( response );
		setSessions( nextSessions );
		onUnreadChange?.( unreadTotal( nextSessions ) );
	}, [ adapter, onUnreadChange ] );

	useEffect( () => {
		if ( ! isVisible ) {
			return;
		}
		refreshSessions().catch( ( err: unknown ) => {
			const nextError =
				err instanceof Error ? err : new Error( String( err ) );
			setError( nextError );
			onError?.( nextError );
		} );
	}, [ isVisible, onError, refreshSessions ] );

	const sendMessage = useCallback(
		async ( message: string, files?: File[] ) => {
			const content = message.trim();
			if ( ! content ) {
				return;
			}
			setIsProcessing( true );
			setError( null );
			try {
				const attachments = await uploadFiles( files, mediaUploadFn );
				const response = await adapter.sendMessage( {
					message: content,
					sessionId,
					attachments,
				} );
				const normalized = normalizeSendResponse(
					response,
					content,
					attachments
				);
				setMessages( normalized.messages );
				setSessionId( normalized.sessionId );
				const nextRunId =
					( getRunId && getRunId( normalized.metadata ) ) ??
					normalized.runId ??
					null;
				setRunId( nextRunId );
				normalized.messages.forEach( ( item ) => onMessage?.( item ) );
				onResponseMetadata?.( normalized.metadata );
				await refreshSessions();
			} catch ( err ) {
				const nextError =
					err instanceof Error ? err : new Error( String( err ) );
				setError( nextError );
				onError?.( nextError );
			} finally {
				setIsProcessing( false );
			}
		},
		[
			adapter,
			getRunId,
			mediaUploadFn,
			onError,
			onMessage,
			onResponseMetadata,
			refreshSessions,
			sessionId,
		]
	);

	const loadSession = useCallback(
		async ( nextSessionId: string ) => {
			setIsProcessing( true );
			try {
				const response = await adapter.loadSession( nextSessionId );
				const loaded = normalizeLoadedSession( response );
				setSessionId( loaded.sessionId ?? nextSessionId );
				setMessages( loaded.messages );
				onResponseMetadata?.( loaded.metadata );
				await adapter.markSessionRead( nextSessionId );
				await refreshSessions();
			} catch ( err ) {
				const nextError =
					err instanceof Error ? err : new Error( String( err ) );
				setError( nextError );
				onError?.( nextError );
			} finally {
				setIsProcessing( false );
			}
		},
		[ adapter, onError, onResponseMetadata, refreshSessions ]
	);

	const newSession = useCallback( () => {
		setSessionId( null );
		setRunId( null );
		setMessages( [] );
		setError( null );
	}, [] );

	const cancelRun = useCallback( async () => {
		if ( ! runId || ! sessionId || ! runAdapter?.cancel ) {
			return;
		}
		await runAdapter.cancel( { runId, sessionId } );
		setIsProcessing( false );
	}, [ runAdapter, runId, sessionId ] );

	return {
		messages,
		sessions,
		sessionId,
		isProcessing,
		error,
		sendMessage,
		loadSession,
		newSession,
		cancelRun,
	};
}
