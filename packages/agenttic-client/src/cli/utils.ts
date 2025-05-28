import { createClient } from '../client/index';
import {
	createTextMessage,
	createToolResultDataPart,
	extractTextFromMessage,
} from '../utils/index';
import { createEnvAuthProvider } from './auth';
import { createExampleTools } from './tools';
import { createCLIContextProvider } from './context';
import { nodeDispatcher } from './dispatcher';
import { cliLog } from '../utils/logger';
import type { CLIOptions, ConversationHistoryItem } from './types';
import type { Client } from '../types/index';
import chalk from 'chalk';

/**
 * Create providers based on CLI options
 *
 * @param options   - CLI options
 * @param client    - Agent client instance for sending tool results back to agent
 * @param sessionId - Session ID for tool result messages
 * @return Object containing auth, tool, and context providers
 */
export function createProviders(
	options: CLIOptions,
	client?: Client,
	sessionId?: string
) {
	// Determine auth provider based on options
	let authProvider;
	if ( options.auth || options.token ) {
		// Authentication enabled - use env auth provider with optional CLI token
		authProvider = createEnvAuthProvider( options.token );
	} else {
		// No authentication - return empty auth provider
		authProvider = async () => ( {} );
	}

	// Create tool completion callback that sends results back to agent
	const createToolCompletionCallback = () => {
		if ( ! client || ! sessionId ) {
			return undefined;
		}

		return async ( toolResult: any ) => {
			try {
				cliLog.info( `🔄 Sending tool result back to agent...` );

				// Debug: log what we received as toolResult
				if ( options.verbose ) {
					cliLog.system(
						`🔍 Tool result received: ${ JSON.stringify(
							toolResult,
							null,
							2
						) }`
					);
				}

				// Create a message that includes both the tool result and a prompt to continue
				const toolResultMessage = {
					role: 'user' as const,
					parts: [
						toolResult, // Include the tool result data part
					],
				};

				// Debug: log what we're sending to the agent
				if ( options.verbose ) {
					cliLog.system(
						`🔍 Sending to agent: ${ JSON.stringify(
							toolResultMessage,
							null,
							2
						) }`
					);
				}

				// Send the tool result back to the agent and get the response
				const agentResponse = await client.sendMessage( {
					message: toolResultMessage,
					sessionId,
				} );

				cliLog.info( `✅ Tool result sent to agent` );

				// Debug: log the full agent response
				if ( options.verbose ) {
					cliLog.system(
						`🔍 Agent response to tool result: ${ JSON.stringify(
							agentResponse,
							null,
							2
						) }`
					);
				}

				// Extract and display the agent's response to the tool result
				if ( agentResponse.status.message ) {
					const responseText = extractTextFromMessage(
						agentResponse.status.message
					);
					if ( responseText ) {
						cliLog.info( `🤖 Agent response to tool result:` );
						cliLog.agent( responseText );
					} else {
						cliLog.system(
							`🔍 Agent responded but no text extracted from message parts`
						);
						if (
							options.verbose &&
							agentResponse.status.message.parts
						) {
							cliLog.system(
								`🔍 Message parts: ${ JSON.stringify(
									agentResponse.status.message.parts,
									null,
									2
								) }`
							);
						}
					}
				} else {
					cliLog.system( `🔍 Agent response has no message` );
				}
			} catch ( error ) {
				cliLog.error(
					`❌ Failed to send tool result to agent: ${ error }`
				);
			}
		};
	};

	// Create tool provider if tools are enabled
	const toolProvider = options.tools
		? createExampleTools( createToolCompletionCallback() )
		: undefined;

	// Create context provider if context is enabled
	const contextProvider = options.context
		? createCLIContextProvider()
		: undefined;

	return { authProvider, toolProvider, contextProvider };
}

/**
 * Create agent client with providers
 *
 * @param options - CLI options
 * @return Object containing client and providers
 */
export function createClientWithProviders( options: CLIOptions ) {
	// First create client without tool provider
	const { authProvider, contextProvider } = createProviders( options );

	const client = createClient( {
		agentId: options.agentId,
		agentUrl: options.url,
		authProvider,
		defaultSessionId: options.session,
		timeout: options.timeout,
		proxy: options.proxy,
		contextProvider,
		dispatcher: nodeDispatcher,
	} );

	// Now create tool provider with client reference for tool completion callback
	const sessionId = options.session || `cli-${ Date.now() }`;
	const { toolProvider } = createProviders( options, client, sessionId );

	// Update the client with the tool provider
	const clientWithTools = createClient( {
		agentId: options.agentId,
		agentUrl: options.url,
		authProvider,
		defaultSessionId: options.session,
		timeout: options.timeout,
		proxy: options.proxy,
		toolProvider,
		contextProvider,
		dispatcher: nodeDispatcher,
	} );

	return {
		client: clientWithTools,
		authProvider,
		toolProvider,
		contextProvider,
	};
}

