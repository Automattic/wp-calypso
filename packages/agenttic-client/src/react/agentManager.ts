import type {
	Client,
	ClientConfig,
	FilePart,
	Message,
	SendMessageParams,
	Task,
	TaskUpdate,
} from '../client/types/index';
import {
	clearToolResultPromises,
	createClient,
	updateToolResultsWithResolvedPromises,
} from '../client/index';
import {
	createTextMessage,
	createToolResultDataPart,
	extractToolCallsFromMessage,
	generateMessageId,
} from '../client/utils/index';
import { log } from '../client/utils/logger';
import {
	clearConversation,
	type ConversationStorageConfig,
	loadConversation,
	storeConversation,
} from './conversationStorage';
import {
	conversationMessagesToDataParts,
	createTextMessageWithHistory,
	extractNewContentFromMessage,
	extractToolResultsFromMessage,
	messageCarriesToolPayload,
} from './conversationUtils';

/**
 * Update localStorage with new session ID when server returns a stable session ID
 * @param storageKey   - The localStorage key to update
 * @param newSessionId - The new stable session ID from the server
 */
function updateSessionIdInLocalStorage(
	storageKey: string,
	newSessionId: string
): void {
	// @ts-ignore - localStorage may not be available in all environments
	if ( typeof localStorage === 'undefined' ) {
		log( 'localStorage not available, cannot update session ID' );
		return;
	}

	try {
		// @ts-ignore
		const stored = localStorage.getItem( storageKey );
		if ( stored ) {
			const session = JSON.parse( stored );
			const oldSessionId = session.sessionId;

			// Update sessionId but preserve timestamp
			session.sessionId = newSessionId;
			// @ts-ignore
			localStorage.setItem( storageKey, JSON.stringify( session ) );
			log(
				'Updated localStorage[%s] session ID: %s -> %s',
				storageKey,
				oldSessionId,
				newSessionId
			);
		} else {
			// No existing session - create new entry
			const session = {
				sessionId: newSessionId,
				timestamp: Date.now(),
			};
			// @ts-ignore
			localStorage.setItem( storageKey, JSON.stringify( session ) );
			log(
				'Created new session in localStorage[%s]: %s',
				storageKey,
				newSessionId
			);
		}
	} catch ( error ) {
		log(
			'Failed to update localStorage sessionId to %s: %O',
			newSessionId,
			error
		);
	}
}

/**
 * Resolve any promises in conversation history messages
 * @param conversationHistory - Array of messages that may contain tool results with promises
 * @return Updated conversation history with resolved promises
 */
async function resolvePromisesInConversationHistory(
	conversationHistory: Message[]
): Promise< Message[] > {
	const resolvedHistory: Message[] = [];

	for ( const message of conversationHistory ) {
		if ( message.parts && Array.isArray( message.parts ) ) {
			// Check if this message has tool result parts that might contain promises
			const hasToolResults = message.parts.some(
				( part: any ) =>
					part.type === 'data' &&
					'toolCallId' in part.data &&
					'result' in part.data
			);

			if ( hasToolResults ) {
				const updatedParts = updateToolResultsWithResolvedPromises(
					message.parts
				);
				resolvedHistory.push( {
					...message,
					parts: updatedParts,
				} );
			} else {
				resolvedHistory.push( message );
			}
		} else {
			resolvedHistory.push( message );
		}
	}

	clearToolResultPromises();
	return resolvedHistory;
}

/**
 * Configuration for agent manager
 */
export interface AgentManagerConfig extends ClientConfig {
	key?: string;
	sessionId?: string;
	/** localStorage key where sessionId is persisted (for cache) */
	sessionIdStorageKey?: string;
}

/**
 * Agent instance with conversation tracking
 */
interface ManagedAgent {
	client: Client;
	sessionId: string | null;
	conversationStorageKey?: string;
	sessionIdStorageKey?: string;
	storageConfig: ConversationStorageConfig;
	conversationHistory: Message[];
	currentAbortController: AbortController | null;
}

/**
 * Agent manager interface
 */
