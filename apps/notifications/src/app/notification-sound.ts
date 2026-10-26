const soundCooldownMs = 3000;
const soundDurationSeconds = 0.4;
const resumeTimeoutMs = 1000;

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

// True once the person has clicked or typed anywhere on the page, even before this code loaded.
// Browsers let audio start after that, and a touch `pointerdown` alone does not count.
function hasBeenActivated() {
	return navigator.userActivation?.hasBeenActive === true;
}

export function createNotificationSound( { onError }: NotificationSoundOptions = {} ) {
	let audioContext: AudioContext | undefined;
	let lastPlayedAt: number | undefined;
	let disposed = false;
	let unavailableReason: 'unsupported' | 'create_failed' | undefined;
	let resuming: Promise< void > | undefined;

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
		let resume: Promise< void >;
		try {
			resume = context.resume();
		} catch ( error ) {
			reportError( error, 'resume' );
			return;
		}
		// Safari needs a fresh gesture to start audio, so keep listening until it runs.
		resuming = resume.then(
			() => {
				if ( context.state === 'running' ) {
					removeGestureListeners();
				}
			},
			( error ) => reportError( error, 'resume' )
		);
	}

	function playTone( context: AudioContext ): NotificationSoundResult {
		try {
			const oscillator = context.createOscillator();
			const gain = context.createGain();
			oscillator.type = 'sine';
			oscillator.frequency.setValueAtTime( 660, context.currentTime );
			gain.gain.setValueAtTime( 0.2, context.currentTime );
			gain.gain.exponentialRampToValueAtTime( 0.001, context.currentTime + soundDurationSeconds );
			oscillator.connect( gain );
			gain.connect( context.destination );
			oscillator.start();
			oscillator.stop( context.currentTime + soundDurationSeconds );
		} catch ( error ) {
			reportError( error, 'play' );
			return 'failed';
		}

		return 'played';
	}

	document.addEventListener( 'pointerdown', activateAudio );
	document.addEventListener( 'keydown', activateAudio );

	if ( hasBeenActivated() ) {
		activateAudio();
	}

	return {
		play(): NotificationSoundResult | Promise< NotificationSoundResult > {
			if ( disposed ) {
				return 'disposed';
			}
			if ( document.hidden ) {
				return 'hidden';
			}
			if ( unavailableReason ) {
				return unavailableReason;
			}
			if ( audioContext?.state !== 'running' && hasBeenActivated() ) {
				activateAudio();
				if ( unavailableReason ) {
					return unavailableReason;
				}
			}
			const context = audioContext;
			if ( ! context || ( context.state !== 'running' && ! hasBeenActivated() ) ) {
				return 'not_activated';
			}

			const now = Date.now();
			if ( lastPlayedAt !== undefined && now - lastPlayedAt < soundCooldownMs ) {
				return 'cooldown';
			}
			lastPlayedAt = now;

			if ( context.state === 'running' ) {
				return playTone( context );
			}

			// The page was clicked but audio is still starting, so give it a moment.
			return Promise.race( [
				resuming,
				new Promise< void >( ( resolve ) => setTimeout( resolve, resumeTimeoutMs ) ),
			] ).then( () => {
				if ( disposed ) {
					return 'disposed';
				}
				if ( document.hidden ) {
					return 'hidden';
				}
				return context.state === 'running' ? playTone( context ) : 'not_activated';
			} );
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
