/**
 * The page-design stream transport: turns each task update into the markup
 * streamed so far for the renderer mounted on the editor, and keeps the latest
 * markup so a renderer mounting mid-stream catches up. The ability callback,
 * which runs once the tool round trip completes, ends the stream.
 *
 * Runs in the shared chat path on every task update, so it imports nothing
 * from the editor.
 */

import { isRecord } from '../../utils/is-record';
import type { Part, TaskUpdate, ToolCallDataPart } from '@automattic/agenttic-client';

export const STREAM_PAGE_DESIGN_TOOL_ID = 'big_sky__stream_page_design';

/**
 * Fired once per tool call, before the first frame is staged, so a surface that
 * covers the editor can uncover it in time to watch the design build. A DOM
 * event because the listener, Big Sky's easy mode, is another bundle.
 */
export const PAGE_DESIGN_STREAM_STARTED_EVENT = 'big-sky-page-design-stream-started';

export interface StreamUpdate {
	toolCallId: string;
	isFinal?: boolean;
}

type StreamHandler = ( update: StreamUpdate ) => void | Promise< void >;

const JSON_ESCAPES: Record< string, string > = { b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };

/**
 * The value of a string property inside JSON that may still be streaming, up to
 * its closing quote or the end of the text. An escape cut off by the end is
 * left out rather than emitted half-decoded. `null` when the property is absent.
 */
export function extractPartialJsonStringProperty(
	rawJson: string,
	property: string
): string | null {
	const escaped = property.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
	const match = new RegExp( `"${ escaped }"\\s*:\\s*"` ).exec( rawJson );

	if ( ! match ) {
		return null;
	}

	let index = match.index + match[ 0 ].length;
	let value = '';

	while ( index < rawJson.length ) {
		const char = rawJson[ index ];

		if ( char === '"' ) {
			return value;
		}

		if ( char !== '\\' ) {
			value += char;
			index += 1;
			continue;
		}

		const next = rawJson[ index + 1 ];

		if ( next === undefined ) {
			return value;
		}

		if ( next === 'u' ) {
			const hex = rawJson.slice( index + 2, index + 6 );

			if ( ! /^[0-9a-fA-F]{4}$/.test( hex ) ) {
				return value;
			}

			value += String.fromCharCode( parseInt( hex, 16 ) );
			index += 6;
			continue;
		}

		value += JSON_ESCAPES[ next ] ?? next;
		index += 2;
	}

	return value;
}

/**
 * The markup a part's arguments carry: parsed once the arguments are complete,
 * otherwise read out of the raw JSON the client is still receiving.
 */
export function getMarkupFromArguments( value: unknown ): string | null {
	if ( ! isRecord( value ) ) {
		return null;
	}

	if ( typeof value.markup === 'string' ) {
		return value.markup;
	}

	return typeof value._raw === 'string'
		? extractPartialJsonStringProperty( value._raw, 'markup' )
		: null;
}

// Global so `lastIndex` can resume the scan past a closed section; reset before each call.
const SECTION_START = /<!--\s*wpcom:page-design-section\s+([\s\S]*?)\s*-->/gi;
const SECTION_END = /<!--\s*\/wpcom:page-design-section\s*-->/i;
const NEXT_SECTION = /<!--\s*wpcom:page-design-section\b/gi;
const SECTION_CLOSE_DELIMITER = '<!-- /wpcom:page-design-section -->';

// A closing delimiter still streaming would otherwise be parsed as content.
function stripPartialClosingDelimiter( content: string ): string {
	const start = content.lastIndexOf( '<!--' );

	if ( start === -1 ) {
		return content;
	}

	const trailing = content.slice( start );
	const isPartialClose =
		trailing.length < SECTION_CLOSE_DELIMITER.length &&
		SECTION_CLOSE_DELIMITER.startsWith( trailing );

	return isPartialClose ? content.slice( 0, start ) : content;
}

/**
 * The page sections of the markup streamed so far, joined. A section still
 * open runs to the next section start or the end of the text. `null` before
 * the first page section begins.
 *
 * The delimiter's JSON is parsed rather than matched up to a brace, so a `}`
 * inside one of its values does not end it early.
 */
export function getPageSectionMarkup( markup: string ): string | null {
	const sections: string[] = [];
	let start: RegExpExecArray | null;

	SECTION_START.lastIndex = 0;

	while ( ( start = SECTION_START.exec( markup ) ) !== null ) {
		let target: unknown;

		try {
			const parsed = JSON.parse( start[ 1 ].trim() );
			target = isRecord( parsed ) ? parsed.target : undefined;
		} catch {
			target = undefined;
		}

		if ( target !== 'page' ) {
			continue;
		}

		const contentStart = start.index + start[ 0 ].length;
		const rest = markup.slice( contentStart );
		const end = SECTION_END.exec( rest );

		if ( end ) {
			sections.push( rest.slice( 0, end.index ) );
			SECTION_START.lastIndex = contentStart + end.index + end[ 0 ].length;
			continue;
		}

		NEXT_SECTION.lastIndex = contentStart;
		const next = NEXT_SECTION.exec( markup );

		sections.push(
			stripPartialClosingDelimiter(
				markup.slice( contentStart, next ? next.index : markup.length )
			)
		);
		break;
	}

	return sections.length ? sections.join( '\n' ) : null;
}

// One renderer per page load, mounted on the editor.
let handler: StreamHandler | undefined;
// What each tool call streamed last, so a renderer mounting mid-stream catches up.
const lastMarkupByToolCall = new Map< string, string >();
const awaitingFinalFlush = new Set< string >();
const announcedToolCalls = new Set< string >();

