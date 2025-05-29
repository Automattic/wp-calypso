import { createClient } from '../client/index';
import { createEnvAuthProvider } from './auth';
import { createExampleTools } from './tools';
import { createCLIContextProvider } from './context';
import { nodeDispatcher } from './dispatcher';
import { cliLog } from '../client/utils/logger';
import type { CLIOptions } from './types';
import type {
	Client,
	Message,
	TaskUpdate,
	TextPart,
} from '../client/types/index';
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
