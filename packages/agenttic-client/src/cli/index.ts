#!/usr/bin/env node

// Load environment variables from .env file
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory
const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

// Look for .env files in multiple locations
config( { path: join( __dirname, '../../../../.env' ) } ); // Project root
config( { path: join( __dirname, '../../../.env' ) } ); // Package root
config(); // Current working directory

import { cliLog, enableDebug, logger } from '../client/utils/logger';
import { createTextMessage } from '../client/utils/index';
import type { CLIOptions, InteractiveSession } from './types';
import type { Message, TaskUpdate } from '../client/types/index';
import { createRequire } from 'module';
import {
	createClientWithProviders,
	createTextMessageWithHistory,
	getStatusStrings,
} from './utils';

// Force color support for chalk (same as in logger)
process.env.FORCE_COLOR = '1';

// Create require for CommonJS modules in ESM
const require = createRequire( import.meta.url );

// Get agent base URL from environment
const DEFAULT_AGENT_BASE_URL = process.env.AGENT_API_BASE_URL || 'default';

if ( DEFAULT_AGENT_BASE_URL === 'default' ) {
	cliLog.error( '❌ AGENT_API_BASE_URL environment variable is required' );
	cliLog.info(
		'Please set AGENT_API_BASE_URL in your .env file or environment'
	);
	process.exit( 1 );
}

// Default agent name
const DEFAULT_AGENT = 'big-sky';

// Default SOCKS proxy for debugging/development from environment
const DEFAULT_PROXY = process.env.DEFAULT_PROXY || '';

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
	const args = process.argv.slice( 2 );
	const options: CLIOptions = {
		url: DEFAULT_AGENT_BASE_URL,
		agentId: DEFAULT_AGENT,
		proxy: DEFAULT_PROXY || undefined, // Set default proxy from env, undefined if empty
	};

	for ( let i = 0; i < args.length; i++ ) {
		const arg = args[ i ];
		const nextArg = args[ i + 1 ];

		switch ( arg ) {
			case '--url':
			case '-u':
				if ( nextArg ) {
					options.url = nextArg;
					i++;
				}
				break;
			case '--agent':
			case '-a':
				if ( nextArg ) {
					options.agentId = nextArg;
					i++;
				}
				break;
			case '--token':
			case '-t':
				if ( nextArg ) {
					options.token = nextArg;
					i++;
				}
				break;
			case '--session':
			case '-s':
				if ( nextArg ) {
					options.session = nextArg;
					i++;
				}
				break;
			case '--timeout':
				if ( nextArg ) {
					options.timeout = parseInt( nextArg, 10 );
					i++;
				}
				break;
			case '--proxy':
			case '-p':
				if ( nextArg ) {
					options.proxy = nextArg;
					i++;
				}
				break;
			case '--no-proxy':
				options.proxy = undefined; // Disable proxy
				break;
			case '--stream':
				options.stream = true;
				break;

			case '--verbose':
			case '-v':
				options.verbose = true;
				break;
			case '--auth':
				options.auth = true; // Enable authentication
				break;
			case '--tools':
				options.tools = true; // Enable example tools
				break;
			case '--context':
				options.context = true; // Enable mock client context
				break;
			case '--help':
			case '-h':
				printHelp();
				process.exit( 0 );
				break;
			default:
				if ( arg.startsWith( '-' ) ) {
					cliLog.error( `Unknown option: ${ arg }` );
					process.exit( 1 );
				}
				// Treat as message if no message was provided yet
				if ( ! options.message ) {
					options.message = arg;
				}
				break;
		}
	}

	return options;
}

/**
 * Print help message
 */