export interface AgentManager {
	createAgent: (
		key: string,
		config: AgentManagerConfig
	) => Promise< Client >;
	getAgent: ( key: string ) => Client | null;
	hasAgent: ( key: string ) => boolean;
	removeAgent: ( key: string ) => boolean;
	sendMessage: (
		key: string,
		message: string,
		options?: Partial< SendMessageParams >
	) => Promise< Task >;
	sendMessageStream: (
		key: string,
		message: string,
		options?: Partial< SendMessageParams >
	) => AsyncIterable< TaskUpdate >;
	// Used internally by `useAgentChat` — not intended for direct external use.
	sendToolResult: (
		key: string,
		toolCallId: string,
		toolId: string,
		result: unknown,
		options?: Partial< SendMessageParams >
	) => AsyncIterable< TaskUpdate >;
	resetConversation: ( key: string ) => Promise< void >;
	replaceMessages: ( key: string, messages: Message[] ) => Promise< void >;
	getConversationHistory: ( key: string ) => Message[];
	updateSessionId: ( key: string, sessionId: string ) => void;
	abortCurrentRequest: ( key: string ) => void;
	clear: () => void;
}

/**
 * Create a functional agent manager using closures
 */
function createAgentManager(): AgentManager {
	// Private state using closure
	const agents = new Map< string, ManagedAgent >();

	/**
	 * Persist conversation history for an agent
	 * @param key
	 * @param messages
	 */
	async function persistConversationHistory(
		key: string,
		messages: Message[]
	): Promise< void > {
		const agent = agents.get( key );
		if ( agent?.sessionId ) {
			try {
				await storeConversation(
					agent.sessionId,
					messages,
					agent.conversationStorageKey
				);
			} catch ( error ) {
				log(
					`Failed to persist conversation history for agent ${ key }:`,
					error
				);
			}
		}
	}

	return {
		async createAgent(
			key: string,
			config: AgentManagerConfig
		): Promise< Client > {
			if ( agents.has( key ) ) {
				return agents.get( key )!.client;
			}

			const client = createClient( config );
			const sessionId = config.sessionId || null;
			const conversationStorageKey = config.conversationStorageKey;
			const sessionIdStorageKey = config.sessionIdStorageKey;

			// Build storage configuration
			const storageConfig: ConversationStorageConfig = {
				odieBotId: config.odieBotId,
				authProvider: config.authProvider,
			};

			// Load existing conversation history if sessionId is provided
			let conversationHistory: Message[] = [];
			if ( sessionId ) {
				try {
					const result = await loadConversation(
						sessionId,
						conversationStorageKey,
						storageConfig
					);
					conversationHistory = result.messages;
				} catch ( error ) {
					log(
						`Failed to load conversation history for agent ${ key } with session ${ sessionId }:`,
						error
					);
				}
			}

			const managedAgent: ManagedAgent = {
				client,
				sessionId,
				conversationStorageKey,
				sessionIdStorageKey,
				storageConfig,
				conversationHistory,
				currentAbortController: null,
			};

			agents.set( key, managedAgent );
			return client;
		},

		getAgent( key: string ): Client | null {
			const agent = agents.get( key );
			return agent?.client || null;
		},

		hasAgent( key: string ): boolean {
			return agents.has( key );
		},

		removeAgent( key: string ): boolean {
			return agents.delete( key );
		},

		async sendMessage(
			key: string,
			message: string,
			options: Partial< SendMessageParams > = {}
		): Promise< Task > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			const { withHistory = true, sessionId, ...otherOptions } = options;
			const { client, conversationHistory } = managedAgent;

			const messageObj: Message =
				options.message ||
				createTextMessageWithHistory(
					message,
					conversationHistory,
					options.imageUrls
				);

			const task = await client.sendMessage( {
				message: messageObj,
				withHistory,
				sessionId: sessionId || managedAgent.sessionId || undefined,
				...otherOptions,
			} );

			// Capture sessionId from server response
			if ( task.sessionId ) {
				const oldSessionId = managedAgent.sessionId;
				// Always update the sessionId for consistency, even if unchanged
				// (this is a simple assignment and keeps code straightforward)
				managedAgent.sessionId = task.sessionId;

				// Update localStorage only when sessionId actually changes
				// This handles the temp -> stable session ID transition
				// Note: We intentionally skip updating storage when IDs are equal
				if (
					oldSessionId &&
					task.sessionId &&
					oldSessionId !== task.sessionId &&
					managedAgent.sessionIdStorageKey
				) {
					log(
						'Session ID changed from %s to %s, updating localStorage',
						oldSessionId,
						task.sessionId
					);
					updateSessionIdInLocalStorage(
						managedAgent.sessionIdStorageKey,
						task.sessionId
					);
				}
			}

			// Update conversation history (always)
			// Create a complete agent message with tool calls and results if present
			let completeAgentMessage: Message | null = null;
			if ( task.status?.message ) {
				// Extract all tool-related parts from the final message
				const toolParts = task.status.message.parts.filter(
					( part ) =>
						part.type === 'data' &&
						'toolCallId' in part.data &&
						( 'arguments' in part.data || 'result' in part.data )
				);

				// Extract text parts from final message
				const textParts = task.status.message.parts.filter(
					( part ) => part.type === 'text'
				);

				// Create complete message with tool parts + text parts in proper order
				completeAgentMessage = {
					role: 'agent',
					kind: 'message',
					parts: [ ...toolParts, ...textParts ],
					messageId: generateMessageId(),
					metadata: {
						timestamp: Date.now(),
					},
				};
			}

			const newConversationHistory = [
				...conversationHistory,
				// Store only the new content from the user message (without history parts)
				createTextMessage( message ),
				// Add complete agent response with tool calls/results if present
				...( completeAgentMessage
					? [ extractNewContentFromMessage( completeAgentMessage ) ]
					: [] ),
			];

			// Check if there's a separate agent message to add
			let finalConversationHistory = newConversationHistory;
			if ( ( task as any ).agentMessage ) {
				const separateAgentMessage = extractNewContentFromMessage(
					( task as any ).agentMessage
				);
				finalConversationHistory = [
					...newConversationHistory,
					separateAgentMessage,
				];
			}

			// Update the agent's conversation history
			managedAgent.conversationHistory = finalConversationHistory;

			// Persist the updated conversation history only if withHistory is true
			if ( withHistory ) {
				await persistConversationHistory(
					key,
					finalConversationHistory
				);
			}

			return task;
		},

		async *sendMessageStream(
			key: string,
			message: string,
			options: Partial< SendMessageParams > = {}
		): AsyncIterable< TaskUpdate > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			// Destructure `message` from options to prevent `...otherOptions` from
			// overwriting the history-prepended `messageObj` built below.
			const {
				withHistory = true,
				abortSignal,
				metadata,
				sessionId,
				message: optionsMessage,
				...otherOptions
			} = options;
			const { client } = managedAgent;

			const messageMetadata = metadata
				? ( ( { contentType, ...rest } ) => rest )( metadata as any )
				: undefined;

			// Create our own abort controller for this stream
			const abortController = new AbortController();
			managedAgent.currentAbortController = abortController;

			// If caller provided their own abort signal, listen to it too
			if ( abortSignal ) {
				abortSignal.addEventListener( 'abort', () =>
					abortController.abort()
				);
			}

			// Track conversation history locally to avoid race conditions
			let currentConversationHistory = [
				...managedAgent.conversationHistory,
			];

			// Track current tool call IDs to ensure we only capture matching tool results
			let currentToolCallIds: string[] = [];

			// Resolve any promises in conversation history before sending to agent
			const resolvedConversationHistory =
				await resolvePromisesInConversationHistory(
					currentConversationHistory
				);

			// Update the agent's conversation history with resolved values
			managedAgent.conversationHistory = resolvedConversationHistory;
			// Update local tracking to use resolved history
			currentConversationHistory = resolvedConversationHistory;
			// Persist resolved conversation history if withHistory is true
			if ( withHistory ) {
				await persistConversationHistory(
					key,
					resolvedConversationHistory
				);
			}

			let messageObj: Message;
			if ( optionsMessage ) {
				// When a pre-built message is provided (e.g., tool results),
				// prepend conversation history so the server has full context.
				const historyParts = conversationMessagesToDataParts(
					resolvedConversationHistory
				);
				messageObj = {
					...optionsMessage,
					parts: [ ...historyParts, ...optionsMessage.parts ],
				};
			} else {
				messageObj = createTextMessageWithHistory(
					message,
					resolvedConversationHistory,
					options.imageUrls
				);
			}

			// Add metadata to the message object that will be sent to the agent
			if ( options.metadata && ! optionsMessage ) {
				const { contentType: msgContentType, ...msgMetadata } =
					options.metadata as any;

				// Add contentType to the TextPart metadata if provided
				if ( msgContentType ) {
					const lastPart =
						messageObj.parts[ messageObj.parts.length - 1 ];
					if ( lastPart && lastPart.type === 'text' ) {
						lastPart.metadata = {
							...lastPart.metadata,
							contentType: msgContentType,
						};
					}
				}

				if ( Object.keys( msgMetadata ).length > 0 ) {
					messageObj.metadata = {
						...messageObj.metadata,
						...msgMetadata,
					};
				}
			}

			// Add user message to local conversation history before streaming (always)
			// When a pre-built message is provided (e.g., tool results), use it directly.
			const userMessage =
				optionsMessage ||
				createTextMessage( message, options.metadata );

			// Add image parts if present
			if ( options.imageUrls && options.imageUrls.length > 0 ) {
				const imageParts: FilePart[] = options.imageUrls.map(
					( imageData ) => {
						// Handle both string URLs and ImageData objects
						const url =
							typeof imageData === 'string'
								? imageData
								: imageData.url;
						const metadata =
							typeof imageData === 'string'
								? undefined
								: imageData.metadata;

						// Get mimeType from metadata if available, otherwise default to image/jpeg
						const mimeType =
							( metadata?.fileType as string ) || 'image/jpeg';
						const fileName =
							( metadata?.fileName as string ) || 'image';

						return {
							type: 'file',
							file: {
								name: fileName,
								mimeType,
								uri: url,
							},
							metadata,
						};
					}
				);
				userMessage.parts.push( ...imageParts );
			}
			currentConversationHistory = [
				...currentConversationHistory,
				userMessage,
			];

			// Update agent's conversation history immediately
			managedAgent.conversationHistory = currentConversationHistory;
			// Persist the user message only if withHistory is true
			if ( withHistory ) {
				await persistConversationHistory(
					key,
					currentConversationHistory
				);
			}

			for await ( const update of client.sendMessageStream( {
				message: messageObj,
				withHistory,
				sessionId: sessionId || managedAgent.sessionId || undefined,
				abortSignal: abortController.signal,
				...otherOptions,
				...( messageMetadata &&
					Object.keys( messageMetadata ).length > 0 && {
						metadata: messageMetadata,
					} ),
			} ) ) {
				// Capture sessionId from server response (always trust the server)
				if ( update.sessionId ) {
					const oldSessionId = managedAgent.sessionId;
					// Always update the sessionId for consistency, even if unchanged
					// (this is a simple assignment and keeps code straightforward)
					managedAgent.sessionId = update.sessionId;

					// Update localStorage only when sessionId actually changes
					// This handles two scenarios:
					// 1. Initial session creation (oldSessionId is null/undefined)
					// 2. Temporary -> stable session ID transitions
					// Note: We intentionally skip updating storage when IDs are equal
					if (
						update.sessionId &&
						oldSessionId !== update.sessionId &&
						managedAgent.sessionIdStorageKey
					) {
						log(
							'Session ID %s, updating localStorage',
							oldSessionId
								? `changed from ${ oldSessionId } to ${ update.sessionId }`
								: `received: ${ update.sessionId }`
						);
						updateSessionIdInLocalStorage(
							managedAgent.sessionIdStorageKey,
							update.sessionId
						);
					}
				}

				// Save tool interactions when input is required (this saves the agent message with tool calls)
				if (
					update.status?.state === 'input-required' &&
					update.status?.message
				) {
					// Capture the tool call IDs for this batch
					const toolCalls = extractToolCallsFromMessage(
						update.status.message
					);
					currentToolCallIds = toolCalls.map(
						( call ) => call.data.toolCallId as string
					);

					const toolMessage = extractNewContentFromMessage(
						update.status.message
					);
					currentConversationHistory = [
						...currentConversationHistory,
						toolMessage,
					];

					// Update agent's conversation history immediately
					managedAgent.conversationHistory =
						currentConversationHistory;
					// Persist only if withHistory is true
					if ( withHistory ) {
						await persistConversationHistory(
							key,
							currentConversationHistory
						);
					}
				}

				// Capture tool results when tools are executed (state becomes 'working' after tool execution)
				if (
					update.status?.state === 'working' &&
					update.status?.message &&
					! update.final
				) {
					// Extract ALL tool results first
					const allToolResults = extractToolResultsFromMessage(
						update.status.message
					);

					// Filter to only include results that match current tool call IDs
					const currentToolResults = allToolResults.filter(
						( result ) =>
							currentToolCallIds.includes(
								result.data.toolCallId as string
							)
					);

					if ( currentToolResults.length > 0 ) {
						// Create a message containing just the matching tool results
						const toolResultMessage: Message = {
							role: 'agent',
							kind: 'message',
							parts: currentToolResults,
							messageId: generateMessageId(),
						};

						currentConversationHistory = [
							...currentConversationHistory,
							extractNewContentFromMessage( toolResultMessage ),
						];

						// Update agent's conversation history immediately
						managedAgent.conversationHistory =
							currentConversationHistory;
						// Persist only if withHistory is true
						if ( withHistory ) {
							await persistConversationHistory(
								key,
								currentConversationHistory
							);
						}
					} else if (
						messageCarriesToolPayload( update.status.message )
					) {
						// A tool produced a renderable agent message (e.g. a
						// picker) and the turn is still continuing to the agent.
						// Append it so it renders live, but deliberately leave
						// `currentToolCallIds` untouched: the agent continuation
						// may still echo tool results that must match the
						// in-flight tool calls.
						currentConversationHistory = [
							...currentConversationHistory,
							extractNewContentFromMessage(
								update.status.message
							),
						];

						managedAgent.conversationHistory =
							currentConversationHistory;
						if ( withHistory ) {
							await persistConversationHistory(
								key,
								currentConversationHistory
							);
						}
					}
				}

				if (
					update.final &&
					update.status?.state !== 'input-required'
				) {
					// Clear tool call tracking for next batch
					currentToolCallIds = [];

					let finalAgentMessage: Message | null = null;
					if ( update.status?.message ) {
						finalAgentMessage = extractNewContentFromMessage(
							update.status.message
						);
						currentConversationHistory = [
							...currentConversationHistory,
							finalAgentMessage,
						];

						// Update agent's conversation history
						managedAgent.conversationHistory =
							currentConversationHistory;
						// Persist the final conversation history only if withHistory is true
						if ( withHistory ) {
							await persistConversationHistory(
								key,
								currentConversationHistory
							);
						}
					}
				}

				yield update;
			}

			// Clear abort controller when stream completes
			managedAgent.currentAbortController = null;
		},

		/**
		 * Send a tool result for a previously executed tool call.
		 * Removes any existing tool result for the same `toolCallId` from
		 * conversation history before sending, so the server sees exactly
		 * one result per call.
		 *
		 * @param key        - The agent key
		 * @param toolCallId - The tool call ID to respond to
		 * @param toolId     - The tool ID
		 * @param result     - The tool result payload
		 * @param options    - Optional send message params
		 */
		async *sendToolResult(
			key: string,
			toolCallId: string,
			toolId: string,
			result: unknown,
			options: Partial< SendMessageParams > = {}
		): AsyncIterable< TaskUpdate > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			const isMatchingToolResult = ( part: any ) =>
				part.type === 'data' &&
				part.data?.toolCallId === toolCallId &&
				'result' in part.data;

			// Remove existing tool result for this `toolCallId` from conversation
			// history to prevent duplicate results (server rejects mismatched pairs).
			managedAgent.conversationHistory = managedAgent.conversationHistory
				.map( ( msg ) => ( {
					...msg,
					parts: msg.parts.filter(
						( p ) => ! isMatchingToolResult( p )
					),
				} ) )
				.filter( ( msg ) => msg.parts.length > 0 );

			yield* this.sendMessageStream( key, '', {
				...options,
				message: {
					role: 'user',
					kind: 'message',
					parts: [
						createToolResultDataPart( toolCallId, toolId, result ),
					],
					messageId: generateMessageId(),
				},
			} );
		},

		async resetConversation( key: string ): Promise< void > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			managedAgent.conversationHistory = [];

			// Clear persistent storage as well
			if ( managedAgent.sessionId ) {
				await clearConversation(
					managedAgent.sessionId,
					managedAgent.conversationStorageKey
				);
			}
		},

		async replaceMessages(
			key: string,
			messages: Message[]
		): Promise< void > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			// Replace conversation history with new messages
			managedAgent.conversationHistory = [ ...messages ];

			// Persist to storage
			if ( managedAgent.sessionId ) {
				await persistConversationHistory( key, messages );
			}
		},

		getConversationHistory( key: string ): Message[] {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			return [ ...managedAgent.conversationHistory ];
		},

		updateSessionId( key: string, sessionId: string ): void {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			managedAgent.sessionId = sessionId;

			// Update localStorage if we have a storage key
			if ( managedAgent.sessionIdStorageKey ) {
				updateSessionIdInLocalStorage(
					managedAgent.sessionIdStorageKey,
					sessionId
				);
			}
		},

		abortCurrentRequest( key: string ): void {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			if ( managedAgent.currentAbortController ) {
				managedAgent.currentAbortController.abort();
				managedAgent.currentAbortController = null;
			}
		},

		clear(): void {
			agents.clear();
		},
	};
}

// Global singleton instance
const globalAgentManager = createAgentManager();

/**
 * Get the global agent manager instance
 */
export function getAgentManager(): AgentManager {
	return globalAgentManager;
}
