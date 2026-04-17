import { useCallback, useEffect, useRef, useState } from 'react';

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
	isSharingScreen: boolean;
	transcript: RealtimeTranscriptEntry[];
	start: () => Promise< void >;
	stop: () => void;
	toggleMute: () => void;
	toggleScreenShare: () => Promise< void >;
	sendText: ( text: string ) => void;
}

const DEFAULT_MODEL = 'gpt-realtime';
const DEFAULT_VOICE = 'alloy';
const DEFAULT_TOKEN_ENDPOINT = '/openai/realtime-token';
const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';

// Interval between screen-capture frames sent to the model, in ms.
const SCREEN_FRAME_INTERVAL_MS = 3000;
// Max dimension (width or height) for screen frames before sending, to keep payloads small.
const SCREEN_FRAME_MAX_DIMENSION = 1024;
// JPEG quality for screen frames (0–1).
const SCREEN_FRAME_JPEG_QUALITY = 0.7;

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
	const [ isSharingScreen, setIsSharingScreen ] = useState( false );
	const [ transcript, setTranscript ] = useState< RealtimeTranscriptEntry[] >( [] );

	const peerConnectionRef = useRef< RTCPeerConnection | null >( null );
	const dataChannelRef = useRef< RTCDataChannel | null >( null );
	const localStreamRef = useRef< MediaStream | null >( null );
	const audioElementRef = useRef< HTMLAudioElement | null >( null );
	const screenStreamRef = useRef< MediaStream | null >( null );
	const screenVideoRef = useRef< HTMLVideoElement | null >( null );
	const screenIntervalRef = useRef< number | null >( null );

	const stopScreenShare = useCallback( () => {
		if ( screenIntervalRef.current !== null ) {
			window.clearInterval( screenIntervalRef.current );
			screenIntervalRef.current = null;
		}
		screenStreamRef.current?.getTracks().forEach( ( track ) => track.stop() );
		screenStreamRef.current = null;
		if ( screenVideoRef.current ) {
			try {
				screenVideoRef.current.pause();
				screenVideoRef.current.srcObject = null;
			} catch {}
			screenVideoRef.current = null;
		}
		setIsSharingScreen( false );
	}, [] );

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

	const handleServerEvent = useCallback( ( event: unknown ) => {
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
	}, [] );

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
				// Kick things off with a friendly greeting.
				dataChannel.send(
					JSON.stringify( {
						type: 'response.create',
						response: {
							instructions:
								'Greet the user warmly, introduce yourself as the WordPress.com sign-up assistant, and ask how you can help them get started.',
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

	const captureAndSendFrame = useCallback( () => {
		const dc = dataChannelRef.current;
		const video = screenVideoRef.current;
		if ( ! dc || dc.readyState !== 'open' || ! video ) {
			return;
		}
		const { videoWidth, videoHeight } = video;
		if ( ! videoWidth || ! videoHeight ) {
			return;
		}

		const scale = Math.min( 1, SCREEN_FRAME_MAX_DIMENSION / Math.max( videoWidth, videoHeight ) );
		const canvas = document.createElement( 'canvas' );
		canvas.width = Math.max( 1, Math.round( videoWidth * scale ) );
		canvas.height = Math.max( 1, Math.round( videoHeight * scale ) );
		const ctx = canvas.getContext( '2d' );
		if ( ! ctx ) {
			return;
		}
		ctx.drawImage( video, 0, 0, canvas.width, canvas.height );
		const dataUrl = canvas.toDataURL( 'image/jpeg', SCREEN_FRAME_JPEG_QUALITY );

		try {
			dc.send(
				JSON.stringify( {
					type: 'conversation.item.create',
					item: {
						type: 'message',
						role: 'user',
						content: [
							{
								type: 'input_image',
								image_url: dataUrl,
							},
						],
					},
				} )
			);
		} catch {
			// Data channel may have closed between the readyState check and send.
		}
	}, [] );

	const startScreenShare = useCallback( async () => {
		if ( screenStreamRef.current ) {
			return;
		}
		const dc = dataChannelRef.current;
		if ( ! dc || dc.readyState !== 'open' ) {
			throw new Error( 'Start the call before sharing your screen.' );
		}

		const stream = await navigator.mediaDevices.getDisplayMedia( {
			video: {
				frameRate: 1,
				displaySurface: 'browser',
			},
			audio: false,
			// @ts-ignore - selfBrowserSurface is not a valid option for getDisplayMedia
			selfBrowserSurface: 'include',
			monitorTypeSurfaces: 'exclude',
			surfaceSwitching: 'exclude',
		} );
		screenStreamRef.current = stream;

		const [ videoTrack ] = stream.getVideoTracks();
		videoTrack?.addEventListener( 'ended', () => stopScreenShare() );

		const video = document.createElement( 'video' );
		video.muted = true;
		video.playsInline = true;
		video.srcObject = stream;
		screenVideoRef.current = video;
		try {
			await video.play();
		} catch {
			// Some browsers resolve play() late; the first interval tick will still capture once metadata is ready.
		}

		try {
			dc.send(
				JSON.stringify( {
					type: 'session.update',
					session: {
						type: 'realtime',
						instructions:
							( instructions || '' ) +
							' The user is now sharing their screen. They will periodically send you screenshots of what they see. Use them to give specific guidance about the current page, and acknowledge changes when you notice them.',
					},
				} )
			);
		} catch {}

		setIsSharingScreen( true );
		// Capture one frame almost immediately, then settle into the interval.
		window.setTimeout( captureAndSendFrame, 100 );
		screenIntervalRef.current = window.setInterval( captureAndSendFrame, SCREEN_FRAME_INTERVAL_MS );
	}, [ captureAndSendFrame, instructions, stopScreenShare ] );

	const toggleScreenShare = useCallback( async () => {
		if ( isSharingScreen ) {
			stopScreenShare();
			return;
		}
		try {
			await startScreenShare();
		} catch ( err ) {
			// Ignore user-cancelled permission dialogs; surface real errors.
			const name = ( err as { name?: string } )?.name;
			if ( name !== 'NotAllowedError' && name !== 'AbortError' ) {
				const message = err instanceof Error ? err.message : 'Could not start screen sharing';
				setError( message );
			}
			stopScreenShare();
		}
	}, [ isSharingScreen, startScreenShare, stopScreenShare ] );

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

	return {
		status,
		error,
		isMuted,
		isSharingScreen,
		transcript,
		start,
		stop,
		toggleMute,
		toggleScreenShare,
		sendText,
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
