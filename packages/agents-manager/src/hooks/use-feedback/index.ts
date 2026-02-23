import { createFeedbackActions, ThumbsUpIcon, ThumbsDownIcon } from '@automattic/agenttic-ui';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { createElement, useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { LOCAL_TOOL_RUNNING_MESSAGE } from '../../constants';
import { getSessionId as getStoredSessionId } from '../../utils/agent-session';
import type { AuthProvider, UseAgentChatReturn } from '@automattic/agenttic-client';
import type { Message } from '@automattic/agenttic-ui/dist/types';

const FEEDBACK_API_BASE = 'https://public-api.wordpress.com/wpcom/v2/ai/feedback';

interface UseFeedbackConfig {
	registerMessageActions: UseAgentChatReturn[ 'registerMessageActions' ];
	messages: Message[];
	agentId: string;
	sessionId?: string;
	authProvider?: AuthProvider;
}

interface UseFeedbackReturn {
	showFeedbackInput: boolean;
	submitFeedbackText: ( feedbackText: string ) => Promise< void >;
	resetFeedback: () => void;
}

async function rateMessage(
	authProvider: AuthProvider,
	sessionId: string,
	messageId: string,
	rating: 'up' | 'down',
	messageText?: string
): Promise< void > {
	const headers = await authProvider();
	const url = `${ FEEDBACK_API_BASE }/${ encodeURIComponent( sessionId ) }/rate`;

	const body: Record< string, string > = { message_id: messageId, rating };
	if ( messageText ) {
		body.message_text = messageText;
	}

	fetch( url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify( body ),
	} ).catch( () => {} );
}

interface PreviousMessage {
	role: 'user' | 'agent';
	text: string;
}

async function submitFeedback(
	authProvider: AuthProvider,
	sessionId: string,
	messageId: string,
	feedback: string,
	previousMessages?: PreviousMessage[]
): Promise< void > {
	const headers = await authProvider();
	const url = `${ FEEDBACK_API_BASE }/${ encodeURIComponent( sessionId ) }/text`;

	const data: Record< string, string | PreviousMessage[] > = {
		message_id: messageId,
		feedback,
	};
	if ( previousMessages && previousMessages.length > 0 ) {
		data.previous_messages = previousMessages;
	}
	if ( typeof window !== 'undefined' ) {
		data.page_url = window.location.href;
	}

	try {
		const response = await fetch( url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify( data ),
		} );

		if ( ! response.ok ) {
			throw new Error( `[useFeedback] Feedback submission failed: ${ response.status }` );
		}
	} catch ( error ) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		throw new Error( `[useFeedback] Feedback submission failed: ${ message }` );
	}
}

const MAX_CONTEXT_MESSAGES = 4;
const MAX_MESSAGE_TEXT_LENGTH = 300;

/**
 * Extract meaningful text content from a message.
 * Returns null for tool-only messages and local_tool_running placeholders.
 */
function getMessageText( message: Message ): string | null {
	if ( ! message.content ) {
		return null;
	}
	const textPart = message.content.find( ( part: { type?: string } ) => part.type === 'text' );
	if ( ! textPart || ! ( 'text' in textPart ) ) {
		return null;
	}
	const text = ( textPart.text as string ).trim();
	if ( ! text ) {
		return null;
	}
	// Replace tool placeholders/JSON with a human-readable description
	if ( text === LOCAL_TOOL_RUNNING_MESSAGE ) {
		return '🔨 Tool';
	}
	try {
		const parsed = JSON.parse( text );
		if ( parsed?.tool_id ) {
			const suffix = parsed.data?.type ? ` (${ parsed.data.type })` : '';
			return `🔨 Tool: \`${ parsed.tool_id }\`${ suffix }`;
		}
	} catch {
		// Not JSON, continue with normal text handling
	}
	if ( text.length > MAX_MESSAGE_TEXT_LENGTH ) {
		return text.substring( 0, MAX_MESSAGE_TEXT_LENGTH ) + '...';
	}
	return text;
}

/**
 * Extracts conversation context: the last few messages with meaningful text
 * up to and including the rated message.
 * Walks backwards to skip tool-only and placeholder messages.
 */
