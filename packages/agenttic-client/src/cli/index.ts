#!/usr/bin/env node

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { createA2AClient } from '../client/index';
import { createTextMessage, extractTextFromMessage } from '../utils/index';
import { createEnvAuthProvider } from './auth';
import { CLIToolProvider, createExampleTools } from './tools';
import { cliLog, enableDebug, logger } from '../utils/logger';
import type { CLIOptions, InteractiveSession } from './types';
import { createRequire } from 'module';
import chalk from 'chalk';

// Force color support for chalk (same as in logger)
process.env.FORCE_COLOR = '1';
chalk.level = 3;

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
		interactive: true, // Set interactive as default
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
			case '--single':
				options.interactive = false; // Disable interactive for single mode
				break;
			case '--interactive':
			case '-i':
				options.interactive = true;
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
  agenttic-client [OPTIONS] [MESSAGE]

  By default, starts in interactive mode.
  Provide a MESSAGE to start interactive mode with that initial message.
  Use --single to send one message and exit.

OPTIONS:
  -u, --url <url>        Full agent URL (overrides --agent)
  -a, --agent <name>     Agent name (default: big-sky)
  -t, --token <token>    Authentication token (enables auth)
  -s, --session <id>     Session ID for conversation continuity
  --timeout <ms>         Request timeout in milliseconds
  -p, --proxy <proxy>    Proxy URL (default: socks://127.0.0.1:8080)
  --no-proxy             Disable proxy
  --stream               Enable streaming mode (real-time responses)
  --single               Force single message mode (disable interactive)
  -i, --interactive      Force interactive mode (default)
  -v, --verbose          Enable verbose output
  --auth                 Enable authentication (check env vars)
  --tools                Enable example tools (echo, calculator, current_time)
  -h, --help             Show this help message

MODES:
  Interactive Mode (default):
    Start a conversation session where you can send multiple messages.
    If you provide an initial MESSAGE, it will be sent first, then continue interactively.
    Use: pnpm cli
    Or:  pnpm cli "Initial message"
    
  Single Message Mode:
    Send one message and exit. Only activated with --single flag.
    Use: pnpm cli --single "Your message here"

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
  # Start interactive mode (default)
  pnpm cli

  # Start interactive mode with initial message
  pnpm cli "Hello, agent!"

  # Single message mode (explicit)
  pnpm cli --single "Hello, agent!"

  # Different agent in interactive mode
  pnpm cli --agent custom

  # Interactive mode with initial message to different agent
  pnpm cli --agent custom "Hello, custom agent!"

  # Single message with authentication
  pnpm cli --single --token your-jwt-token "What's the weather?"

  # Custom URL in interactive mode
  pnpm cli --url https://my-agent.com/api "Custom agent"

  # Disable proxy in interactive mode
  pnpm cli --no-proxy "Hello, agent!"

  # Streaming mode (works in both interactive and single)
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
 * Run a single message test
 * @param options
 */
async function runSingleMessage( options: CLIOptions ): Promise< void > {
	if ( ! options.message ) {
		cliLog.error(
			'❌ No message provided. Provide message as the last argument.'
		);
		process.exit( 1 );
	}

	// Determine auth provider based on options
	let authProvider;
	if ( options.auth || options.token ) {
		// Authentication enabled - use env auth provider with optional CLI token
		authProvider = createEnvAuthProvider( options.token );
	} else {
		// No authentication - return empty auth provider
		authProvider = async () => ( {} );
	}

	// Create tool provider if tools are enabled
	const toolProvider = options.tools ? createExampleTools() : undefined;

	const client = createA2AClient( {
		agentUrl: options.url,
		authProvider,
		defaultSessionId: options.session,
		timeout: options.timeout,
		proxy: options.proxy,
		toolProvider,
	} );

	if ( options.verbose ) {
		cliLog.system( `🔗 Connecting to: ${ options.url }` );
		if ( options.session ) {
			cliLog.system( `📋 Session: ${ options.session }` );
		}
		if ( options.proxy ) {
			cliLog.system( `🌐 Proxy: ${ options.proxy }` );
		}
		if ( options.token ) {
			cliLog.system( `🔐 Authentication: Token provided` );
		} else if ( options.auth ) {
			// Check if environment auth provider will return headers
			const envHeaders = await authProvider();
			if ( Object.keys( envHeaders ).length > 0 ) {
				cliLog.system( `🔐 Authentication: Environment variables` );
			} else {
				cliLog.system( `🔓 Authentication: No env vars found` );
			}
		} else {
			cliLog.system( `🔓 Authentication: Disabled (default)` );
		}
		if ( options.tools ) {
			cliLog.system(
				`🔧 Tools: Enabled (echo, calculator, current_time)`
			);
		} else {
			cliLog.system( `🔧 Tools: Disabled` );
		}
		cliLog.system( `📤 Sending: "${ options.message }"` );
	}

	try {
		if ( options.stream ) {
			cliLog.info( '🔄 Streaming response...\n' );

			let hasContent = false;
			for await ( const update of client.sendMessageStream( {
				message: createTextMessage( options.message ),
			} ) ) {
				if ( update.status.message ) {
					const text = extractTextFromMessage(
						update.status.message
					);
					if ( text ) {
						process.stdout.write( chalk.blue( text ) );
						hasContent = true;
					}
				}

				if ( update.final ) {
					if ( hasContent ) {
						process.stdout.write( '\n' );
					}
					if ( options.verbose ) {
						cliLog.success( `✅ Task completed (${ update.id })` );
					}
					break;
				}
			}
		} else {
			cliLog.info( '📤 Sending message...' );
			const task = await client.sendMessage( {
				message: createTextMessage( options.message ),
			} );

			const responseText = task.status.message
				? extractTextFromMessage( task.status.message )
				: '';
			cliLog.info( '📥 Response:' );
			cliLog.agent( responseText || '(No text response)' );

			if ( options.verbose ) {
				cliLog.success( `\n✅ Task completed (${ task.id })` );
				cliLog.system( `📊 Status: ${ task.status.state }` );
			}
		}
	} catch ( error ) {
		cliLog.error(
			'❌ Error:',
			error instanceof Error ? error.message : String( error )
		);
		process.exit( 1 );
	}
}

/**
 * Run interactive mode
 * @param options
 */
async function runInteractive( options: CLIOptions ): Promise< void > {
	// Determine auth provider based on options
	let authProvider;
	if ( options.auth || options.token ) {
		// Authentication enabled - use env auth provider with optional CLI token
		authProvider = createEnvAuthProvider( options.token );
	} else {
		// No authentication - return empty auth provider
		authProvider = async () => ( {} );
	}

	// Create tool provider if tools are enabled
	const toolProvider = options.tools ? createExampleTools() : undefined;

	const client = createA2AClient( {
		agentUrl: options.url,
		authProvider,
		defaultSessionId: options.session,
		timeout: options.timeout,
		proxy: options.proxy,
		toolProvider,
	} );

	const rl = createReadlineInterface();

	const session: InteractiveSession = {
		sessionId: options.session || `cli-${ Date.now() }`,
		conversationHistory: [],
		messageCount: 0,
	};

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

	cliLog.info( `
🤖 A2A Agent Test CLI - Interactive Mode
Connected to: ${ options.url }
Session: ${ session.sessionId }
Auth: ${ authStatus }
Tools: ${ toolStatus }
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

		try {
			if ( options.stream ) {
				cliLog.info( '🔄 Streaming response...\n' );

				let hasContent = false;
				for await ( const update of client.sendMessageStream( {
					message: createTextMessage(
						options.message,
						session.conversationHistory
					),
					sessionId: session.sessionId,
				} ) ) {
					if ( update.status.message ) {
						// Check for tool calls and execute them asynchronously (non-blocking)
						if ( toolProvider && update.status.message.parts ) {
							for ( const part of update.status.message.parts ) {
								if (
									part.type === 'data' &&
									'toolCallId' in part.data &&
									'toolId' in part.data &&
									'arguments' in part.data
								) {
									const {
										toolCallId,
										toolId,
										arguments: args,
									} = part.data;

									// Execute tool without blocking stream processing
									toolProvider
										.executeTool( toolId as string, args )
										.then( ( result ) => {
											if ( options.verbose ) {
												cliLog.system(
													`🔧 Tool ${ toolId } completed: ${ JSON.stringify(
														result
													) }`
												);
											}
										} )
										.catch( ( toolError ) => {
											if ( options.verbose ) {
												cliLog.system(
													`🔧 Tool ${ toolId } failed: ${ toolError.message }`
												);
											}
										} );
								}
							}
						}

						const text = extractTextFromMessage(
							update.status.message
						);
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
			} else {
				cliLog.info( '📤 Sending...' );
				const task = await client.sendMessage( {
					message: createTextMessage(
						options.message,
						session.conversationHistory
					),
					sessionId: session.sessionId,
				} );

				// Debug: log the full task response
				if ( options.verbose ) {
					cliLog.system(
						`🔍 Full task response: ${ JSON.stringify(
							task,
							null,
							2
						) }`
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
				session.conversationHistory.push( {
					role: 'model',
					text: responseText,
				} );
			}
		} catch ( error ) {
			cliLog.error(
				'❌ Error:',
				error instanceof Error ? error.message : String( error )
			);
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

			try {
				if ( options.stream ) {
					cliLog.info( '🔄 Streaming response...\n' );
					let hasContent = false;
					for await ( const update of client.sendMessageStream( {
						message: createTextMessage(
							trimmedInput,
							session.conversationHistory
						),
						sessionId: session.sessionId,
					} ) ) {
						if ( update.status.message ) {
							// Check for tool calls and execute them asynchronously (non-blocking)
							if ( toolProvider && update.status.message.parts ) {
								for ( const part of update.status.message
									.parts ) {
									if (
										part.type === 'data' &&
										'toolCallId' in part.data &&
										'toolId' in part.data &&
										'arguments' in part.data
									) {
										const {
											toolCallId,
											toolId,
											arguments: args,
										} = part.data;

										// Execute tool without blocking stream processing
										toolProvider
											.executeTool(
												toolId as string,
												args
											)
											.then( ( result ) => {
												if ( options.verbose ) {
													cliLog.system(
														`🔧 Tool ${ toolId } completed: ${ JSON.stringify(
															result
														) }`
													);
												}
											} )
											.catch( ( toolError ) => {
												if ( options.verbose ) {
													cliLog.system(
														`🔧 Tool ${ toolId } failed: ${ toolError.message }`
													);
												}
											} );
									}
								}
							}

							const text = extractTextFromMessage(
								update.status.message
							);
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
				} else {
					cliLog.info( '📤 Sending...' );
					const task = await client.sendMessage( {
						message: createTextMessage( trimmedInput ),
						sessionId: session.sessionId,
					} );

					const responseText = task.status.message
						? extractTextFromMessage( task.status.message )
						: '';
					cliLog.agent( responseText || '(No text response)' );
				}
			} catch ( error ) {
				cliLog.error(
					'❌ Error:',
					error instanceof Error ? error.message : String( error )
				);
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

		// Determine mode based on options
		if ( options.interactive ) {
			// Interactive mode (default unless --single is used)
			logger( 'Starting interactive mode' );
			await runInteractive( options );
		} else {
			// Single message mode (only when --single is explicitly used)
			logger( 'Starting single message mode' );
			await runSingleMessage( options );
		}
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

export { main, parseArgs, runSingleMessage, runInteractive };
