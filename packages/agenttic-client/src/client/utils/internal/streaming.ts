import type { Task, TaskUpdate } from '../../types/index';
import { logger } from '../logger';
import { extractTextFromMessage } from '../core';

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
 * Parse SSE stream and yield task updates
 * @param stream
 */
export async function* parseSSEStream(
	stream: ReadableStream< Uint8Array >
): AsyncIterable< TaskUpdate > {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	try {
		while ( true ) {
			const { done, value } = await reader.read();
			if ( done ) {
				break;
			}

			const chunk = decoder.decode( value, { stream: true } );
			const { events, nextBuffer } = parseStreamChunk( chunk, buffer );

			if ( events && Array.isArray( events ) ) {
				for ( const event of events ) {
					if ( event.error ) {
						throw new Error(
							`Streaming error: ${ event.error.message }`
						);
					}

					if ( event.result && event.result.status ) {
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
