/**
 * Agenttic Test Component
 *
 * A test harness for @automattic/agenttic-client in Calypso.
 */

import '@automattic/agenttic-ui/index.css';

import {
	useAgentChat,
	createOdieBotId,
	type ContextProvider,
	type UIMessage,
	type AuthProvider,
} from '@automattic/agenttic-client';
import {
	AgentUI,
	createMessageRenderer,
	createFeedbackActions,
	EmptyView,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@automattic/agenttic-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const JWT_TOKEN_CACHE_KEY = 'agenttic-devdocs-jwt-token';
const JWT_TOKEN_EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes

interface TokenData {
	token: string;
	expire: number;
}

/**
 * Get cached JWT token from sessionStorage
 */
function getCachedJwtToken(): TokenData | null {
	try {
		const cached = sessionStorage.getItem( JWT_TOKEN_CACHE_KEY );
		if ( cached ) {
			const tokenData = JSON.parse( cached ) as TokenData;
			if ( tokenData?.token && tokenData?.expire && tokenData.expire > Date.now() ) {
				return tokenData;
			}
		}
	} catch {
		// Invalid cached token
	}
	return null;
}

/**
 * Cache JWT token in sessionStorage
 */
function setCachedJwtToken( tokenData: TokenData ): void {
	try {
		sessionStorage.setItem( JWT_TOKEN_CACHE_KEY, JSON.stringify( tokenData ) );
	} catch {
		// Continue without caching
	}
}

/**
 * Request a JWT token via wpcomRequest
 */
async function requestJWTToken( siteId: number ): Promise< string | null > {
	const cached = getCachedJwtToken();
	if ( cached ) {
		return cached.token;
	}

	try {
		const data = ( await wpcomRequest( {
			path: `/sites/${ siteId }/jetpack-openai-query/jwt`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
		} ) ) as { token?: string; jwt?: string };

		const token = data?.token || data?.jwt;

		if ( token ) {
			setCachedJwtToken( {
				token,
				expire: Date.now() + JWT_TOKEN_EXPIRATION_TIME,
			} );
		}

		return token || null;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Failed to get JWT token:', error );
		return null;
	}
}

/**
 * Create auth provider for Calypso using JWT tokens via wpcomRequest.
 */
function createCalypsoAuthProvider( siteId?: number ): AuthProvider {
	return async () => {
		const headers: Record< string, string > = {
			'Content-Type': 'application/json',
		};

		if ( ! canAccessWpcomApis() ) {
			// eslint-disable-next-line no-console
			console.warn( '[AgentticTest Auth] Cannot access WPCOM APIs - check origin is allowlisted' );
			return headers;
		}

		if ( siteId ) {
			try {
				const jwtToken = await requestJWTToken( siteId );
				if ( jwtToken ) {
					headers.Authorization = `Bearer ${ jwtToken }`;
					return headers;
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentticTest Auth] JWT request failed:', error );
			}
		}

		return headers;
	};
}

const AGENT_URL = 'https://public-api.wordpress.com/wpcom/v2/ai/agent';
const DEFAULT_AGENT_ID = 'wpcom-support-chat';

// Helper function to get URL parameter
const getUrlParam = ( key: string ): string => {
	if ( typeof window === 'undefined' ) {
		return '';
	}
	const params = new URLSearchParams( window.location.search );
	return params.get( key ) || '';
};

// Generate a unique session ID using UUID v4
const generateSessionId = () => {
	if ( typeof crypto !== 'undefined' && crypto.randomUUID ) {
		return crypto.randomUUID();
	}
	// Fallback for older browsers
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, ( c ) => {
		const r = ( Math.random() * 16 ) | 0;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
};

// Sample suggestions
const sampleSuggestions = [
	{
		id: '1',
		label: 'Help with my site',
		prompt: 'Can you help me with my WordPress.com site?',
	},
	{
		id: '2',
		label: 'Billing question',
		prompt: 'I have a question about my billing',
	},
	{
		id: '3',
		label: 'Technical issue',
		prompt: "I'm experiencing a technical issue",
	},
];

interface ChatConfig {
	agentId: string;
	sessionId: string;
	parsedBlogId?: number;
}

/**
 * Chat component that contains the useAgentChat hook.
 * Remounting this component (via key change) will reset the conversation.
 */
const AgentticChat: React.FC< ChatConfig > = ( { agentId, sessionId, parsedBlogId } ) => {
	// Simple context provider
	const contextProvider = useMemo< ContextProvider >(
		() => ( {
			getClientContext: () => ( {
				environment: 'calypso-devdocs',
				timestamp: Date.now(),
				url: window.location.href,
				blog_id: parsedBlogId,
			} ),
		} ),
		[ parsedBlogId ]
	);

	// Create odieBotId for server-based conversation storage
	const odieBotId = useMemo( () => createOdieBotId( agentId ), [ agentId ] );

	// Create auth provider using Calypso's JWT mechanism
	const authProvider = useMemo( () => createCalypsoAuthProvider( parsedBlogId ), [ parsedBlogId ] );

	const {
		messages,
		isProcessing,
		error,
		onSubmit,
		suggestions,
		registerSuggestions,
		clearSuggestions,
		registerMessageActions,
		abortCurrentRequest,
	} = useAgentChat( {
		agentId,
		agentUrl: AGENT_URL,
		sessionId,
		contextProvider,
		authProvider,
		enableStreaming: false,
		odieBotId,
	} );

	// Register suggestions on mount
	useEffect( () => {
		registerSuggestions( sampleSuggestions );
	}, [ registerSuggestions ] );

	// Custom markdown components
	const customMarkdownComponents = useMemo(
		() => ( {
			blockquote: ( { children, ...props }: React.ComponentProps< 'blockquote' > ) => (
				<blockquote
					{ ...props }
					style={ {
						borderLeft: '4px solid #007cba',
						backgroundColor: '#f0f8ff',
						margin: '16px 0',
						padding: '12px 16px',
						fontStyle: 'italic',
						borderRadius: '0 4px 4px 0',
					} }
				>
					{ children }
				</blockquote>
			),
		} ),
		[]
	);

	// Create message renderer
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: customMarkdownComponents,
				extensions: {
					gfm: { enabled: true },
				},
				enableStreaming: false,
			} ),
		[ customMarkdownComponents ]
	);

	const handleSubmit = useCallback(
		async ( message: string ) => {
			await onSubmit( message );
			clearSuggestions();
		},
		[ onSubmit, clearSuggestions ]
	);

	const handleFeedback = useCallback( async ( messageId: string, feedback: 'up' | 'down' ) => {
		// eslint-disable-next-line no-console
		console.log( `Feedback for message ${ messageId }: ${ feedback }` );
	}, [] );

	// Register feedback actions
	const hasRegistered = useRef( false );
	useEffect( () => {
		if ( hasRegistered.current ) {
			return;
		}

		const feedbackManager = createFeedbackActions( {
			onFeedback: handleFeedback,
			condition: ( message: UIMessage ) => message.role === 'agent',
			icons: {
				up: <ThumbsUpIcon />,
				down: <ThumbsDownIcon />,
			},
		} );

		registerMessageActions( {
			id: 'devdocs-feedback',
			actions: ( message: UIMessage ) => feedbackManager.getActionsForMessage( message ),
		} );

		hasRegistered.current = true;
	}, [ registerMessageActions, handleFeedback ] );

	return (
		<AgentUI.Container
			messages={ messages }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ handleSubmit }
			onStop={ abortCurrentRequest }
			variant="embedded"
			suggestions={ suggestions }
			clearSuggestions={ clearSuggestions }
			messageRenderer={ messageRenderer }
			className="agenttic"
			placeholder={ [
				__( 'Ask me anything…' ),
				__( 'How can I help you today?' ),
				__( 'What would you like to know?' ),
			] }
			emptyView={
				<EmptyView
					heading={ __( 'Agenttic Test' ) }
					help={ __( 'Test the agenttic-client integration in Calypso.' ) }
					suggestions={ suggestions }
				/>
			}
		>
			<AgentUI.ConversationView showHeader={ false }>
				<AgentUI.Messages />
				<AgentUI.Footer>
					<AgentUI.Notice />
					<AgentUI.Input />
				</AgentUI.Footer>
				<AgentUI.Suggestions />
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
};