function getPreviousMessages( messages: Message[], targetMessageId: string ): PreviousMessage[] {
	const targetIndex = messages.findIndex( ( m ) => m.id === targetMessageId );
	if ( targetIndex < 0 ) {
		return [];
	}

	const result: PreviousMessage[] = [];

	// Walk backwards from the target message (inclusive) collecting messages with text
	for ( let i = targetIndex; i >= 0 && result.length < MAX_CONTEXT_MESSAGES; i-- ) {
		const msg = messages[ i ];
		const text = getMessageText( msg );
		if ( text ) {
			const role = msg.role === 'user' ? 'user' : 'agent';
			result.unshift( { role, text } );
		}
	}

	return result;
}

export default function useFeedback( {
	registerMessageActions,
	messages,
	agentId,
	sessionId,
	authProvider,
}: UseFeedbackConfig ): UseFeedbackReturn {
	const [ showFeedbackInput, setShowFeedbackInput ] = useState( false );
	const [ feedbackMessageId, setFeedbackMessageId ] = useState< string | null >( null );

	// Keep refs to avoid recreating the feedback manager on every render
	const agentIdRef = useRef( agentId );
	const sessionIdRef = useRef( sessionId );
	const messagesRef = useRef( messages );
	const authProviderRef = useRef( authProvider );
	agentIdRef.current = agentId;
	sessionIdRef.current = sessionId;
	messagesRef.current = messages;
	authProviderRef.current = authProvider;

	const handleFeedback = useCallback( ( messageId: string, feedback: 'up' | 'down' ) => {
		const currentAuthProvider = authProviderRef.current;
		// agentConfig.sessionId can be empty for new chats — the server-assigned
		// session ID is saved to localStorage by agenttic-client, so read it as fallback.
		const currentSessionId = sessionIdRef.current || getStoredSessionId( agentIdRef.current );

		if ( ! currentSessionId || ! currentAuthProvider ) {
			return;
		}

		recordTracksEvent( 'calypso_agents_manager_response_feedback_action', {
			type: feedback === 'up' ? 'thumb_up' : 'thumb_down',
			message_id: messageId,
		} );

		const message = messagesRef.current.find( ( m ) => m.id === messageId );
		const messageText = message ? getMessageText( message ) : undefined;

		rateMessage(
			currentAuthProvider,
			currentSessionId,
			messageId,
			feedback,
			messageText ?? undefined
		);

		if ( feedback === 'down' ) {
			setShowFeedbackInput( true );
			setFeedbackMessageId( messageId );
		} else {
			setShowFeedbackInput( false );
			setFeedbackMessageId( null );
		}
	}, [] );

	useEffect( () => {
		const feedbackManager = createFeedbackActions( {
			onFeedback: handleFeedback,
			condition: ( message: Message ) => message.role === 'agent',
			icons: {
				up: createElement( ThumbsUpIcon, { size: 24 } ),
				down: createElement( ThumbsDownIcon, { size: 24 } ),
			},
		} );

		const feedbackRegistration = {
			id: 'agents-manager-feedback',
			actions: ( message: Message ) => feedbackManager.getActionsForMessage( message ),
		};

		registerMessageActions( feedbackRegistration );

		const handleFeedbackChange = () => {
			registerMessageActions( { ...feedbackRegistration } );
		};
		feedbackManager.onChange( handleFeedbackChange );

		return () => {
			feedbackManager.offChange( handleFeedbackChange );
		};
	}, [ registerMessageActions, handleFeedback, sessionId ] );

	const resetFeedback = useCallback( () => {
		setShowFeedbackInput( false );
		setFeedbackMessageId( null );
	}, [] );

	// Reset feedback input when session changes
	useEffect( () => {
		resetFeedback();
	}, [ sessionId, resetFeedback ] );

	const handleSubmitFeedbackText = useCallback(
		async ( feedbackText: string ) => {
			const currentAuthProvider = authProviderRef.current;
			const currentSessionId = sessionIdRef.current || getStoredSessionId( agentIdRef.current );
			const currentMessageId = feedbackMessageId;

			if (
				! feedbackText.trim() ||
				! currentSessionId ||
				! currentMessageId ||
				! currentAuthProvider
			) {
				return;
			}

			const previousMessages = getPreviousMessages( messagesRef.current, currentMessageId );

			await submitFeedback(
				currentAuthProvider,
				currentSessionId,
				currentMessageId,
				feedbackText.trim(),
				previousMessages
			);

			recordTracksEvent( 'calypso_agents_manager_response_feedback_submitted', {
				message_id: currentMessageId,
			} );
		},
		[ feedbackMessageId ]
	);

	return {
		showFeedbackInput,
		submitFeedbackText: handleSubmitFeedbackText,
		resetFeedback,
	};
}
