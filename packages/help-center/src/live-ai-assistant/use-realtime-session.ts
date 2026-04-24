import { useCallback, useEffect, useRef, useState } from 'react';
import {
	HIGHLIGHT_TOOL_NAME,
	highlightToolDefinition,
	executeHighlightTool,
} from './tools/highlight-tool';
import {
	PAGE_SUMMARY_TOOL_NAME,
	pageSummaryToolDefinition,
	executePageSummaryTool,
} from './tools/page-summary-tool';
import {
	POINTED_ELEMENT_TOOL_NAME,
	pointedElementToolDefinition,
	executePointedElementTool,
} from './tools/pointed-element-tool';
import type { PageSummaryMetadata, PointerPosition } from './tools/shared';

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
}

export interface UseRealtimeSessionOptions {
	/**
	 * Model to use for the Realtime session.
	 */
	model?: string;
	/**
	 * Voice to use for the assistant's audio output.
	 */
	voice?: string;
	/**
	 * System instructions for the assistant.
	 */
	instructions: string;
	/**
	 * Endpoint that mints a short-lived client_secret for the Realtime API.
	 * Must respond with `{ client_secret: { value: string } }` (OpenAI shape) or
	 * `{ value: string }`. If not provided the hook will look for a developer
	 * ephemeral key in `localStorage.wp_openai_realtime_key` (useful for local testing).
	 */
	tokenEndpoint?: string;
}

interface UseRealtimeSessionResult {
	status: RealtimeStatus;
	error: string | null;
	isMuted: boolean;
	transcript: RealtimeTranscriptEntry[];
	start: () => Promise< void >;
	stop: () => void;
	toggleMute: () => void;
	sendText: ( text: string ) => void;
	sendEvent: ( eventName: string, details?: string ) => void;
	updatePointerPosition: ( x: number, y: number ) => void;
}

const DEFAULT_MODEL = 'gpt-realtime';
const DEFAULT_VOICE = 'alloy';
const DEFAULT_TOKEN_ENDPOINT = '/openai/realtime-token';
const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';
const POINTER_HINT_DURATION_MS = 4000;

interface FetchEphemeralKeyArgs {
	tokenEndpoint: string;
	model: string;
	voice: string;
	instructions: string;
}

async function fetchEphemeralKey( {
	tokenEndpoint,
	model,
	voice,
	instructions,
}: FetchEphemeralKeyArgs ): Promise< string > {
	try {
		const response = await fetch( tokenEndpoint, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { model, voice, instructions } ),
		} );
		if ( response.ok ) {
			const data = await response.json();
			const value = data?.client_secret?.value ?? data?.value ?? data?.token;
			if ( typeof value === 'string' && value.length ) {
				return value;
			}
		}
	} catch {
		// Fall through to the dev-key fallback below.
	}

	// Developer fallback: a pasted ephemeral key, handy when running outside the Calypso dev server.
	if ( typeof window !== 'undefined' ) {
		const devKey = window.localStorage?.getItem( 'wp_openai_realtime_key' );
		if ( devKey ) {
			return devKey;
		}
	}

	throw new Error(
		'Could not obtain an OpenAI Realtime client secret. Make sure the Calypso dev server is running with OPENAI_API_KEY set in .env, or paste a key into localStorage.wp_openai_realtime_key.'
	);
}

/**
 * Manages an OpenAI Realtime API session over WebRTC. Handles microphone capture,
 * remote audio playback, data-channel events, and exposes a small React-friendly
 * surface (status, transcript, controls).
 */
