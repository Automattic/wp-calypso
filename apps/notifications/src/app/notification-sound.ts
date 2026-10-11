const soundCooldownMs = 3000;
const soundDurationSeconds = 0.4;

export function createNotificationSound() {
	let audioContext: AudioContext | undefined;
	let lastPlayedAt: number | undefined;
	let disposed = false;

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
			removeGestureListeners();
			return;
		}

		audioContext ??= new AudioContextConstructor();
		void audioContext.resume();
		removeGestureListeners();
	}

	document.addEventListener( 'pointerdown', activateAudio );
	document.addEventListener( 'keydown', activateAudio );

	return {
		play() {
			if ( disposed || document.hidden || ! audioContext ) {
				return;
			}

			const now = Date.now();
			if ( lastPlayedAt !== undefined && now - lastPlayedAt < soundCooldownMs ) {
				return;
			}
			lastPlayedAt = now;

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
		},
		dispose() {
			if ( disposed ) {
				return;
			}
			disposed = true;
			removeGestureListeners();
			if ( audioContext && audioContext.state !== 'closed' ) {
				void audioContext.close();
			}
		},
	};
}
