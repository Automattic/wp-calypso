import type { Message, Task, TaskUpdate } from '../../types/index';
import { logger } from '../logger';
import { extractTextFromMessage, generateMessageId } from '../core';

/**
 * Parse a stream chunk from a server-sent events stream.
 * This function processes an incoming chunk of data, potentially combined with a buffer
 * from previous chunks, and extracts complete SSE events.
 * @param chunk
 * @param buffer
 */
export function parseStreamChunk(
	chunk: string,
	buffer: string = ''
): { events: Record< string, any >[]; nextBuffer: string } {
	const events: Record< string, any >[] = [];
	// Combine the existing buffer with the new chunk
	const currentStreamData = buffer + chunk;
	let eventPayload = ''; // Accumulates data for the current event
	let lastCompleteEventEnd = 0; // Track where the last complete event ended

	// Process the stream data line by line
	// An SSE event can span multiple lines starting with "data:"
	// and is typically terminated by a blank line.
	let searchStartIndex = 0;
	while ( searchStartIndex < currentStreamData.length ) {
		const newlineIndex = currentStreamData.indexOf(
			'\n',
			searchStartIndex
		);
		// If newlineIndex is -1, it means the rest of currentStreamData is a single line (or empty)
		const line =
			newlineIndex === -1
				? currentStreamData.substring( searchStartIndex )
				: currentStreamData.substring( searchStartIndex, newlineIndex );

		if ( line.startsWith( 'data:' ) ) {
			// If eventPayload is not empty, it means this data line is a continuation
			// of a multi-line data field for the current event. SSE spec says to join with a newline character.
			if ( eventPayload !== '' ) {
				eventPayload += '\n';
			}
			// Add the data part of the line (stripping "data: " or "data:")
			eventPayload += line.substring(
				line.startsWith( 'data: ' ) ? 6 : 5
			);
		} else if ( line.trim() === '' ) {
			// Blank line: indicates the end of an event
			if ( eventPayload ) {
				try {
					events.push( JSON.parse( eventPayload ) );
					// Mark where this complete event ended
					lastCompleteEventEnd =
						newlineIndex === -1
							? currentStreamData.length
							: newlineIndex + 1;
				} catch ( e ) {
					// Log the error and the problematic eventPayload
					logger( 'Failed to parse SSE event: %o', e );
					logger( 'Problematic payload: %s', eventPayload );
				}
				eventPayload = ''; // Reset for the next event
			}
		}
		// Lines not starting with "data:" and not blank (e.g., "event:", "id:", "retry:", comments) are ignored
		// for data extraction in this simplified parser.

		if ( newlineIndex === -1 ) {
			// Reached the end of currentStreamData
			searchStartIndex = currentStreamData.length;
		} else {
			// Move past the current line and its newline character
			searchStartIndex = newlineIndex + 1;
		}
	}

	// Return the original SSE format data for any incomplete event
	// This preserves "data: " prefixes for the next call
	const nextBuffer = currentStreamData.substring( lastCompleteEventEnd );

	return { events, nextBuffer };
}

/**
 * Options for parsing SSE streams
 */
export interface ParseSSEStreamOptions {
	/** Whether to process delta messages for token streaming. Default: false */
	supportDeltas?: boolean;
}

/**
 * Parse SSE stream and yield task updates
 * Handles delta messages, regular task updates, and JSON-RPC responses
 * @param stream  - The readable stream to parse
 * @param options - Configuration options for parsing
 */
export async function* parseSSEStream(
	stream: ReadableStream< Uint8Array >,
	options: ParseSSEStreamOptions = {}
): AsyncIterable< TaskUpdate > {
	const { supportDeltas = false } = options;
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	const accumulator = new DeltaAccumulator();
	let currentTaskId: string | null = null;
	let lastStatus: any = null;

	try {
		while ( true ) {
			const { done, value } = await reader.read();
			if ( done ) {
				break;
			}

			const chunk = decoder.decode( value, { stream: true } );
			const { events, nextBuffer } = parseStreamChunk( chunk, buffer );

			if ( events && Array.isArray( events ) ) {
				for ( let i = 0; i < events.length; i++ ) {
					const event = events[ i ];

					// Pace delta messages for smoother rendering (only delay between deltas, not first one)
					if (
						i > 0 &&
						event.method === 'message/delta' &&
						typeof requestAnimationFrame !== 'undefined'
					) {
						await new Promise( ( resolve ) => {
							requestAnimationFrame( () => resolve( undefined ) );
						} );
					}

					if ( event.error ) {
						throw new Error(
							`Streaming error: ${ event.error.message }`
						);
					}

					// Handle delta messages
					if (
						supportDeltas &&
						event.method === 'message/delta' &&
						event.params?.delta
					) {
						const delta = event.params.delta;

						try {
							if ( delta.deltaType === 'content' ) {
								accumulator.processContentDelta(
									delta.content
								);

								if ( ! currentTaskId && event.params.id ) {
									currentTaskId = event.params.id;
								}

								if ( currentTaskId ) {
									const currentMessage =
										accumulator.getCurrentMessage();
									yield {
										id: currentTaskId,
										status: {
											state: 'working',
											message: currentMessage,
										},
										final: false,
										text: accumulator.getTextContent(),
									};
								}
							}
						} catch ( error ) {
							// Log error but continue processing
							logger( 'Failed to process delta: %o', error );
						}
					}
					// Handle regular task updates
					else if ( event.result && event.result.status ) {
						// Store task ID for delta messages
						currentTaskId = event.result.id;
						lastStatus = event.result.status;

						// When token streaming is enabled, the final message already contains
						// the complete text. We can now reset the accumulator since streaming is complete.
						if (
							accumulator.getTextContent() ||
							accumulator.getCurrentMessage().parts.length > 0
						) {
							accumulator.reset();
						}

						const update: TaskUpdate = {
							id: event.result.id,
							status: event.result.status,
							final:
								event.result.status.state === 'completed' ||
								event.result.status.state === 'failed' ||
								event.result.status.state === 'canceled',
							text: extractTextFromMessage(
								event.result.status?.message || {
									role: 'agent',
									parts: [],
								}
							),
						};

						yield update;
					}
					// Handle regular JSON-RPC responses (for non-token-streaming)
					else if ( event.id && event.result ) {
						// This is a regular response, not a delta
						currentTaskId = event.result.id;
						if ( event.result.status ) {
							const update: TaskUpdate = {
								id: event.result.id,
								status: event.result.status,
								final:
									event.result.status.state === 'completed' ||
									event.result.status.state === 'failed' ||
									event.result.status.state === 'canceled',
								text: extractTextFromMessage(
									event.result.status?.message || {
										role: 'agent',
										parts: [],
									}
								),
							};
							yield update;
						}
					}
				}
			}

			buffer = nextBuffer;
		}
	} finally {
		reader.releaseLock();
	}
}

