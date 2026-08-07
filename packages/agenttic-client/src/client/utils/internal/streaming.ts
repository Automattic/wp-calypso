import type { Message, Task, TaskUpdate } from '../../types/index';
import { logger } from '../logger';
import {
	extractProgressDataFromMessage,
	extractTextFromMessage,
	generateMessageId,
} from '../core';

/**
 * Parse a stream chunk from a server-sent events stream.
 * This function processes an incoming chunk of data, potentially combined with a buffer
 * from previous chunks, and extracts events.
 *
 * An event is emitted when its `data:` field is terminated by a blank-line delimiter,
 * OR when the trailing `data:` payload already parses as complete JSON even though no
 * delimiter has arrived yet. The latter lets WPCOM streams that hold the connection open
 * (e.g. `input-required` tool calls) surface a complete event immediately instead of
 * waiting for a delimiter or stream close. Payloads that do not yet parse as valid JSON
 * stay in `nextBuffer` until a later chunk completes them.
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

		const fieldLine = line.trimStart();

		if ( fieldLine.startsWith( 'data:' ) ) {
			// If eventPayload is not empty, it means this data line is a continuation
			// of a multi-line data field for the current event. SSE spec says to join with a newline character.
			if ( eventPayload !== '' ) {
				eventPayload += '\n';
			}
			// Add the data part of the line (stripping "data: " or "data:")
			eventPayload += fieldLine.substring(
				fieldLine.startsWith( 'data: ' ) ? 6 : 5
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

	if ( eventPayload ) {
		try {
			events.push( JSON.parse( eventPayload ) );
			lastCompleteEventEnd = currentStreamData.length;
		} catch {
			// Keep buffering until a later chunk completes the JSON payload or
			// the SSE blank-line delimiter arrives.
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

function getResultTaskId( result: {
	id?: string;
	taskId?: string;
} ): string | undefined {
	return result.id ?? result.taskId;
}

function isFinalTaskUpdate( result: {
	final?: boolean;
	status?: { state?: string; final?: boolean };
} ): boolean {
	return (
		result.final === true ||
		result.status?.final === true ||
		result.status?.state === 'completed' ||
		result.status?.state === 'failed' ||
		result.status?.state === 'canceled'
	);
}

/**
 * How long to keep processing delta events before yielding to the browser for
 * a paint. Keeps live token streaming smooth while letting an already-buffered
 * backlog drain in a handful of frames instead of one delta per frame.
 */
const DELTA_PACING_FRAME_BUDGET_MS = 16;

/**
 * Upper bound on a single pacing wait. `requestAnimationFrame` can be
 * throttled or paused entirely (hidden tabs, occluded windows, battery
 * saver); without this cap a fully-received answer can take minutes to
 * finish rendering.
 */
const DELTA_PACING_MAX_FRAME_WAIT_MS = 50;

/**
 * Wait for the next animation frame, but never longer than
 * `DELTA_PACING_MAX_FRAME_WAIT_MS`.
 */
