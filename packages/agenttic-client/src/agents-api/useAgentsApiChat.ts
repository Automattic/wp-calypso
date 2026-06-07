import { useCallback, useEffect, useRef, useState } from 'react';
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
	const [ error, setError ] = useState< string | null >( null );
	const messageIdsRef = useRef< Set< string > >( new Set() );
	const onErrorRef = useRef( onError );
	const onMessageRef = useRef( onMessage );
	const onResponseMetadataRef = useRef( onResponseMetadata );
	const onUnreadChangeRef = useRef( onUnreadChange );
	const mountedRef = useRef( true );
	const refreshRequestRef = useRef( 0 );

	useEffect( () => {
		onErrorRef.current = onError;
		onMessageRef.current = onMessage;
		onResponseMetadataRef.current = onResponseMetadata;
		onUnreadChangeRef.current = onUnreadChange;
	}, [ onError, onMessage, onResponseMetadata, onUnreadChange ] );

	useEffect( () => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, [] );

	const setNormalizedError = useCallback( ( err: unknown ) => {
		const nextError =
			err instanceof Error ? err : new Error( String( err ) );
		setError( nextError.message );
		onErrorRef.current?.( nextError );
	}, [] );

	const refreshSessions = useCallback( async () => {
		const requestId = ++refreshRequestRef.current;
		const response = await adapter.listSessions();
		const nextSessions = normalizeSessions( response );
		if ( ! mountedRef.current || requestId !== refreshRequestRef.current ) {
			return;
		}
		setSessions( nextSessions );
		onUnreadChangeRef.current?.( unreadTotal( nextSessions ) );
	}, [ adapter ] );

	useEffect( () => {
		if ( ! isVisible ) {
			return;
		}
		refreshSessions().catch( setNormalizedError );
	}, [ isVisible, refreshSessions, setNormalizedError ] );

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
				const existingMessageIds = new Set( messageIdsRef.current );
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
				messageIdsRef.current = new Set(
					normalized.messages.map( ( item ) => item.id )
				);
				setMessages( normalized.messages );
				setSessionId( normalized.sessionId );
				const nextRunId =
					( getRunId && getRunId( normalized.metadata ) ) ??
					normalized.runId ??
					null;
				setRunId( nextRunId );
				normalized.messages
					.filter( ( item ) => ! existingMessageIds.has( item.id ) )
					.forEach( ( item ) => onMessageRef.current?.( item ) );
				onResponseMetadataRef.current?.( normalized.metadata );
				await refreshSessions();
			} catch ( err ) {
				setNormalizedError( err );
			} finally {
				setIsProcessing( false );
			}
		},
		[
			adapter,
			getRunId,
			mediaUploadFn,
			refreshSessions,
			setNormalizedError,
			sessionId,
		]
	);

	const loadSession = useCallback(
		async ( nextSessionId: string ) => {
			setIsProcessing( true );
			try {
				const response = await adapter.loadSession( nextSessionId );
				const loaded = normalizeLoadedSession( response );
				messageIdsRef.current = new Set(
					loaded.messages.map( ( item ) => item.id )
				);
				setSessionId( loaded.sessionId ?? nextSessionId );
				setMessages( loaded.messages );
				onResponseMetadataRef.current?.( loaded.metadata );
				await adapter.markSessionRead( nextSessionId );
				await refreshSessions();
			} catch ( err ) {
				setNormalizedError( err );
			} finally {
				setIsProcessing( false );
			}
		},
		[ adapter, refreshSessions, setNormalizedError ]
	);

	const newSession = useCallback( () => {
		setSessionId( null );
		setRunId( null );
		messageIdsRef.current = new Set();
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
