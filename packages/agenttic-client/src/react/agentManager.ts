import type {
	Client,
	ClientConfig,
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
	extractToolCallsFromMessage,
	generateMessageId,
} from '../client/utils/index';
import { log } from '../client/utils/logger';
import {
	clearConversation,
	loadConversation,
	storeConversation,
} from './conversationStorage';
import {
	createTextMessageWithHistory,
	extractNewContentFromMessage,
	extractToolResultsFromMessage,
} from './conversationUtils';

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
}

/**
 * Agent instance with conversation tracking
 */
interface ManagedAgent {
	client: Client;
	sessionId: string | null;
	conversationStorageKey?: string;
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
	resetConversation: ( key: string ) => Promise< void >;
	getConversationHistory: ( key: string ) => Message[];
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

			// Load existing conversation history if sessionId is provided
			let conversationHistory: Message[] = [];
			if ( sessionId ) {
				try {
					conversationHistory = await loadConversation(
						sessionId,
						conversationStorageKey
					);
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

			const { withHistory = true, ...otherOptions } = options;
			const { client, conversationHistory } = managedAgent;

			const messageObj: Message =
				options.message ||
				createTextMessageWithHistory( message, conversationHistory );

			const task = await client.sendMessage( {
				message: messageObj,
				withHistory,
				...otherOptions,
			} );

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

			const {
				withHistory = true,
				abortSignal,
				metadata,
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

			const messageObj: Message =
				options.message ||
				createTextMessageWithHistory(
					message,
					resolvedConversationHistory
				);

			// Add metadata to the message object that will be sent to the agent
			if ( options.metadata && ! options.message ) {
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
			// createTextMessage automatically splits contentType into TextPart metadata
			const userMessage = createTextMessage( message, options.metadata );
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
				abortSignal: abortController.signal,
				...otherOptions,
				...( messageMetadata &&
					Object.keys( messageMetadata ).length > 0 && {
						metadata: messageMetadata,
					} ),
			} ) ) {
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

		getConversationHistory( key: string ): Message[] {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			return [ ...managedAgent.conversationHistory ];
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