function printHelp(): void {
	cliLog.info( `
agenttic-client - Agent Client CLI

USAGE:
 pnpm cli [OPTIONS] [MESSAGE]

  Starts in interactive mode where you can have a conversation with the agent.
  Provide a MESSAGE to start with that initial message, then continue interactively.

OPTIONS:
  -u, --url <url>        Full agent URL (overrides --agent)
  -a, --agent <name>     Agent name (default: big-sky)
  -t, --token <token>    Authentication token (enables auth)
  -s, --session <id>     Session ID for conversation continuity
  --timeout <ms>         Request timeout in milliseconds
  -p, --proxy <proxy>    Proxy URL (default: socks://127.0.0.1:8080)
  --no-proxy             Disable proxy
  --stream               Enable streaming mode (real-time responses)
  -v, --verbose          Enable verbose output
  --auth                 Enable authentication (check env vars)
  --tools                Enable example tools (echo, calculator, current_time)
  --context              Enable mock client context (WordPress page content)
  -h, --help             Show this help message

INTERACTIVE MODE:
  Start a conversation session where you can send multiple messages.
  If you provide an initial MESSAGE, it will be sent first, then continue interactively.
  Use: pnpm cli
  Or:  pnpm cli "Initial message"

AGENT SELECTION:
  By default, connects to the 'big-sky' agent.
  Base URL: configured via AGENT_API_BASE_URL environment variable
  
  Use --agent to specify a different agent:
    --agent big-sky     → {AGENT_API_BASE_URL}/big-sky
    --agent custom      → {AGENT_API_BASE_URL}/custom
  
  Use --url for completely custom URLs:
    --url https://my-agent.com/api

AUTHENTICATION:
  By default, no authentication is used.
  Authentication can be enabled with:
  1. Command line: --token <token> (automatically enables auth)
  2. --auth flag to check environment variables:
     - JETPACK_JWT 
  3. .env file with any of the above variables

PROXY:
  Default proxy can be set via DEFAULT_PROXY environment variable.
  Use --no-proxy to disable or -p to specify a different proxy.

EXAMPLES:
  # Start interactive mode
  pnpm cli

  # Start interactive mode with initial message
  pnpm cli "Hello, agent!"

  # Different agent
  pnpm cli --agent custom

  # Interactive mode with initial message to different agent
  pnpm cli --agent custom "Hello, custom agent!"

  # Interactive mode with authentication
  pnpm cli --token your-jwt-token "What's the weather?"

  # Custom URL
  pnpm cli --url https://my-agent.com/api "Custom agent"

  # Disable proxy
  pnpm cli --no-proxy "Hello, agent!"

  # Streaming mode
  pnpm cli --stream "Tell me a story"

  # Verbose output for debugging
  pnpm cli --verbose "Debug this request"
` );
}

/**
 * Send a message to the agent, handling both streaming and non-streaming modes
 * @param client      - The agent client
 * @param message     - The message to send
 * @param sessionId   - The session ID
 * @param isStreaming - Whether to use streaming mode
 * @param options     - CLI options for verbose output
 */
async function sendMessageToAgent(
	client: any,
	message: Message,
	sessionId: string,
	isStreaming: boolean,
	options: CLIOptions
): Promise< TaskUpdate & { responseShown?: boolean } > {
	if ( isStreaming ) {
		cliLog.info(
			'🔄 Sending to agent (streaming mode, tools handled automatically)...'
		);
		let lastUpdate: TaskUpdate | null = null;
		let hasShownResponse = false;

		for await ( const update of client.sendMessageStream( {
			message,
			sessionId,
		} ) ) {
			lastUpdate = update;

			// Show streaming updates in real-time
			if ( update.text && ! hasShownResponse ) {
				cliLog.agent( update.text );
				hasShownResponse = true;
			} else if ( update.text && options.verbose ) {
				// Show subsequent updates only in verbose mode
				cliLog.agent( `[Update] ${ update.text }` );
			}
		}

		if ( ! lastUpdate ) {
			throw new Error( 'No response received from streaming' );
		}

		return { ...lastUpdate, responseShown: hasShownResponse };
	}

	cliLog.info( '🔄 Sending to agent (tools handled automatically)...' );
	const response = await client.sendMessage( {
		message,
		sessionId,
	} );

	return { ...response, responseShown: false };
}

/**
 * Create readline interface for interactive mode
 */
function createReadlineInterface() {
	// Use dynamic import to avoid issues in environments without readline
	const readline = require( 'readline' );
	return readline.createInterface( {
		input: process.stdin,
		output: process.stdout,
	} );
}

/**
 * Run interactive mode
 * @param options
 */