/**
 * Convert a streaming response to a final task result
 * @param stream
 */
export async function streamToTask(
	stream: AsyncIterable< TaskUpdate >
): Promise< Task > {
	let finalTask: Task | null = null;

	for await ( const update of stream ) {
		if ( update.final && update.status ) {
			finalTask = {
				id: update.id,
				status: update.status,
			};
		}
	}

	if ( ! finalTask ) {
		throw new Error( 'Stream ended without a final task result' );
	}

	return finalTask;
}

/**
 * Delta message types from the server
 */
export interface ContentDelta {
	type: 'content';
	content: string;
}

export interface ToolNameDelta {
	type: 'tool_name';
	content: string;
	toolCallId: string;
	toolCallIndex: number;
}

export interface ToolArgumentDelta {
	type: 'tool_argument';
	content: string;
	toolCallId: string;
	toolCallIndex: number;
}

export type DeltaMessage = ContentDelta | ToolNameDelta | ToolArgumentDelta;

/**
 * Accumulator for delta messages
 * Manages the state of partial messages during streaming
 */
export class DeltaAccumulator {
	private textContent: string = '';
	private toolCalls: Map<
		number,
		{
			toolCallId: string;
			toolName: string;
			argumentFragments: string[];
		}
	> = new Map();

	/**
	 * Process a simple content delta (server's actual format)
	 * @param content - The text content to append
	 */
	public processContentDelta( content: string ): void {
		this.textContent += content;
	}

	/**
	 * Process a delta message and accumulate the content (original format)
	 * @param delta - The delta message to process
	 */
	public processDelta( delta: DeltaMessage ): void {
		switch ( delta.type ) {
			case 'content':
				this.textContent += delta.content;
				break;

			case 'tool_name':
				if ( ! this.toolCalls.has( delta.toolCallIndex ) ) {
					this.toolCalls.set( delta.toolCallIndex, {
						toolCallId: delta.toolCallId,
						toolName: '',
						argumentFragments: [],
					} );
				}
				const toolCall = this.toolCalls.get( delta.toolCallIndex )!;
				toolCall.toolName += delta.content;
				break;

			case 'tool_argument':
				if ( ! this.toolCalls.has( delta.toolCallIndex ) ) {
					this.toolCalls.set( delta.toolCallIndex, {
						toolCallId: delta.toolCallId,
						toolName: '',
						argumentFragments: [],
					} );
				}
				const call = this.toolCalls.get( delta.toolCallIndex )!;
				call.argumentFragments.push( delta.content );
				break;
		}
	}

	/**
	 * Get the accumulated text content
	 */
	public getTextContent(): string {
		return this.textContent;
	}

	/**
	 * Get the current accumulated message
	 * @param role - The role for the message (default: 'agent')
	 */
	public getCurrentMessage( role: 'agent' | 'user' = 'agent' ): Message {
		const parts: any[] = [];

		// Add text content if present
		if ( this.textContent ) {
			parts.push( {
				type: 'text',
				text: this.textContent,
			} );
		}

		// Add tool calls if present
		for ( const [ index, toolCall ] of this.toolCalls ) {
			if ( toolCall.toolName ) {
				// Only add tool call if we have at least the name
				const argumentsStr = toolCall.argumentFragments.join( '' );

				// Try to parse arguments if we have a complete JSON
				let args: any = {};
				if ( argumentsStr ) {
					try {
						args = JSON.parse( argumentsStr );
					} catch {
						// If parsing fails, we might have incomplete JSON
						// We'll include the raw string for debugging
						args = { _raw: argumentsStr };
					}
				}

				parts.push( {
					type: 'data',
					data: {
						toolCallId: toolCall.toolCallId,
						toolId: toolCall.toolName,
						arguments: args,
					},
				} );
			}
		}

		return {
			role,
			parts,
			kind: 'message',
			messageId: generateMessageId(),
		};
	}

	/**
	 * Reset the accumulator
	 */
	public reset(): void {
		this.textContent = '';
		this.toolCalls.clear();
	}
}
