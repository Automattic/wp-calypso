import { createClient } from '../client/index';
import { createEnvAuthProvider } from './auth';
import { createExampleTools } from './tools';
import { createCLIContextProvider } from './context';
import { nodeDispatcher } from './dispatcher';
import { cliLog } from '../client/utils/logger';
import type { CLIOptions } from './types';
import type {
	Client,
	DataPart,
	Message,
	TaskUpdate,
	TextPart,
} from '../client/types/index';
import { generateMessageId } from '../client/utils/core';
import chalk from 'chalk';

/**
 * Extract text content from a Message
 *
 * @param message - The A2A message to extract text from
 * @return Concatenated text from all text parts
 */
export function extractTextFromMessage( message: Message ): string {
	return message.parts
		.filter( ( part ): part is TextPart => part.type === 'text' )
		.map( ( part ) => part.text )
		.join( ' ' );
}

/**
 * Convert ConversationMessage array to A2A message parts for history
 *
 * @param conversationMessages - Array of previous conversation messages
 * @return Array of data parts representing conversation history
 */
export function conversationMessagesToDataParts(
	conversationMessages: Message[]
): DataPart[] {
	const historyParts: DataPart[] = [];

	for ( const message of conversationMessages ) {
		for ( const part of message.parts ) {
			if ( part.type === 'text' ) {
				// Convert text parts to history data parts
				historyParts.push( {
					type: 'data',
					data: {
						role: message.role,
						text: ( part as TextPart ).text,
					},
				} );
			} else if ( part.type === 'data' ) {
				// Pass through data parts (tool calls, tool results, etc.)
				historyParts.push( part as DataPart );
			}
		}
	}

	return historyParts;
}

/**
 * Create A2A message with conversation history from Message array
 *
 * @param text                 - The user text message to send
 * @param conversationMessages - Array of previous conversation messages
 * @return A2A Message with history and current text
 */
export function createTextMessageWithHistory(
	text: string,
	conversationMessages: Message[] = []
): Message {
	const historyParts =
		conversationMessagesToDataParts( conversationMessages );

	return {
		role: 'user',
		kind: 'message',
		messageId: generateMessageId(),
		parts: [
			...historyParts,
			{
				type: 'text',
				text,
			} as TextPart,
		],
	};
}

/**
 * Create providers based on CLI options
 *
 * @param options - CLI options
 * @return Object containing auth, tool, and context providers
 */
export function createProviders( options: CLIOptions ) {
	// Determine auth provider based on options
	let authProvider;
	if ( options.auth || options.token ) {
		// Authentication enabled - use env auth provider with optional CLI token
		authProvider = createEnvAuthProvider( options.token );
	} else {
		// No authentication - return empty auth provider
		authProvider = async () => ( {} );
	}

	// Create tool provider if tools are enabled - no callbacks needed!
	const toolProvider = options.tools ? createExampleTools() : undefined;

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
	// Create all providers
	const { authProvider, toolProvider, contextProvider } =
		createProviders( options );

	// Create client with all providers
	const client = createClient( {
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
		client,
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