async function runInteractive( options: CLIOptions ): Promise< void > {
	// Create client with providers
	const { client, authProvider, toolProvider, contextProvider } =
		createClientWithProviders( options );

	// Get status strings for display
	const { authStatus, toolStatus, contextStatus } = await getStatusStrings(
		options,
		authProvider
	);

	// Create readline interface
	const rl = createReadlineInterface();

	const session: InteractiveSession = {
		sessionId: options.session || `cli-${ Date.now() }`,
		conversationMessages: [],
		messageCount: 0,
	};

	cliLog.info( `
🤖 Agent Test CLI - Interactive Mode
Connected to: ${ options.url }
Session: ${ session.sessionId }
Auth: ${ authStatus }
Tools: ${ toolStatus }
Context: ${ contextStatus }
Type 'exit' or 'quit' to end the session.
Type 'help' for commands.
` );

	// If an initial message was provided, send it first
	if ( options.message ) {
		cliLog.info( `📤 Initial message: "${ options.message }"` );
		session.messageCount++;

		// Add user message to conversation
		const userMessage = createTextMessage( options.message );
		session.conversationMessages.push( userMessage );

		const agentResponse = await sendMessageToAgent(
			client,
			createTextMessageWithHistory(
				options.message,
				session.conversationMessages.slice( 0, -1 )
			),
			session.sessionId,
			options.stream || false,
			options
		);

		// Add agent response to conversation
		if ( agentResponse.status.message ) {
			session.conversationMessages.push( agentResponse.status.message );
		}

		// Display the response text (only if not already shown during streaming)
		if ( agentResponse.text && ! agentResponse.responseShown ) {
			cliLog.agent( agentResponse.text );
		} else if ( ! agentResponse.text ) {
			cliLog.info( '(No text response from agent)' );
		}

		// Debug: show task state if verbose
		if ( options.verbose ) {
			cliLog.system(
				`📊 Task completed with state: ${ agentResponse.status.state }`
			);
		}
	}

	const askQuestion = (): Promise< string > => {
		return new Promise( ( resolve ) => {
			rl.question( '> ', resolve );
		} );
	};

	try {
		while ( true ) {
			const input = await askQuestion();
			const trimmedInput = input.trim();

			if ( trimmedInput === 'exit' || trimmedInput === 'quit' ) {
				cliLog.info( '👋 Goodbye!' );
				break;
			}

			if ( trimmedInput === 'help' ) {
				cliLog.info( `
Available commands:
  help     - Show this help
  exit     - Exit the interactive session
  quit     - Exit the interactive session
  
Just type your message to send it to the agent.
` );
				continue;
			}

			if ( trimmedInput === '' ) {
				continue;
			}

			session.messageCount++;

			// Add user message to conversation
			const userMessage = createTextMessage( trimmedInput );
			session.conversationMessages.push( userMessage );

			const agentResponse = await sendMessageToAgent(
				client,
				createTextMessageWithHistory(
					trimmedInput,
					session.conversationMessages.slice( 0, -1 )
				),
				session.sessionId,
				options.stream || false,
				options
			);

			// Add agent response to conversation
			if ( agentResponse.status.message ) {
				session.conversationMessages.push(
					agentResponse.status.message
				);
			}

			// Display the response text (only if not already shown during streaming)
			if ( agentResponse.text && ! agentResponse.responseShown ) {
				cliLog.agent( agentResponse.text );
			} else if ( ! agentResponse.text ) {
				cliLog.info( '(No text response from agent)' );
			}

			// Debug: show task state if verbose
			if ( options.verbose ) {
				cliLog.system(
					`📊 Task completed with state: ${ agentResponse.status.state }`
				);
			}
		}
	} finally {
		rl.close();
	}
}

/**
 * Main CLI entry point
 */
async function main(): Promise< void > {
	try {
		const options = parseArgs();

		// Enable debug logging if --verbose is used
		if ( options.verbose ) {
			enableDebug();
			logger( 'Verbose mode enabled' );
		}

		logger( 'CLI options: %o', options );

		// Always run in interactive mode
		logger( 'Starting interactive mode' );
		await runInteractive( options );
	} catch ( error ) {
		logger( 'Fatal error: %o', error );
		cliLog.error(
			'❌ Fatal error:',
			error instanceof Error ? error.message : String( error )
		);
		process.exit( 1 );
	}
}

// Run the CLI if this file is executed directly
if ( import.meta.url === `file://${ process.argv[ 1 ] }` ) {
	main();
}

export { main, parseArgs, runInteractive };