/**
 * Get status strings for display
 *
 * @param options      - CLI options
 * @param authProvider - Authentication provider
 * @return Promise resolving to status strings
 */
export async function getStatusStrings(
	options: CLIOptions,
	authProvider: any
) {
	let authStatus;
	if ( options.token ) {
		authStatus = '🔐 Token Auth';
	} else if ( options.auth ) {
		// Check if environment auth provider will return headers
		const envHeaders = await authProvider();
		if ( Object.keys( envHeaders ).length > 0 ) {
			authStatus = '🔐 Env Auth';
		} else {
			authStatus = '🔓 No Env Vars';
		}
	} else {
		authStatus = '🔓 No Auth (default)';
	}

	const toolStatus = options.tools ? '🔧 Example Tools' : '🔧 No Tools';
	const contextStatus = options.context
		? '📄 WordPress Context'
		: '📄 No Context';

	return { authStatus, toolStatus, contextStatus };
}

/**
 * Handle streaming message response
 *
 * @param client              - Agent client instance
 * @param message             - Message text to send
 * @param sessionId           - Session identifier
 * @param conversationHistory - Conversation history
 * @param toolProvider        - Tool provider for executing tools
 * @param options             - CLI options
 */
export async function handleStreamingMessage(
	client: any,
	message: string,
	sessionId: string,
	conversationHistory: ConversationHistoryItem[],
	toolProvider: any,
	options: CLIOptions
): Promise< void > {
	cliLog.info( '🔄 Streaming response...\n' );

	let hasContent = false;
	for await ( const update of client.sendMessageStream( {
		message: createTextMessage( message, conversationHistory ),
		sessionId,
	} ) ) {
		if ( update.status.message ) {
			const text = extractTextFromMessage( update.status.message );
			if ( text ) {
				process.stdout.write( chalk.blue( text ) );
				hasContent = true;
			}
		}

		if ( update.final ) {
			if ( hasContent ) {
				process.stdout.write( '\n' );
			}
			break;
		}
	}
}

/**
 * Handle non-streaming message response
 *
 * @param client              - Agent client instance
 * @param message             - Message text to send
 * @param sessionId           - Session identifier
 * @param conversationHistory - Conversation history
 * @param options             - CLI options
 * @return Promise resolving to response text
 */
export async function handleNonStreamingMessage(
	client: any,
	message: string,
	sessionId: string,
	conversationHistory: ConversationHistoryItem[],
	options: CLIOptions
): Promise< string > {
	cliLog.info( '📤 Sending...' );
	const task = await client.sendMessage( {
		message: createTextMessage( message, conversationHistory ),
		sessionId,
	} );

	// Debug: log the full task response
	if ( options.verbose ) {
		cliLog.system(
			`🔍 Full task response: ${ JSON.stringify( task, null, 2 ) }`
		);
	}

	const responseText = task.status.message
		? extractTextFromMessage( task.status.message )
		: '';

	if ( options.verbose ) {
		cliLog.system( `🔍 Extracted text: "${ responseText }"` );
		if ( task.status.message ) {
			cliLog.system(
				`🔍 Message parts: ${ JSON.stringify(
					task.status.message.parts,
					null,
					2
				) }`
			);
		}
	}

	cliLog.agent( responseText || '(No text response)' );
	return responseText;
}

/**
 * Send a message using either streaming or non-streaming mode
 *
 * @param client              - Agent client instance
 * @param message             - Message text to send
 * @param sessionId           - Session identifier
 * @param conversationHistory - Conversation history
 * @param toolProvider        - Tool provider for executing tools
 * @param options             - CLI options
 * @return Promise resolving to response text (empty for streaming)
 */
export async function sendMessage(
	client: any,
	message: string,
	sessionId: string,
	conversationHistory: ConversationHistoryItem[],
	toolProvider: any,
	options: CLIOptions
): Promise< string > {
	try {
		if ( options.stream ) {
			await handleStreamingMessage(
				client,
				message,
				sessionId,
				conversationHistory,
				toolProvider,
				options
			);
			return ''; // Streaming doesn't return text directly
		}
		return await handleNonStreamingMessage(
			client,
			message,
			sessionId,
			conversationHistory,
			options
		);
	} catch ( error ) {
		cliLog.error(
			'❌ Error:',
			error instanceof Error ? error.message : String( error )
		);
		return '';
	}
}
