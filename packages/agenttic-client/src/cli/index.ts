#!/usr/bin/env node

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { cliLog, enableDebug, logger } from '../utils/logger';
import type { CLIOptions, InteractiveSession } from './types';
import { createRequire } from 'module';
import {
	createClientWithProviders,
	getStatusStrings,
	sendMessage,
} from './utils';

// Force color support for chalk (same as in logger)
process.env.FORCE_COLOR = '1';

// Create require for CommonJS modules in ESM
const require = createRequire( import.meta.url );

// Default agent base URL
const DEFAULT_AGENT_BASE_URL =
	'https://public-api.wordpress.com/wpcom/v2/ai/agent/';

// Default agent name
const DEFAULT_AGENT = 'big-sky';

// Default SOCKS proxy for debugging/development
const DEFAULT_PROXY = 'socks://127.0.0.1:8080';

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
	const args = process.argv.slice( 2 );
	const options: CLIOptions = {
		url: DEFAULT_AGENT_BASE_URL + DEFAULT_AGENT,
		proxy: DEFAULT_PROXY, // Set default proxy
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
					options.url = DEFAULT_AGENT_BASE_URL + nextArg;
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
agenttic-client - A2A Protocol Client CLI

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
  Base URL: https://public-api.wordpress.com/wpcom/v2/ai/agent/
  
  Use --agent to specify a different agent:
    --agent big-sky     → https://public-api.wordpress.com/wpcom/v2/ai/agent/big-sky
    --agent custom      → https://public-api.wordpress.com/wpcom/v2/ai/agent/custom
  
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
  Default proxy is socks://127.0.0.1:8080 for debugging.
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
		conversationHistory: [],
		messageCount: 0,
	};

	cliLog.info( `
🤖 A2A Agent Test CLI - Interactive Mode
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
		session.conversationHistory.push( {
			role: 'user',
			text: options.message,
		} );

		const responseText = await sendMessage(
			client,
			options.message,
			session.sessionId,
			session.conversationHistory,
			toolProvider,
			options
		);

		if ( responseText ) {
			session.conversationHistory.push( {
				role: 'model',
				text: responseText,
			} );
		}

		// Add spacing before interactive prompt
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

			session.conversationHistory.push( {
				role: 'user',
				text: trimmedInput,
			} );

			const responseText = await sendMessage(
				client,
				trimmedInput,
				session.sessionId,
				session.conversationHistory,
				toolProvider,
				options
			);

			if ( responseText ) {
				session.conversationHistory.push( {
					role: 'model',
					text: responseText,
				} );
			}

			// Add spacing between exchanges
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