/**
 * Main test page component that manages config and controls conversation reset.
 */
const AgentticTest: React.FC = () => {
	// Try to get selected site from Calypso state (may be null in devdocs)
	const selectedSiteId = useSelector( getSelectedSiteId );

	// Initialize state from URL parameters
	const [ agentId, setAgentId ] = useState< string >(
		() => getUrlParam( 'slug' ) || DEFAULT_AGENT_ID
	);
	const [ blogIdInput, setBlogIdInput ] = useState< string >(
		() => getUrlParam( 'blog_id' ) || ( selectedSiteId ? String( selectedSiteId ) : '' )
	);

	// Key to force remount of chat component (resets conversation)
	const [ chatKey, setChatKey ] = useState< number >( 0 );
	const [ sessionId, setSessionId ] = useState< string >( generateSessionId );

	// Parse blog ID from input
	const blogId = useMemo( () => {
		if ( blogIdInput.trim() ) {
			const parsed = parseInt( blogIdInput.trim(), 10 );
			if ( ! Number.isNaN( parsed ) ) {
				return parsed;
			}
		}
		return undefined;
	}, [ blogIdInput ] );

	// Update URL when parameters change
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		const params = new URLSearchParams( window.location.search );

		if ( agentId.trim() && agentId !== DEFAULT_AGENT_ID ) {
			params.set( 'slug', agentId.trim() );
		} else {
			params.delete( 'slug' );
		}

		if ( blogIdInput.trim() ) {
			params.set( 'blog_id', blogIdInput.trim() );
		} else {
			params.delete( 'blog_id' );
		}

		const newUrl = params.toString()
			? `${ window.location.pathname }?${ params.toString() }`
			: window.location.pathname;
		window.history.replaceState( {}, '', newUrl );
	}, [ agentId, blogIdInput ] );

	// Create odieBotId for display in debug
	const odieBotId = useMemo( () => createOdieBotId( agentId ), [ agentId ] );

	// New Conversation: generate new session ID and increment key to remount chat
	const handleNewConversation = useCallback( () => {
		setSessionId( generateSessionId() );
		setChatKey( ( prev ) => prev + 1 );
	}, [] );

	return (
		<div className="agenttic-test">
			<div className="agenttic-test__sidebar">
				<h3>{ __( 'Agent Configuration' ) }</h3>

				<div className="agenttic-test__field">
					<label htmlFor="agent-id">
						{ __( 'Agent Slug' ) } <span className="required">*</span>
					</label>
					<input
						id="agent-id"
						type="text"
						value={ agentId }
						onChange={ ( e ) => setAgentId( e.target.value ) }
						placeholder="e.g., wpcom-support-chat"
					/>
				</div>

				<div className="agenttic-test__field">
					<label htmlFor="blog-id">
						{ __( 'Blog ID' ) } <span className="required">*</span>
					</label>
					<input
						id="blog-id"
						type="number"
						value={ blogIdInput }
						onChange={ ( e ) => setBlogIdInput( e.target.value ) }
						placeholder="Send blog id to the agent"
					/>
					{ ! blogId && (
						<p className="agenttic-test__field-hint agenttic-test__field-hint--error">
							{ __( 'Blog ID is required for accurate context.' ) }
						</p>
					) }
				</div>

				<div className="agenttic-test__actions">
					<button type="button" className="agenttic-test__button" onClick={ handleNewConversation }>
						{ __( 'New Conversation' ) }
					</button>
				</div>

				<div className="agenttic-test__info">
					<h4>{ __( 'Auth Info' ) }</h4>
					<p>
						{ __(
							'Using JWT auth via wpcom-proxy-request. Make sure you are logged in to WordPress.com and a valid Blog ID is set.'
						) }
					</p>
				</div>

				<div className="agenttic-test__debug">
					<h4>{ __( 'Debug' ) }</h4>
					<dl>
						<dt>{ __( 'Session ID' ) }</dt>
						<dd>{ sessionId }</dd>
						<dt>{ __( 'Odie Bot ID' ) }</dt>
						<dd>{ odieBotId }</dd>
						<dt>{ __( 'Blog ID' ) }</dt>
						<dd>{ blogId ?? __( 'not set (context missing)' ) }</dd>
					</dl>
				</div>
			</div>

			<div className="agenttic-test__chat">
				<AgentticChat
					key={ chatKey }
					agentId={ agentId }
					sessionId={ sessionId }
					parsedBlogId={ blogId }
				/>
			</div>
		</div>
	);
};

export default AgentticTest;