// Scoped to the agent session: a new session's first update drops what the
// previous one streamed, so nothing is replayed into an unrelated editor.
let lastSessionId: string | undefined;

function forgetStreams(): void {
	lastMarkupByToolCall.clear();
	awaitingFinalFlush.clear();
	announcedToolCalls.clear();
}

function announceStreamStarted( toolCallId: string ): void {
	if ( announcedToolCalls.has( toolCallId ) ) {
		return;
	}

	announcedToolCalls.add( toolCallId );
	window.dispatchEvent(
		new CustomEvent( PAGE_DESIGN_STREAM_STARTED_EVENT, { detail: { toolCallId } } )
	);
}

// A renderer failure is logged, not thrown: the update chain and the tool
// round trip go on, and the design is already on the canvas where it failed.
async function deliver( update: StreamUpdate ): Promise< boolean > {
	try {
		await handler?.( update );

		return true;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error(
			update.isFinal
				? '[AgentsManager] The page design could not be finalized:'
				: '[AgentsManager] The page design could not be painted:',
			error
		);

		return false;
	}
}

/**
 * Registers the renderer, or unregisters it with `undefined`. A late renderer
 * is handed each tool call's latest markup; unregistering drops that markup,
 * or the next page's editor would be painted with this page's design.
 */
export function setStreamHandler( next: StreamHandler | undefined ): void {
	const wasMissing = ! handler;

	handler = next;

	if ( ! next ) {
		forgetStreams();
		return;
	}

	if ( wasMissing ) {
		for ( const toolCallId of lastMarkupByToolCall.keys() ) {
			void deliver( { toolCallId } );
		}
	}
}

/**
 * The markup a tool call has streamed so far, read by the renderer when it
 * paints. `undefined` once the stream is forgotten, so a flush queued before a
 * session change paints nothing.
 */
export const getStreamedMarkup = ( toolCallId: string ): string | undefined =>
	lastMarkupByToolCall.get( toolCallId );

/** Drops what a finished tool call streamed; the renderer calls it once the design is committed. */
export function forgetStream( toolCallId: string ): void {
	lastMarkupByToolCall.delete( toolCallId );
	awaitingFinalFlush.delete( toolCallId );
	announcedToolCalls.delete( toolCallId );
}

const isPageDesignPart = ( part: Part ): part is ToolCallDataPart => {
	const data = part.type === 'data' ? ( part.data as Record< string, unknown > ) : null;

	return data?.toolId === STREAM_PAGE_DESIGN_TOOL_ID && typeof data.toolCallId === 'string';
};

// Wire data: a provider may hand over an update whose parts are not a list.
const getParts = ( update: TaskUpdate ): Part[] => {
	const parts = update.status?.message?.parts;

	return Array.isArray( parts ) ? parts : [];
};

/** Hands the markup each page-design part carries to the renderer. */
export async function handlePageDesignTaskUpdate( update: TaskUpdate ): Promise< void > {
	if ( update.sessionId && lastSessionId && update.sessionId !== lastSessionId ) {
		forgetStreams();
	}

	if ( update.sessionId ) {
		lastSessionId = update.sessionId;
	}

	for ( const part of getParts( update ) ) {
		if ( ! isPageDesignPart( part ) ) {
			continue;
		}

		const markup = getMarkupFromArguments( part.data.arguments );

		if ( markup === null ) {
			continue;
		}

		const { toolCallId } = part.data;

		announceStreamStarted( toolCallId );

		if ( lastMarkupByToolCall.get( toolCallId ) === markup ) {
			continue;
		}

		lastMarkupByToolCall.set( toolCallId, markup );
		awaitingFinalFlush.add( toolCallId );

		await deliver( { toolCallId } );
	}
}

/**
 * Asks the renderer to finalize the tool call that completed, or every call
 * still pending when the completed one is unknown or not among them. False
 * when a design did not make it onto the page: nothing was streamed, the
 * renderer is not there (it mounts for the life of an editor page, so its
 * chunk failed to load), or the canvas never took it.
 */
export async function finalizePendingStreams( toolCallId?: string ): Promise< boolean > {
	const toolCallIds =
		toolCallId && awaitingFinalFlush.has( toolCallId ) ? [ toolCallId ] : [ ...awaitingFinalFlush ];
	let finalized = toolCallIds.length > 0;

	for ( const id of toolCallIds ) {
		if ( handler ) {
			awaitingFinalFlush.delete( id );
			finalized = ( await deliver( { toolCallId: id, isFinal: true } ) ) && finalized;
		} else {
			forgetStream( id );
			finalized = false;
		}
	}

	return finalized;
}

type OnTaskUpdate = ( update: unknown ) => void | Promise< void >;

// TODO (ability-migration): Pass updates straight through once Big Sky drops its
// `onTaskUpdate` export; nothing will be left to keep the stream from.
/**
 * Runs the transport ahead of the providers' `onTaskUpdate` and strips the
 * stream's parts, so a provider's own renderer never paints the same frames.
 */
export function withPageDesignStream( next: OnTaskUpdate | undefined ): OnTaskUpdate {
	return async ( update ) => {
		const taskUpdate = update as TaskUpdate;
		const parts = getParts( taskUpdate );

		await handlePageDesignTaskUpdate( taskUpdate );

		if ( ! next ) {
			return;
		}

		const rest = parts.filter( ( part ) => ! isPageDesignPart( part ) );
		const stripped =
			rest.length !== parts.length
				? {
						...taskUpdate,
						status: {
							...taskUpdate.status,
							message: { ...taskUpdate.status.message, parts: rest },
						},
				  }
				: update;

		await next( stripped );
	};
}