export function useRealtimeSession( options: UseRealtimeSessionOptions ): UseRealtimeSessionResult {
	const {
		model = DEFAULT_MODEL,
		voice = DEFAULT_VOICE,
		instructions,
		tokenEndpoint = DEFAULT_TOKEN_ENDPOINT,
	} = options;

	const [ status, setStatus ] = useState< RealtimeStatus >( 'idle' );
	const [ error, setError ] = useState< string | null >( null );
	const [ isMuted, setIsMuted ] = useState( false );
	const [ transcript, setTranscript ] = useState< RealtimeTranscriptEntry[] >( [] );

	const peerConnectionRef = useRef< RTCPeerConnection | null >( null );
	const dataChannelRef = useRef< RTCDataChannel | null >( null );
	const localStreamRef = useRef< MediaStream | null >( null );
	const audioElementRef = useRef< HTMLAudioElement | null >( null );
	const lastPageSummaryRef = useRef< PageSummaryMetadata | null >( null );
	const pointerPositionRef = useRef< PointerPosition | null >( null );
	const hasPageSummaryRef = useRef( false );
	const highlightOverlayRef = useRef< HTMLDivElement | null >( null );
	const highlightOverlayTimeoutRef = useRef< number | null >( null );

	const clearHighlightOverlay = useCallback( () => {
		if ( highlightOverlayTimeoutRef.current !== null ) {
			window.clearTimeout( highlightOverlayTimeoutRef.current );
			highlightOverlayTimeoutRef.current = null;
		}
		if ( highlightOverlayRef.current ) {
			highlightOverlayRef.current.remove();
			highlightOverlayRef.current = null;
		}
	}, [] );

	const stopScreenShare = useCallback( () => {
		clearHighlightOverlay();
		lastPageSummaryRef.current = null;
		pointerPositionRef.current = null;
		hasPageSummaryRef.current = false;
	}, [ clearHighlightOverlay ] );

	const cleanup = useCallback( () => {
		stopScreenShare();

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

		if ( audioElementRef.current ) {
			try {
				audioElementRef.current.pause();
				audioElementRef.current.srcObject = null;
				audioElementRef.current.remove();
			} catch {}
			audioElementRef.current = null;
		}
	}, [ stopScreenShare ] );

	useEffect( () => {
		return () => cleanup();
	}, [ cleanup ] );

	const getToolRuntimeContext = useCallback(
		() => ( {
			isPageContextEnabled: hasPageSummaryRef.current,
			lastPageSummary: lastPageSummaryRef.current,
			pointerPosition: pointerPositionRef.current,
		} ),
		[]
	);

	const setPageSummaryMetadata = useCallback( ( metadata: PageSummaryMetadata ) => {
		lastPageSummaryRef.current = metadata;
		hasPageSummaryRef.current = true;
	}, [] );

	const showHighlightOverlay = useCallback(
		( target: HTMLElement ) => {
			clearHighlightOverlay();

			const rect = target.getBoundingClientRect();
			const padding = 6;
			const overlay = document.createElement( 'div' );
			overlay.setAttribute( 'aria-hidden', 'true' );
			overlay.style.position = 'fixed';
			overlay.style.left = `${ Math.max( 0, rect.left - padding ) }px`;
			overlay.style.top = `${ Math.max( 0, rect.top - padding ) }px`;
			overlay.style.width = `${ Math.max( 12, rect.width + padding * 2 ) }px`;
			overlay.style.height = `${ Math.max( 12, rect.height + padding * 2 ) }px`;
			overlay.style.border = '4px solid #d63638';
			overlay.style.borderRadius = '10px';
			overlay.style.background = 'rgba(214, 54, 56, 0.08)';
			overlay.style.boxShadow = '0 0 0 10px rgba(214, 54, 56, 0.12)';
			overlay.style.pointerEvents = 'none';
			overlay.style.zIndex = '2147483647';
			overlay.style.transition = 'opacity 0.2s ease';
			document.body.appendChild( overlay );
			highlightOverlayRef.current = overlay;
			highlightOverlayTimeoutRef.current = window.setTimeout( () => {
				clearHighlightOverlay();
			}, POINTER_HINT_DURATION_MS );
		},
		[ clearHighlightOverlay ]
	);

	const handleToolCalls = useCallback(
		( event: { response?: { output?: unknown[] } } ) => {
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
				if ( call.name === PAGE_SUMMARY_TOOL_NAME ) {
					result = executePageSummaryTool( call.arguments, {
						setPageSummaryMetadata,
					} );
				} else if ( call.name === POINTED_ELEMENT_TOOL_NAME ) {
					result = executePointedElementTool( call.arguments, {
						pointerPosition: pointerPositionRef.current,
					} );
				} else if ( call.name === HIGHLIGHT_TOOL_NAME ) {
					result = executeHighlightTool( call.arguments, {
						...getToolRuntimeContext(),
						showHighlight: showHighlightOverlay,
					} );
				} else {
					continue;
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

			dc.send( JSON.stringify( { type: 'response.create' } ) );
		},
		[ getToolRuntimeContext, setPageSummaryMetadata, showHighlightOverlay ]
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
				case 'response.audio_transcript.delta':
				case 'response.output_audio_transcript.delta':
				case 'response.audio_transcript.done':
				case 'response.output_audio_transcript.done': {
					const itemId =
						( evt.item_id as string ) || ( evt.response_id as string ) || 'assistant-latest';
					const delta = ( evt.delta as string ) || ( evt.transcript as string ) || '';
					const isFinal = evt.type.endsWith( 'done' );
					setTranscript( ( prev ) => upsertEntry( prev, itemId, 'assistant', delta, isFinal ) );
					break;
				}
				case 'response.done': {
					handleToolCalls( evt as { response?: { output?: unknown[] } } );
					break;
				}
				case 'error': {
					const message =
						( evt.error as { message?: string } | undefined )?.message || 'Realtime session error';
					setError( message );
					setStatus( 'error' );
					break;
				}
				default:
					break;
			}
		},
		[ handleToolCalls ]
	);

	const start = useCallback( async () => {
		if ( status === 'active' || status === 'connecting' || status === 'requesting-token' ) {
			return;
		}

		setError( null );
		setTranscript( [] );

		try {
			setStatus( 'requesting-token' );
			const ephemeralKey = await fetchEphemeralKey( {
				tokenEndpoint,
				model,
				voice,
				instructions,
			} );

			setStatus( 'requesting-mic' );
			const localStream = await navigator.mediaDevices.getUserMedia( { audio: true } );
			localStreamRef.current = localStream;

			setStatus( 'connecting' );
			const pc = new RTCPeerConnection();
			peerConnectionRef.current = pc;

			const audioEl = document.createElement( 'audio' );
			audioEl.autoplay = true;
			audioElementRef.current = audioEl;
			pc.ontrack = ( event ) => {
				if ( audioElementRef.current ) {
					audioElementRef.current.srcObject = event.streams[ 0 ];
				}
			};

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
							instructions,
							tools: [
								pageSummaryToolDefinition,
								pointedElementToolDefinition,
								highlightToolDefinition,
							],
							tool_choice: 'auto',
							audio: {
								input: {
									transcription: { model: 'whisper-1' },
									turn_detection: { type: 'server_vad' },
								},
								output: { voice },
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
	}, [ cleanup, handleServerEvent, instructions, model, status, tokenEndpoint, voice ] );

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

	const sendText = useCallback( ( text: string ) => {
		const dc = dataChannelRef.current;
		if ( ! dc || dc.readyState !== 'open' || ! text.trim() ) {
			return;
		}
		dc.send(
			JSON.stringify( {
				type: 'conversation.item.create',
				item: {
					type: 'message',
					role: 'user',
					content: [ { type: 'input_text', text } ],
				},
			} )
		);
		dc.send( JSON.stringify( { type: 'response.create' } ) );
	}, [] );

	const sendEvent = useCallback( ( eventName: string, details?: string ) => {
		const dc = dataChannelRef.current;
		if ( ! dc || dc.readyState !== 'open' || ! eventName.trim() ) {
			return;
		}

		const text = [
			`Context event: ${ eventName.trim() }.`,
			details?.trim(),
			'Do not respond unless the user explicitly asks for help or asks you to act.',
		]
			.filter( Boolean )
			.join( ' ' );

		dc.send(
			JSON.stringify( {
				type: 'conversation.item.create',
				item: {
					type: 'message',
					role: 'user',
					content: [ { type: 'input_text', text } ],
				},
			} )
		);
	}, [] );

	const updatePointerPosition = useCallback( ( x: number, y: number ) => {
		if ( ! Number.isFinite( x ) || ! Number.isFinite( y ) ) {
			return;
		}

		pointerPositionRef.current = {
			x: Math.max( 0, Math.round( x ) ),
			y: Math.max( 0, Math.round( y ) ),
		};
	}, [] );

	return {
		status,
		error,
		isMuted,
		transcript,
		start,
		stop,
		toggleMute,
		sendText,
		sendEvent,
		updatePointerPosition,
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
		return [ ...prev, { id, role, text: delta, isFinal } ];
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