function waitForNextFrame(): Promise< void > {
	return new Promise< void >( ( resolve ) => {
		let settled = false;
		// The timeout callback cannot fire before `rafId` below is
		// initialized: timers only run after the current task completes.
		const timeoutId = setTimeout( () => {
			settled = true;
			if ( typeof cancelAnimationFrame !== 'undefined' ) {
				cancelAnimationFrame( rafId );
			}
			resolve();
		}, DELTA_PACING_MAX_FRAME_WAIT_MS );
		const rafId = requestAnimationFrame( () => {
			if ( settled ) {
				return;
			}
			settled = true;
			clearTimeout( timeoutId );
			resolve();
		} );
	} );
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
	let hasProcessedDelta = false;
	let lastFrameYieldTime = 0;

	const processEvents = async function* (
		events: Record< string, any >[]
	): AsyncIterable< TaskUpdate > {
		for ( let i = 0; i < events.length; i++ ) {
			const event = events[ i ];

			// Pace delta messages for smoother rendering, but only when the
			// processing budget since the last frame yield is exhausted —
			// never one frame per delta, and never delaying the first delta.
			if (
				event.method === 'message/delta' &&
				typeof requestAnimationFrame !== 'undefined'
			) {
				if ( ! hasProcessedDelta ) {
					lastFrameYieldTime = Date.now();
				} else if (
					Date.now() - lastFrameYieldTime >=
					DELTA_PACING_FRAME_BUDGET_MS
				) {
					await waitForNextFrame();
					lastFrameYieldTime = Date.now();
				}
				hasProcessedDelta = true;
			}

			if ( event.error ) {
				throw new Error( `Streaming error: ${ event.error.message }` );
			}

			// Handle delta messages
			if (
				supportDeltas &&
				event.method === 'message/delta' &&
				event.params?.delta
			) {
				const delta = event.params.delta as StreamDelta;

				try {
					let processed = false;
					if ( isToolCallStreamDelta( delta ) ) {
						accumulator.processToolCallDelta( delta );
						processed = true;
					} else if ( delta.deltaType === 'content' ) {
						accumulator.processContentDelta( delta.content );
						processed = true;
					}

					if ( processed ) {
						if ( ! currentTaskId && event.params.id ) {
							currentTaskId = event.params.id;
						}
						if ( currentTaskId ) {
							yield {
								id: currentTaskId,
								status: {
									state: 'working',
									message: accumulator.getCurrentMessage(),
								},
								final: false,
								text: accumulator.getTextContent(),
								kind: 'delta',
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
				const taskId = getResultTaskId( event.result );
				// Store task ID for delta messages
				if ( taskId ) {
					currentTaskId = taskId;
				}
				// When token streaming is enabled, the final message already contains
				// the complete text. We can now reset the accumulator since streaming is complete.
				if (
					accumulator.getTextContent() ||
					accumulator.getCurrentMessage().parts.length > 0
				) {
					accumulator.reset();
				}

				const statusMessage = event.result.status?.message || {
					role: 'agent',
					parts: [],
				};
				const progress =
					extractProgressDataFromMessage( statusMessage );
				const update: TaskUpdate = {
					id: taskId ?? currentTaskId ?? '',
					sessionId: event.result.sessionId,
					status: event.result.status,
					final: isFinalTaskUpdate( event.result ),
					text: extractTextFromMessage( statusMessage ),
					progressMessage: progress?.summary,
					progressPhase: progress?.phase,
					kind: 'status',
				};

				yield update;
			}
			// Handle regular JSON-RPC responses (for non-token-streaming)
			else if ( event.id && event.result ) {
				const taskId = getResultTaskId( event.result );
				// This is a regular response, not a delta
				if ( taskId ) {
					currentTaskId = taskId;
				}
				if ( event.result.status ) {
					const statusMessage = event.result.status?.message || {
						role: 'agent',
						parts: [],
					};
					const progress =
						extractProgressDataFromMessage( statusMessage );
					const update: TaskUpdate = {
						id: taskId ?? currentTaskId ?? '',
						sessionId: event.result.sessionId,
						status: event.result.status,
						final: isFinalTaskUpdate( event.result ),
						text: extractTextFromMessage( statusMessage ),
						progressMessage: progress?.summary,
						progressPhase: progress?.phase,
						kind: 'status',
					};
					yield update;
				}
			}
		}
	};

	try {
		while ( true ) {
			const { done, value } = await reader.read();
			if ( done ) {
				break;
			}

			const chunk = decoder.decode( value, { stream: true } );
			const { events, nextBuffer } = parseStreamChunk( chunk, buffer );

			if ( events && Array.isArray( events ) ) {
				yield* processEvents( events );
			}

			buffer = nextBuffer;
		}

		const finalChunk = decoder.decode();
		const { events, nextBuffer } = parseStreamChunk( finalChunk, buffer );
		if ( events.length > 0 ) {
			yield* processEvents( events );
		}

		if ( nextBuffer.trim() ) {
			const flushed = parseStreamChunk( '\n\n', nextBuffer );
			if ( flushed.events.length > 0 ) {
				yield* processEvents( flushed.events );
			}
			if ( flushed.nextBuffer.trim() ) {
				logger(
					'Discarding incomplete SSE payload at stream end: %s',
					flushed.nextBuffer
				);
			}
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
 * Delta message types emitted by the server in `message/delta` events.
 */
export interface ContentStreamDelta {
	type?: 'delta';
	deltaType: 'content';
	content: string;
}

export interface ToolNameStreamDelta {
	type?: 'delta';
	deltaType: 'tool_name';
	content: string;
	toolCallId: string;
	toolCallName?: string;
	toolCallIndex?: number;
}

export interface ToolArgumentStreamDelta {
	type?: 'delta';
	deltaType: 'tool_argument';
	content: string;
	toolCallId: string;
	toolCallName?: string;
	toolCallIndex?: number;
}

export type ToolCallStreamDelta = ToolNameStreamDelta | ToolArgumentStreamDelta;

export type StreamDelta =
	| ContentStreamDelta
	| ToolNameStreamDelta
	| ToolArgumentStreamDelta;

function isToolCallStreamDelta(
	delta: StreamDelta
): delta is ToolCallStreamDelta {
	return (
		delta.deltaType === 'tool_argument' || delta.deltaType === 'tool_name'
	);
}

/**
 * Legacy accumulator delta types. These predate the current server wire shape,
 * which uses `deltaType` rather than `type`.
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
		number | string,
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
	 * Process the server's live tool-call delta format.
	 * @param delta - The tool delta emitted by the streaming endpoint
	 */
	public processToolCallDelta( delta: ToolCallStreamDelta ): void {
		// Key by toolCallId only. The wire protocol guarantees toolCallId on
		// every tool_argument/tool_name delta, so it's a stable identifier
		// across all deltas for one call. Mixing in toolCallIndex risks
		// double-keying the same call if the server omits the index on some
		// deltas (would key once by number, once by string).
		const key = delta.toolCallId;

		if ( ! this.toolCalls.has( key ) ) {
			this.toolCalls.set( key, {
				toolCallId: delta.toolCallId,
				toolName: '',
				argumentFragments: [],
			} );
		}

		const toolCall = this.toolCalls.get( key )!;
		if ( delta.toolCallName ) {
			toolCall.toolName = delta.toolCallName;
		} else if ( delta.deltaType === 'tool_name' ) {
			toolCall.toolName += delta.content;
		}
		if ( delta.deltaType === 'tool_argument' && delta.content.length > 0 ) {
			toolCall.argumentFragments.push( delta.content );
		}
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
		for ( const toolCall of this.toolCalls.values() ) {
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
