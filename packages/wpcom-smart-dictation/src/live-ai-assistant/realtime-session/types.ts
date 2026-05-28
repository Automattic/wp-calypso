export type RealtimeStatus =
	| 'idle'
	| 'requesting-token'
	| 'requesting-mic'
	| 'connecting'
	| 'active'
	| 'error';

export type RealtimeErrorIntent = 'error' | 'warning';

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
	status: 'running' | 'done' | 'error';
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

export interface UseRealtimeSessionResult {
	status: RealtimeStatus;
	error: string | null;
	errorIntent: RealtimeErrorIntent;
	sessionTimeLimitMs: number | null;
	sessionTimeRemainingMs: number | null;
	canUpgrade: boolean;
	isMuted: boolean;
	localStream: MediaStream | null;
	transcript: RealtimeTranscriptEntry[];
	toolEvents: RealtimeToolEvent[];
	imagePickerState: import('../image-picker-modal').ImagePickerState;
	start: () => Promise< void >;
	stop: ( reason?: string ) => void;
	toggleMute: () => void;
	sendText: ( text: string ) => Promise< void >;
	sendEvent: ( eventName: string, details?: string ) => void;
}
