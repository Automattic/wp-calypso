import { useCallback, useEffect, useRef, useState } from 'react';
import {
	normalizeAgentsApiMessage,
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
	return sessions.reduce( ( total, session ) => total + ( session.unread_count ?? 0 ), 0 );
}

function messageText( message: AgentsApiMessage ): string {
	return message.content
		.filter( ( part ) => part.type === 'text' && typeof part.text === 'string' )
		.map( ( part ) => part.text )
		.join( '' )
		.trim();
}

function containsUserMessage( messages: AgentsApiMessage[], message: AgentsApiMessage ): boolean {
	const submittedText = messageText( message );
	return messages.some(
		( candidate ) =>
			candidate.id === message.id ||
			( candidate.role === 'user' &&
				submittedText !== '' &&
				messageText( candidate ) === submittedText )
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
	const [ hasLoadedSessions, setHasLoadedSessions ] = useState( false );
	const [ isLoadingSessions, setIsLoadingSessions ] = useState( false );
	const [ isLoadingSession, setIsLoadingSession ] = useState( false );
	const [ isSending, setIsSending ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const messageIdsRef = useRef< Set< string > >( new Set() );
	const onErrorRef = useRef( onError );
	const onMessageRef = useRef( onMessage );
	const onResponseMetadataRef = useRef( onResponseMetadata );
	const onUnreadChangeRef = useRef( onUnreadChange );
	const mountedRef = useRef( true );
	const refreshRequestRef = useRef( 0 );
	const loadRequestRef = useRef( 0 );
	const isProcessing = isSending || isLoadingSession;

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
		const nextError = err instanceof Error ? err : new Error( String( err ) );
		if ( ! mountedRef.current ) {
			return;
		}
		setError( nextError.message );
		onErrorRef.current?.( nextError );
	}, [] );

	const refreshSessions = useCallback( async () => {
		/* eslint-disable @wordpress/no-unused-vars-before-return -- the request must complete before the staleness guard */
		const requestId = ++refreshRequestRef.current;
		setIsLoadingSessions( true );
		try {
			const response = await adapter.listSessions();
			const nextSessions = normalizeSessions( response );
			/* eslint-enable @wordpress/no-unused-vars-before-return */
			if ( ! mountedRef.current || requestId !== refreshRequestRef.current ) {
				return;
			}
			setSessions( nextSessions );
			setHasLoadedSessions( true );
			onUnreadChangeRef.current?.( unreadTotal( nextSessions ) );
		} finally {
			if ( mountedRef.current && requestId === refreshRequestRef.current ) {
				setIsLoadingSessions( false );
			}
		}
	}, [ adapter ] );

	useEffect( () => {
		refreshRequestRef.current += 1;
		loadRequestRef.current += 1;
		setSessions( [] );
		setSessionId( null );
		setHasLoadedSessions( false );
		setIsLoadingSessions( false );
		setIsLoadingSession( false );
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
			const submittedMessage = normalizeAgentsApiMessage(
				{
					id: `submitted-user-${ Date.now() }`,
					role: 'user',
					content,
				},
				'user'
			);
			setIsSending( true );
			setError( null );
			setMessages( ( currentMessages ) => [ ...currentMessages, submittedMessage ] );
			messageIdsRef.current = new Set( [ ...messageIdsRef.current, submittedMessage.id ] );
			onMessageRef.current?.( submittedMessage );
			try {
				const attachments = await uploadFiles( files, mediaUploadFn );
				const existingMessageIds = new Set( messageIdsRef.current );
				const response = await adapter.sendMessage( {
					message: content,
					sessionId,
					attachments,
				} );
				const normalized = normalizeSendResponse( response, content, attachments );
				if ( ! mountedRef.current ) {
					return;
				}
				const nextMessages = containsUserMessage( normalized.messages, submittedMessage )
					? normalized.messages
					: [ submittedMessage, ...normalized.messages ];
				messageIdsRef.current = new Set( nextMessages.map( ( item ) => item.id ) );
				setMessages( nextMessages );
				setSessionId( normalized.sessionId ?? sessionId );
				const nextRunId =
					( getRunId && getRunId( normalized.metadata ) ) ?? normalized.runId ?? null;
				setRunId( nextRunId );
				normalized.messages
					.filter( ( item ) => ! existingMessageIds.has( item.id ) )
					.forEach( ( item ) => onMessageRef.current?.( item ) );
				onResponseMetadataRef.current?.( normalized.metadata );
				await refreshSessions();
			} catch ( err ) {
				setNormalizedError( err );
			} finally {
				if ( mountedRef.current ) {
					setIsSending( false );
				}
			}
		},
		[ adapter, getRunId, mediaUploadFn, refreshSessions, setNormalizedError, sessionId ]
	);

	const loadSession = useCallback(
		async ( nextSessionId: string ) => {
			const requestId = ++loadRequestRef.current;
			setIsLoadingSession( true );
			setError( null );
			try {
				const response = await adapter.loadSession( nextSessionId );
				const loaded = normalizeLoadedSession( response );
				if ( ! mountedRef.current || requestId !== loadRequestRef.current ) {
					return;
				}
				messageIdsRef.current = new Set( loaded.messages.map( ( item ) => item.id ) );
				setSessionId( loaded.sessionId ?? nextSessionId );
				setMessages( loaded.messages );
				onResponseMetadataRef.current?.( loaded.metadata );
				await adapter.markSessionRead( nextSessionId );
				if ( requestId !== loadRequestRef.current ) {
					return;
				}
				await refreshSessions();
			} catch ( err ) {
				if ( requestId === loadRequestRef.current ) {
					setNormalizedError( err );
				}
			} finally {
				if ( mountedRef.current && requestId === loadRequestRef.current ) {
					setIsLoadingSession( false );
				}
			}
		},
		[ adapter, refreshSessions, setNormalizedError ]
	);

	const newSession = useCallback( () => {
		loadRequestRef.current += 1;
		setSessionId( null );
		setRunId( null );
		setIsLoadingSession( false );
		messageIdsRef.current = new Set();
		setMessages( [] );
		setError( null );
	}, [] );

	const cancelRun = useCallback( async () => {
		if ( ! runId || ! sessionId || ! runAdapter?.cancel ) {
			return;
		}
		await runAdapter.cancel( { runId, sessionId } );
		setIsSending( false );
	}, [ runAdapter, runId, sessionId ] );

	return {
		messages,
		sessions,
		sessionId,
		hasLoadedSessions,
		isLoadingSessions,
		isLoadingSession,
		isProcessing,
		error,
		sendMessage,
		loadSession,
		newSession,
		cancelRun,
	};
}
