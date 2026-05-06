import { useCallback, useEffect, useRef, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import {
	FORMAT_TEXT_TOOL_NAME,
	GET_BLOCK_TOOL_NAME,
	GET_BLOCK_TYPE_TOOL_NAME,
	GET_BLOCK_TYPES_TOOL_NAME,
	GET_EDITOR_BLOCKS_TOOL_NAME,
	GET_INSERTER_ITEMS_TOOL_NAME,
	GET_SELECTED_BLOCK_TOOL_NAME,
	HAS_SELECTED_BLOCK_TOOL_NAME,
	INSERT_BLOCK_TOOL_NAME,
	INSERT_BLOCKS_TOOL_NAME,
	MOVE_BLOCK_TOOL_NAME,
	REMOVE_BLOCK_TOOL_NAME,
	REPLACE_BLOCK_TOOL_NAME,
	SELECT_BLOCK_TOOL_NAME,
	UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME,
	executeFormatTextTool,
	executeGetBlockTool,
	executeGetBlockTypeTool,
	executeGetBlockTypesTool,
	executeGetEditorBlocksTool,
	executeGetInserterItemsTool,
	executeGetSelectedBlockTool,
	executeHasSelectedBlockTool,
	executeInsertBlockTool,
	executeInsertBlocksTool,
	executeMoveBlockTool,
	executeRemoveBlockTool,
	executeReplaceBlockTool,
	executeSelectBlockTool,
	executeUpdateBlockAttributesTool,
	getBlockTitle,
	formatTextToolDefinition,
	getBlockToolDefinition,
	getBlockTypeToolDefinition,
	getBlockTypesToolDefinition,
	getEditorBlocksToolDefinition,
	getInserterItemsToolDefinition,
	getSelectedBlockToolDefinition,
	hasSelectedBlockToolDefinition,
	insertBlockToolDefinition,
	insertBlocksToolDefinition,
	moveBlockToolDefinition,
	removeBlockToolDefinition,
	replaceBlockToolDefinition,
	selectBlockToolDefinition,
	updateBlockAttributesToolDefinition,
} from './tools/editor-blocks-tool';
import {
	GET_POST_INFO_TOOL_NAME,
	PUBLISH_POST_TOOL_NAME,
	REDO_TOOL_NAME,
	SAVE_POST_TOOL_NAME,
	SET_POST_TITLE_TOOL_NAME,
	UNDO_TOOL_NAME,
	executeGetPostInfoTool,
	executePublishPostTool,
	executeRedoTool,
	executeSavePostTool,
	executeSetPostTitleTool,
	executeUndoTool,
	getPostInfoToolDefinition,
	publishPostToolDefinition,
	redoToolDefinition,
	savePostToolDefinition,
	setPostTitleToolDefinition,
	undoToolDefinition,
} from './tools/editor-post-tool';
import {
	PICK_IMAGE_TOOL_NAME,
	executePickImageTool,
	pickImageToolDefinition,
} from './tools/image-picker-tool';
import {
	VERIFY_YOUTUBE_URL_TOOL_NAME,
	executeVerifyYoutubeUrlTool,
	verifyYoutubeUrlToolDefinition,
} from './tools/youtube-oembed-tool';

export type RealtimeStatus =
	| 'idle'
	| 'requesting-token'
	| 'requesting-mic'
	| 'connecting'
	| 'active'
	| 'ending'
	| 'error';

export interface RealtimeTranscriptEntry {
	id: string;
	role: 'user' | 'assistant';
	text: string;
	isFinal: boolean;
	/** When this message bubble first appeared; used to interleave with tool activity. */
	timestamp: number;
}

export interface RealtimeToolEvent {
	id: string;
	label: string;
	status: 'done' | 'error';
	timestamp: number;
}

export interface UseRealtimeSessionOptions {
	/**
	 * Model to use for the Realtime session.
	 */
	model?: string;
	/**
	 * System instructions for the assistant.
	 */
	instructions: string;
}

interface UseRealtimeSessionResult {
	status: RealtimeStatus;
	error: string | null;
	isMuted: boolean;
	transcript: RealtimeTranscriptEntry[];
	toolEvents: RealtimeToolEvent[];
	imagePickerState: import('./image-picker-modal').ImagePickerState;
	start: () => Promise< void >;
	stop: () => void;
	toggleMute: () => void;
	sendText: ( text: string ) => Promise< void >;
	sendEvent: ( eventName: string, details?: string ) => void;
}

const DEFAULT_MODEL = 'gpt-realtime';
/** Proxied by WP.com REST to OpenAI `/v1/realtime/client_secrets`. */
const REALTIME_CLIENT_SECRETS_PATH = '/ai-api-proxy/v1/realtime/client_secrets';
const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';
const MAX_TOOL_EVENTS = 40;
const PROGRAMMATIC_SEND_TIMEOUT_MS = 15000;

declare global {
	interface Window {
		/**
		 * TEMPORARY: inject user text into the active Smart Dictation realtime
		 * session (e.g. from the devtools console). Remove when no longer needed.
		 */
		sendToDictation?: ( text: string ) => Promise< void >;
	}
}

function assistantTurnEntryId( evt: Record< string, unknown > ): string {
	const itemId = typeof evt.item_id === 'string' ? evt.item_id : '';
	const responseId = typeof evt.response_id === 'string' ? evt.response_id : '';
	const ix = typeof evt.content_index === 'number' ? String( evt.content_index ) : '';
	const base = itemId || responseId || 'assistant-latest';
	return ix ? `${ base }:${ ix }` : base;
}

/**
 * Map a tool name + arguments + result to a short, user-facing label that we
 * surface in the assistant panel as a subtle activity log entry. Read-only or
 * housekeeping tools (lookups, page summaries, etc.) return null so they do
 * not clutter the log.
 */
function describeToolCall(
	name: string | undefined,
	rawArgs: unknown,
	result: unknown
): string | null {
	if ( ! name ) {
		return null;
	}

	const args = ( () => {
		try {
			if ( typeof rawArgs === 'string' ) {
				return JSON.parse( rawArgs ) as Record< string, unknown >;
			}
			if ( rawArgs && typeof rawArgs === 'object' ) {
				return rawArgs as Record< string, unknown >;
			}
		} catch {
			// fall through
		}
		return {} as Record< string, unknown >;
	} )();

	const isObjectResult = !! result && typeof result === 'object';
	const ok = isObjectResult && ( result as { ok?: boolean } ).ok !== false;
	const errorPrefix = ok ? '' : 'Failed: ';

	const blockTitleFromArg = ( key: string ): string | null => {
		const val = args[ key ];
		return typeof val === 'string' && val ? getBlockTitle( val ) : null;
	};

	switch ( name ) {
		case INSERT_BLOCK_TOOL_NAME: {
			const title = blockTitleFromArg( 'name' );
			return `${ errorPrefix }Inserted ${ title || 'a block' }`;
		}
		case INSERT_BLOCKS_TOOL_NAME: {
			const blocks = Array.isArray( args.blocks ) ? args.blocks : [];
			if ( blocks.length === 1 ) {
				const first = blocks[ 0 ] as { name?: string } | undefined;
				const title = first?.name ? getBlockTitle( first.name ) : null;
				return `${ errorPrefix }Inserted ${ title || 'a block' }`;
			}
			return `${ errorPrefix }Inserted ${ blocks.length } blocks`;
		}
		case UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME: {
			const attrs = ( args.attributes as Record< string, unknown > ) || {};
			const style = attrs.style as { color?: { text?: string; background?: string } } | undefined;
			if ( style?.color?.text ) {
				return `${ errorPrefix }Set text color`;
			}
			if ( style?.color?.background ) {
				return `${ errorPrefix }Set background color`;
			}
			if ( typeof attrs.level === 'number' ) {
				return `${ errorPrefix }Changed heading level`;
			}
			if ( typeof attrs.content === 'string' ) {
				return `${ errorPrefix }Updated text`;
			}
			return `${ errorPrefix }Updated block`;
		}
		case REPLACE_BLOCK_TOOL_NAME: {
			const title = blockTitleFromArg( 'name' );
			return `${ errorPrefix }Replaced with ${ title || 'block' }`;
		}
		case REMOVE_BLOCK_TOOL_NAME:
			return `${ errorPrefix }Removed block`;
		case MOVE_BLOCK_TOOL_NAME: {
			const dir = typeof args.direction === 'string' ? args.direction : null;
			if ( dir === 'up' ) {
				return `${ errorPrefix }Moved block up`;
			}
			if ( dir === 'down' ) {
				return `${ errorPrefix }Moved block down`;
			}
			if ( typeof args.to_index === 'number' ) {
				return `${ errorPrefix }Moved block`;
			}
			return `${ errorPrefix }Moved block`;
		}
		case SELECT_BLOCK_TOOL_NAME:
			return `${ errorPrefix }Selected block`;
		case FORMAT_TEXT_TOOL_NAME: {
			const fmt = typeof args.format === 'string' ? args.format : null;
			const verbs: Record< string, string > = {
				bold: 'Made bold',
				italic: 'Italicized',
				strikethrough: 'Struck through',
				code: 'Formatted as code',
				link: 'Linked',
				underline: 'Underlined',
				subscript: 'Made subscript',
				superscript: 'Made superscript',
			};
			return `${ errorPrefix }${ ( fmt && verbs[ fmt ] ) || 'Formatted text' }`;
		}
		case SET_POST_TITLE_TOOL_NAME:
			return `${ errorPrefix }Set post title`;
		case SAVE_POST_TOOL_NAME:
			return `${ errorPrefix }Saved draft`;
		case PUBLISH_POST_TOOL_NAME:
			return `${ errorPrefix }Published post`;
		case UNDO_TOOL_NAME:
			return `${ errorPrefix }Undid last change`;
		case REDO_TOOL_NAME:
			return `${ errorPrefix }Redid last change`;
		case VERIFY_YOUTUBE_URL_TOOL_NAME: {
			if ( ! ok ) {
				return "I couldn't find the right video.";
			}
			const title =
				isObjectResult && typeof ( result as { title?: unknown } ).title === 'string'
					? ( result as { title: string } ).title
					: null;
			return title ? `Verified YouTube URL: ${ title }` : 'Verified YouTube URL';
		}
		case PICK_IMAGE_TOOL_NAME: {
			const action = typeof args.action === 'string' ? args.action : '';
			if ( action === 'open' ) {
				return `${ errorPrefix }Opened image picker`;
			}
			if ( action === 'select' ) {
				const purpose = typeof args.purpose === 'string' ? args.purpose : '';
				if ( purpose === 'featured_image' ) {
					return `${ errorPrefix }Set featured image`;
				}
				return `${ errorPrefix }Inserted image`;
			}
			if ( action === 'close' ) {
				return 'Closed image picker';
			}
			if ( action === 'upload' ) {
				return `${ errorPrefix }Opened upload prompt`;
			}
			return `${ errorPrefix }Image picker`;
		}
		default:
			return null;
	}
}
const GET_USER_MEDIA_TIMEOUT_MS = 30_000;

interface FetchEphemeralKeyArgs {
	model: string;
	instructions: string;
}

function extractClientSecretValue( data: unknown ): string {
	const body = data as { client_secret?: { value?: string }; value?: string; token?: string };
	const value = body.client_secret?.value ?? body.value ?? body.token;
	return value ?? '';
}

async function fetchEphemeralKey( {
	model,
	instructions,
}: FetchEphemeralKeyArgs ): Promise< string > {
	const response = await wpcomRequest( {
		path: REALTIME_CLIENT_SECRETS_PATH,
		method: 'POST',
		apiNamespace: 'wpcom/v2',
		headers: {
			'X-WPCOM-AI-Feature': 'wpcom-dictation-tool',
		},
		body: {
			session: {
				type: 'realtime',
				model,
				instructions,
			},
		},
	} );
	return extractClientSecretValue( response );
}

/**
 * Manages an OpenAI Realtime API session over WebRTC. Microphone captures the
 * only user modality (speech); assistant turns stream as text (no synthesized
 * speech). Data-channel events carry transcripts and tool callbacks.
 */
export function useRealtimeSession( options: UseRealtimeSessionOptions ): UseRealtimeSessionResult {
	const { model = DEFAULT_MODEL, instructions } = options;

	const [ status, setStatus ] = useState< RealtimeStatus >( 'idle' );
	const [ error, setError ] = useState< string | null >( null );
	const [ isMuted, setIsMuted ] = useState( false );
	const [ transcript, setTranscript ] = useState< RealtimeTranscriptEntry[] >( [] );
	const [ toolEvents, setToolEvents ] = useState< RealtimeToolEvent[] >( [] );
	const [ imagePickerState, setImagePickerState ] = useState<
		import('./image-picker-modal').ImagePickerState
	>( {
		isOpen: false,
		images: [],
		selectedNumber: null,
		purpose: 'block',
	} );

	useEffect( () => {
		const onUpdate = () => {
			const s = window.__dictationImagePicker;
			if ( s ) {
				setImagePickerState( { ...s } );
			}
		};
		window.addEventListener( 'dictation-image-picker-update', onUpdate );
		return () => window.removeEventListener( 'dictation-image-picker-update', onUpdate );
	}, [] );

	const peerConnectionRef = useRef< RTCPeerConnection | null >( null );
	const dataChannelRef = useRef< RTCDataChannel | null >( null );
	const localStreamRef = useRef< MediaStream | null >( null );
	const transcriptCountRef = useRef( 0 );
	const toolEventsCountRef = useRef( 0 );
	const programmaticSendQueueRef = useRef< Promise< void > >( Promise.resolve() );
	// Tracks whether a response is currently being generated by the server.
	// Set on response.create send / response.created, cleared on response.done /
	// response.cancelled / response.failed. Used to gate response.create so we
	// don't trigger "Conversation already has an active response in progress".
	const activeResponseRef = useRef( false );
	// Set when safeCreateResponse() is called while activeResponseRef is true.
	// Drained when the active response ends.
	const pendingResponseCreateRef = useRef( false );

	const cleanup = useCallback( () => {
		activeResponseRef.current = false;
		pendingResponseCreateRef.current = false;
		programmaticSendQueueRef.current = Promise.resolve();

		try {
			dataChannelRef.current?.close();
		} catch {}
		dataChannelRef.current = null;

		try {
			peerConnectionRef.current?.getSenders().forEach( ( sender ) => {
				try {
					sender.track?.stop();
				} catch {}
			} );
			peerConnectionRef.current?.close();
		} catch {}
		peerConnectionRef.current = null;

		localStreamRef.current?.getTracks().forEach( ( track ) => track.stop() );
		localStreamRef.current = null;
	}, [] );

	useEffect( () => {
		return () => cleanup();
	}, [ cleanup ] );

	useEffect( () => {
		transcriptCountRef.current = transcript.length;
	}, [ transcript ] );

	useEffect( () => {
		toolEventsCountRef.current = toolEvents.length;
	}, [ toolEvents ] );

	/**
	 * Sends a response.create event, but only if no response is currently in
	 * flight. If one is, queues a single deferred send via
	 * pendingResponseCreateRef which gets drained when the active response ends.
	 * This prevents the "Conversation already has an active response in
	 * progress" error from racing tool-call follow-ups against server-VAD-driven
	 * responses.
	 */
	const safeCreateResponse = useCallback( () => {
		const dc = dataChannelRef.current;
		if ( ! dc || dc.readyState !== 'open' ) {
			return;
		}
		if ( activeResponseRef.current ) {
			pendingResponseCreateRef.current = true;
			return;
		}
		activeResponseRef.current = true;
		pendingResponseCreateRef.current = false;
		dc.send(
			JSON.stringify( {
				type: 'response.create',
				response: {
					output_modalities: [ 'text' ],
				},
			} )
		);
	}, [] );

	const flushPendingResponseCreate = useCallback( () => {
		if ( ! pendingResponseCreateRef.current ) {
			return;
		}
		pendingResponseCreateRef.current = false;
		safeCreateResponse();
	}, [ safeCreateResponse ] );

	const handleToolCalls = useCallback(
		async ( event: { response?: { output?: unknown[] } } ) => {
			const dc = dataChannelRef.current;
			if ( ! dc || dc.readyState !== 'open' ) {
				return;
			}

			const outputs = Array.isArray( event.response?.output ) ? event.response?.output : [];
			const functionCalls = outputs.filter(
				( item ): item is { type: string; name?: string; call_id?: string; arguments?: unknown } =>
					!! item &&
					typeof item === 'object' &&
					( item as { type?: string } ).type === 'function_call'
			);

			if ( ! functionCalls.length ) {
				return;
			}

			for ( const call of functionCalls ) {
				if ( ! call.call_id ) {
					continue;
				}

				let result: unknown;
				if ( call.name === GET_EDITOR_BLOCKS_TOOL_NAME ) {
					result = executeGetEditorBlocksTool( call.arguments );
				} else if ( call.name === GET_SELECTED_BLOCK_TOOL_NAME ) {
					result = executeGetSelectedBlockTool();
				} else if ( call.name === GET_INSERTER_ITEMS_TOOL_NAME ) {
					result = executeGetInserterItemsTool( call.arguments );
				} else if ( call.name === HAS_SELECTED_BLOCK_TOOL_NAME ) {
					result = executeHasSelectedBlockTool();
				} else if ( call.name === SELECT_BLOCK_TOOL_NAME ) {
					result = await executeSelectBlockTool( call.arguments );
				} else if ( call.name === GET_BLOCK_TYPES_TOOL_NAME ) {
					result = executeGetBlockTypesTool( call.arguments );
				} else if ( call.name === GET_BLOCK_TYPE_TOOL_NAME ) {
					result = executeGetBlockTypeTool( call.arguments );
				} else if ( call.name === INSERT_BLOCK_TOOL_NAME ) {
					result = await executeInsertBlockTool( call.arguments );
				} else if ( call.name === INSERT_BLOCKS_TOOL_NAME ) {
					result = await executeInsertBlocksTool( call.arguments );
				} else if ( call.name === UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME ) {
					result = await executeUpdateBlockAttributesTool( call.arguments );
				} else if ( call.name === REPLACE_BLOCK_TOOL_NAME ) {
					result = await executeReplaceBlockTool( call.arguments );
				} else if ( call.name === REMOVE_BLOCK_TOOL_NAME ) {
					result = await executeRemoveBlockTool( call.arguments );
				} else if ( call.name === MOVE_BLOCK_TOOL_NAME ) {
					result = await executeMoveBlockTool( call.arguments );
				} else if ( call.name === GET_BLOCK_TOOL_NAME ) {
					result = executeGetBlockTool( call.arguments );
				} else if ( call.name === FORMAT_TEXT_TOOL_NAME ) {
					result = await executeFormatTextTool( call.arguments );
				} else if ( call.name === SET_POST_TITLE_TOOL_NAME ) {
					result = await executeSetPostTitleTool( call.arguments );
				} else if ( call.name === SAVE_POST_TOOL_NAME ) {
					result = await executeSavePostTool( call.arguments );
				} else if ( call.name === PUBLISH_POST_TOOL_NAME ) {
					result = await executePublishPostTool();
				} else if ( call.name === UNDO_TOOL_NAME ) {
					result = await executeUndoTool();
				} else if ( call.name === REDO_TOOL_NAME ) {
					result = await executeRedoTool();
				} else if ( call.name === GET_POST_INFO_TOOL_NAME ) {
					result = executeGetPostInfoTool();
				} else if ( call.name === VERIFY_YOUTUBE_URL_TOOL_NAME ) {
					result = await executeVerifyYoutubeUrlTool( call.arguments );
				} else if ( call.name === PICK_IMAGE_TOOL_NAME ) {
					result = await executePickImageTool( call.arguments );
				} else {
					continue;
				}

				const label = describeToolCall( call.name, call.arguments, result );
				if ( label ) {
					const ok =
						!! result && typeof result === 'object' && ( result as { ok?: boolean } ).ok !== false;
					setToolEvents( ( prev ) => {
						const next = prev.concat( {
							id: call.call_id ?? `${ Date.now() }-${ Math.random().toString( 36 ).slice( 2, 7 ) }`,
							label,
							status: ok ? 'done' : 'error',
							timestamp: Date.now(),
						} );
						return next.length > MAX_TOOL_EVENTS
							? next.slice( next.length - MAX_TOOL_EVENTS )
							: next;
					} );
				}

				dc.send(
					JSON.stringify( {
						type: 'conversation.item.create',
						item: {
							type: 'function_call_output',
							call_id: call.call_id,
							output: JSON.stringify( result ),
						},
					} )
				);
			}

			safeCreateResponse();
		},
		[ safeCreateResponse ]
	);

	const handleServerEvent = useCallback(
		( event: unknown ) => {
			if ( ! event || typeof event !== 'object' ) {
				return;
			}
			const evt = event as { type?: string; [ key: string ]: unknown };

			switch ( evt.type ) {
				case 'conversation.item.input_audio_transcription.delta':
				case 'conversation.item.input_audio_transcription.completed': {
					const itemId = ( evt.item_id as string ) || 'user-latest';
					const delta = ( evt.delta as string ) || ( evt.transcript as string ) || '';
					const isFinal = evt.type.endsWith( 'completed' );
					setTranscript( ( prev ) => upsertEntry( prev, itemId, 'user', delta, isFinal ) );
					break;
				}
				case 'response.text.delta':
				case 'response.output_text.delta':
				case 'response.audio_transcript.delta':
				case 'response.output_audio_transcript.delta':
				case 'response.text.done':
				case 'response.output_text.done':
				case 'response.audio_transcript.done':
				case 'response.output_audio_transcript.done': {
					const itemId = assistantTurnEntryId( evt as Record< string, unknown > );
					const isDone =
						evt.type === 'response.text.done' ||
						evt.type === 'response.output_text.done' ||
						evt.type === 'response.audio_transcript.done' ||
						evt.type === 'response.output_audio_transcript.done';
					let delta = '';
					if ( isDone ) {
						if ( typeof evt.text === 'string' ) {
							delta = evt.text;
						} else if ( typeof evt.transcript === 'string' ) {
							delta = evt.transcript;
						}
					} else if ( typeof evt.delta === 'string' ) {
						delta = evt.delta;
					}
					setTranscript( ( prev ) => upsertEntry( prev, itemId, 'assistant', delta, isDone ) );
					break;
				}
				case 'response.created': {
					activeResponseRef.current = true;
					break;
				}
				case 'response.done':
				case 'response.cancelled':
				case 'response.failed': {
					activeResponseRef.current = false;
					if ( evt.type === 'response.done' ) {
						void handleToolCalls( evt as { response?: { output?: unknown[] } } );
					}
					flushPendingResponseCreate();
					break;
				}
				case 'error': {
					const errorObj = evt.error as { code?: string; message?: string } | undefined;
					const message = errorObj?.message || 'Realtime session error';
					// Treat the "active response in progress" race as benign: the server
					// already has a response running (typically because server VAD started
					// one from the user's audio mid-tool-call). Mark active and queue ours
					// so it fires when that response ends.
					const isActiveResponseConflict =
						errorObj?.code === 'conversation_already_has_active_response' ||
						/already\s+has\s+an?\s+active\s+response/i.test( message );
					if ( isActiveResponseConflict ) {
						activeResponseRef.current = true;
						pendingResponseCreateRef.current = true;
						break;
					}
					setError( message );
					setStatus( 'error' );
					break;
				}
				default:
					break;
			}
		},
		[ flushPendingResponseCreate, handleToolCalls ]
	);

	const start = useCallback( async () => {
		if (
			status === 'active' ||
			status === 'connecting' ||
			status === 'requesting-token' ||
			status === 'requesting-mic'
		) {
			return;
		}

		setError( null );
		setTranscript( [] );
		setToolEvents( [] );

		try {
			// Check mic permission before prompting so we can fail fast if denied.
			if ( navigator.permissions ) {
				try {
					const permissionStatus = await navigator.permissions.query( {
						name: 'microphone' as PermissionName,
					} );
					if ( permissionStatus.state === 'denied' ) {
						throw new Error(
							'Microphone access is blocked. Please allow microphone access in your browser settings and try again.'
						);
					}
				} catch ( permErr ) {
					throw new Error(
						'Microphone access is blocked. Please allow microphone access in your browser settings and try again.'
					);
				}
			}

			setStatus( 'requesting-token' );
			const ephemeralKey = await fetchEphemeralKey( {
				model,
				instructions,
			} );

			setStatus( 'requesting-mic' );
			const localStream = await Promise.race( [
				navigator.mediaDevices.getUserMedia( { audio: true } ),
				new Promise< never >( ( _, reject ) =>
					setTimeout(
						() =>
							reject(
								new Error(
									'Microphone request timed out. Check for a browser permission prompt near the address bar.'
								)
							),
						GET_USER_MEDIA_TIMEOUT_MS
					)
				),
			] );
			localStreamRef.current = localStream;

			setStatus( 'connecting' );
			const pc = new RTCPeerConnection();
			peerConnectionRef.current = pc;

			localStream.getTracks().forEach( ( track ) => pc.addTrack( track, localStream ) );

			const dataChannel = pc.createDataChannel( 'oai-events' );
			dataChannelRef.current = dataChannel;

			dataChannel.addEventListener( 'open', () => {
				setStatus( 'active' );
				dataChannel.send(
					JSON.stringify( {
						type: 'session.update',
						session: {
							type: 'realtime',
							output_modalities: [ 'text' ],
							instructions,
							tools: [
								getEditorBlocksToolDefinition,
								getSelectedBlockToolDefinition,
								getInserterItemsToolDefinition,
								hasSelectedBlockToolDefinition,
								selectBlockToolDefinition,
								getBlockTypesToolDefinition,
								getBlockTypeToolDefinition,
								insertBlockToolDefinition,
								insertBlocksToolDefinition,
								updateBlockAttributesToolDefinition,
								replaceBlockToolDefinition,
								removeBlockToolDefinition,
								moveBlockToolDefinition,
								getBlockToolDefinition,
								formatTextToolDefinition,
								setPostTitleToolDefinition,
								savePostToolDefinition,
								publishPostToolDefinition,
								undoToolDefinition,
								redoToolDefinition,
								getPostInfoToolDefinition,
								verifyYoutubeUrlToolDefinition,
								pickImageToolDefinition,
							],
							tool_choice: 'auto',
							audio: {
								input: {
									transcription: { model: 'whisper-1' },
									turn_detection: { type: 'server_vad' },
								},
							},
						},
					} )
				);
			} );

			dataChannel.addEventListener( 'message', ( event ) => {
				try {
					handleServerEvent( JSON.parse( event.data ) );
				} catch {
					// Non-JSON events are ignored.
				}
			} );

			dataChannel.addEventListener( 'close', () => {
				setStatus( ( prev ) => ( prev === 'error' ? prev : 'idle' ) );
			} );

			pc.addEventListener( 'connectionstatechange', () => {
				if (
					pc.connectionState === 'failed' ||
					pc.connectionState === 'disconnected' ||
					pc.connectionState === 'closed'
				) {
					setStatus( ( prev ) => ( prev === 'error' ? prev : 'idle' ) );
				}
			} );

			const offer = await pc.createOffer();
			await pc.setLocalDescription( offer );

			const sdpResponse = await fetch(
				`${ OPENAI_REALTIME_URL }?model=${ encodeURIComponent( model ) }`,
				{
					method: 'POST',
					body: offer.sdp,
					headers: {
						Authorization: `Bearer ${ ephemeralKey }`,
						'Content-Type': 'application/sdp',
					},
				}
			);

			if ( ! sdpResponse.ok ) {
				const errText = await sdpResponse.text().catch( () => '' );
				let detail = errText;
				try {
					detail = JSON.parse( errText )?.error?.message ?? errText;
				} catch {}
				throw new Error(
					`Realtime SDP exchange failed (${ sdpResponse.status })${ detail ? ': ' + detail : '' }`
				);
			}

			const answerSdp = await sdpResponse.text();
			await pc.setRemoteDescription( { type: 'answer', sdp: answerSdp } );
		} catch ( err ) {
			const message = err instanceof Error ? err.message : 'Unknown error starting session';
			setError( message );
			setStatus( 'error' );
			cleanup();
		}
	}, [ cleanup, handleServerEvent, instructions, model, status ] );

	const stop = useCallback( () => {
		setStatus( 'ending' );
		cleanup();
		setStatus( 'idle' );
	}, [ cleanup ] );

	const toggleMute = useCallback( () => {
		const stream = localStreamRef.current;
		if ( ! stream ) {
			return;
		}
		const nextMuted = ! isMuted;
		stream.getAudioTracks().forEach( ( track ) => {
			track.enabled = ! nextMuted;
		} );
		setIsMuted( nextMuted );
	}, [ isMuted ] );

	/**
	 * Programmatic user text (dev / testing). Normal UX is voice-only; the UI
	 * does not surface this. Uses the same Realtime channel as typed input.
	 */
	const sendText = useCallback(
		( text: string ): Promise< void > => {
			const trimmed = typeof text === 'string' ? text.trim() : '';
			if ( ! trimmed.length ) {
				return Promise.resolve();
			}

			const run = async () => {
				const dc = dataChannelRef.current;
				if ( ! dc || dc.readyState !== 'open' ) {
					// eslint-disable-next-line no-console -- TEMPORARY dev hook
					console.warn(
						'[sendToDictation] No open realtime data channel (start dictation first).'
					);
					return;
				}

				const startTranscriptCount = transcriptCountRef.current;
				const startToolEventsCount = toolEventsCountRef.current;

				const itemId = `programmatic-user-${ Date.now() }`;
				setTranscript( ( prev ) => upsertEntry( prev, itemId, 'user', trimmed, true ) );

				dc.send(
					JSON.stringify( {
						type: 'conversation.item.create',
						item: {
							type: 'message',
							role: 'user',
							content: [ { type: 'input_text', text: trimmed } ],
						},
					} )
				);
				safeCreateResponse();

				await new Promise< void >( ( resolve ) => {
					const startedAt = Date.now();
					const poll = () => {
						const timedOut = Date.now() - startedAt >= PROGRAMMATIC_SEND_TIMEOUT_MS;
						const hasProgress =
							transcriptCountRef.current > startTranscriptCount ||
							toolEventsCountRef.current > startToolEventsCount;
						const isSettled = ! activeResponseRef.current && ! pendingResponseCreateRef.current;
						if ( timedOut || ( hasProgress && isSettled ) ) {
							resolve();
							return;
						}
						window.setTimeout( poll, 100 );
					};
					poll();
				} );
			};

			const queued = programmaticSendQueueRef.current.then( run );
			programmaticSendQueueRef.current = queued.catch( () => undefined );
			return queued;
		},
		[ safeCreateResponse ]
	);

	const sendEvent = useCallback( ( eventName: string, details?: string ) => {
		void eventName;
		void details;
	}, [] );

	useEffect( () => {
		const fn: ( text: string ) => Promise< void > = ( text ) => {
			return sendText( text );
		};
		window.sendToDictation = fn;
		return () => {
			if ( window.sendToDictation === fn ) {
				delete window.sendToDictation;
			}
		};
	}, [ sendText ] );

	return {
		status,
		error,
		isMuted,
		transcript,
		toolEvents,
		imagePickerState,
		start,
		stop,
		toggleMute,
		sendText,
		sendEvent,
	};
}

function upsertEntry(
	prev: RealtimeTranscriptEntry[],
	id: string,
	role: RealtimeTranscriptEntry[ 'role' ],
	delta: string,
	isFinal: boolean
): RealtimeTranscriptEntry[] {
	const existingIndex = prev.findIndex( ( entry ) => entry.id === id );
	if ( existingIndex === -1 ) {
		const timestamp = Date.now();
		return [ ...prev, { id, role, text: delta, isFinal, timestamp } ];
	}
	const updated = [ ...prev ];
	const existing = updated[ existingIndex ];
	updated[ existingIndex ] = {
		...existing,
		text: isFinal && delta ? delta : existing.text + delta,
		isFinal: isFinal || existing.isFinal,
	};
	return updated;
}
