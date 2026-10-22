const soundCooldownMs = 3000;
const soundDurationSeconds = 0.4;

export type NotificationSoundResult =
	| 'played'
	| 'disposed'
	| 'hidden'
	| 'cooldown'
	| 'not_activated'
	| 'unsupported'
	| 'create_failed'
	| 'failed';

export type NotificationSoundErrorStage = 'create' | 'resume' | 'play' | 'close';

export type NotificationSoundOptions = {
	onError?: ( error: unknown, stage: NotificationSoundErrorStage ) => void;
};

export function createNotificationSound( { onError }: NotificationSoundOptions = {} ) {
	let audioContext: AudioContext | undefined;
	let lastPlayedAt: number | undefined;
	let disposed = false;
	let unavailableReason: 'unsupported' | 'create_failed' | undefined;

	function reportError( error: unknown, stage: NotificationSoundErrorStage ) {
		try {
			onError?.( error, stage );
		} catch {
			// A throwing reporter must not break the notification flow.
		}
	}

	// Either call can throw synchronously as well as reject.
	function settle( run: () => Promise< void > | void, stage: NotificationSoundErrorStage ) {
		try {
			Promise.resolve( run() ).catch( ( error ) => reportError( error, stage ) );
		} catch ( error ) {
			reportError( error, stage );
		}
	}

	function removeGestureListeners() {
		document.removeEventListener( 'pointerdown', activateAudio );
		document.removeEventListener( 'keydown', activateAudio );
	}

	function activateAudio() {
		if ( disposed || document.hidden ) {
			return;
		}

		const AudioContextConstructor =
			window.AudioContext ??
			( window as Window & { webkitAudioContext?: typeof AudioContext } ).webkitAudioContext;
		if ( ! AudioContextConstructor ) {
			unavailableReason = 'unsupported';
			removeGestureListeners();
			return;
		}

		try {
			audioContext ??= new AudioContextConstructor();
		} catch ( error ) {
			unavailableReason = 'create_failed';
			removeGestureListeners();
			reportError( error, 'create' );
			return;
		}

		const context = audioContext;
		settle( () => context.resume(), 'resume' );
		removeGestureListeners();
	}

	document.addEventListener( 'pointerdown', activateAudio );
	document.addEventListener( 'keydown', activateAudio );

	return {
		play(): NotificationSoundResult {
			if ( disposed ) {
				return 'disposed';
			}
			if ( document.hidden ) {
				return 'hidden';
			}
			if ( unavailableReason ) {
				return unavailableReason;
			}
			if ( ! audioContext ) {
				return 'not_activated';
			}

			const now = Date.now();
			if ( lastPlayedAt !== undefined && now - lastPlayedAt < soundCooldownMs ) {
				return 'cooldown';
			}
			lastPlayedAt = now;

			try {
				const oscillator = audioContext.createOscillator();
				const gain = audioContext.createGain();
				oscillator.type = 'sine';
				oscillator.frequency.setValueAtTime( 660, audioContext.currentTime );
				gain.gain.setValueAtTime( 0.2, audioContext.currentTime );
				gain.gain.exponentialRampToValueAtTime(
					0.001,
					audioContext.currentTime + soundDurationSeconds
				);
				oscillator.connect( gain );
				gain.connect( audioContext.destination );
				oscillator.start();
				oscillator.stop( audioContext.currentTime + soundDurationSeconds );
			} catch ( error ) {
				reportError( error, 'play' );
				return 'failed';
			}

			return 'played';
		},
		dispose() {
			if ( disposed ) {
				return;
			}
			disposed = true;
			removeGestureListeners();
			if ( audioContext && audioContext.state !== 'closed' ) {
				const context = audioContext;
				settle( () => context.close(), 'close' );
			}
		},
	};
}
