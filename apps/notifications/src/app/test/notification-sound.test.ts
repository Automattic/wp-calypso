import { createNotificationSound } from '../notification-sound';

describe( 'createNotificationSound', () => {
	let oscillator: {
		onended: ( () => void ) | null;
		disconnect: jest.Mock;
		type: string;
		frequency: { setValueAtTime: jest.Mock };
		connect: jest.Mock;
		start: jest.Mock;
		stop: jest.Mock;
	};
	let gain: {
		disconnect: jest.Mock;
		gain: { setValueAtTime: jest.Mock; exponentialRampToValueAtTime: jest.Mock };
		connect: jest.Mock;
	};
	let audioContext: {
		currentTime: number;
		destination: object;
		state: string;
		onstatechange: ( () => void ) | null;
		suspend: jest.Mock;
		createOscillator: jest.Mock;
		createGain: jest.Mock;
		resume: jest.Mock;
		close: jest.Mock;
	};
	let audioContextConstructor: jest.Mock;
	let originalHidden: PropertyDescriptor | undefined;

	beforeEach( () => {
		oscillator = {
			onended: null,
			disconnect: jest.fn(),
			type: '',
			frequency: { setValueAtTime: jest.fn() },
			connect: jest.fn(),
			start: jest.fn(),
			stop: jest.fn(),
		};
		gain = {
			disconnect: jest.fn(),
			gain: {
				setValueAtTime: jest.fn(),
				exponentialRampToValueAtTime: jest.fn(),
			},
			connect: jest.fn(),
		};
		audioContext = {
			currentTime: 0,
			destination: {},
			state: 'suspended',
			onstatechange: null,
			suspend: jest.fn( () =>
				Promise.resolve().then( () => {
					audioContext.state = 'suspended';
					audioContext.onstatechange?.();
				} )
			),
			createOscillator: jest.fn( () => oscillator ),
			createGain: jest.fn( () => gain ),
			resume: jest.fn( () =>
				Promise.resolve().then( () => {
					audioContext.state = 'running';
					audioContext.onstatechange?.();
				} )
			),
			close: jest.fn().mockResolvedValue( undefined ),
		};
		audioContextConstructor = jest.fn( () => audioContext );
		Object.defineProperty( window, 'AudioContext', {
			configurable: true,
			value: audioContextConstructor,
		} );
		originalHidden = Object.getOwnPropertyDescriptor( document, 'hidden' );
		Object.defineProperty( document, 'hidden', { configurable: true, value: false } );
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
		if ( originalHidden ) {
			Object.defineProperty( document, 'hidden', originalHidden );
		} else {
			delete ( document as { hidden?: boolean } ).hidden;
		}
		delete ( window as { AudioContext?: typeof AudioContext } ).AudioContext;
		delete ( navigator as { userActivation?: UserActivation } ).userActivation;
	} );

	const setHasBeenActive = ( hasBeenActive: boolean ) =>
		Object.defineProperty( navigator, 'userActivation', {
			configurable: true,
			value: { hasBeenActive, isActive: false },
		} );

	it( 'starts audio right away when the page was clicked before it loaded', async () => {
		setHasBeenActive( true );
		const sound = createNotificationSound();

		expect( audioContextConstructor ).toHaveBeenCalledTimes( 1 );
		expect( audioContext.resume ).toHaveBeenCalledTimes( 1 );
		expect( audioContext.state ).toBe( 'suspended' );
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();
		expect( await sound.play() ).toBe( 'played' );
		sound.dispose();
	} );

	it( 'starts audio when an alert arrives after a click it did not see', async () => {
		const sound = createNotificationSound();
		setHasBeenActive( true );

		expect( await sound.play() ).toBe( 'played' );
		expect( audioContextConstructor ).toHaveBeenCalledTimes( 1 );
		sound.dispose();
	} );

	it( 'resumes audio that a tap created before the page counted as clicked', async () => {
		setHasBeenActive( false );
		audioContext.resume.mockImplementationOnce( () => Promise.resolve() );
		const sound = createNotificationSound();
		document.dispatchEvent( new Event( 'pointerdown' ) );
		expect( audioContext.resume ).toHaveBeenCalledTimes( 1 );

		setHasBeenActive( true );
		expect( await sound.play() ).toBe( 'played' );
		expect( audioContext.resume ).toHaveBeenCalledTimes( 2 );
		expect( audioContextConstructor ).toHaveBeenCalledTimes( 1 );
		sound.dispose();
	} );

	it( 'does not resume audio that is already running', async () => {
		setHasBeenActive( true );
		const sound = createNotificationSound();
		await Promise.resolve();
		await Promise.resolve();

		expect( audioContext.state ).toBe( 'running' );
		expect( await sound.play() ).toBe( 'played' );
		expect( audioContext.resume ).toHaveBeenCalledTimes( 1 );
		sound.dispose();
	} );

	it( 'keeps listening for clicks when the browser refuses to start audio', async () => {
		setHasBeenActive( true );
		audioContext.resume.mockImplementation( () => Promise.resolve() );
		const sound = createNotificationSound();
		const result = sound.play();
		jest.advanceTimersByTime( 1000 );
		await expect( result ).resolves.toBe( 'not_activated' );
		const resumeCalls = audioContext.resume.mock.calls.length;

		document.dispatchEvent( new Event( 'pointerdown' ) );
		expect( audioContext.resume ).toHaveBeenCalledTimes( resumeCalls + 1 );
		sound.dispose();
	} );

	it( 'does not report a sound as played while the audio is suspended', async () => {
		audioContext.resume.mockImplementation( () => Promise.resolve() );
		const sound = createNotificationSound();
		document.dispatchEvent( new Event( 'pointerdown' ) );

		expect( await sound.play() ).toBe( 'not_activated' );
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();
		sound.dispose();
	} );

	it( 'waits for audio that is still starting before playing', async () => {
		setHasBeenActive( true );
		audioContext.resume.mockImplementation( () =>
			Promise.resolve().then( () => {
				audioContext.state = 'running';
			} )
		);
		const sound = createNotificationSound();
		const result = sound.play();

		expect( audioContext.createOscillator ).not.toHaveBeenCalled();
		await expect( result ).resolves.toBe( 'played' );
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 1 );
		sound.dispose();
	} );

	it( 'does not play if the tab is hidden while audio is starting', async () => {
		setHasBeenActive( true );
		audioContext.resume.mockImplementation( () =>
			Promise.resolve().then( () => {
				audioContext.state = 'running';
			} )
		);
		const sound = createNotificationSound();
		const result = sound.play();
		Object.defineProperty( document, 'hidden', { configurable: true, value: true } );

		await expect( result ).resolves.toBe( 'hidden' );
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();
		sound.dispose();
	} );

	it( 'gives up on an alert when audio does not start in time', async () => {
		setHasBeenActive( true );
		audioContext.resume.mockImplementation( () => new Promise( () => {} ) );
		const sound = createNotificationSound();
		const result = sound.play();

		jest.advanceTimersByTime( 1000 );
		await expect( result ).resolves.toBe( 'not_activated' );
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();
		sound.dispose();
	} );

	it( 'immediately skips an alert when the page has never been clicked', async () => {
		setHasBeenActive( false );
		const sound = createNotificationSound();

		expect( await sound.play() ).toBe( 'not_activated' );
		expect( audioContextConstructor ).not.toHaveBeenCalled();
		sound.dispose();
	} );

	it( 'uses local gestures without the activation API and only plays new alerts', async () => {
		const sound = createNotificationSound();
		await sound.play();

		expect( audioContextConstructor ).not.toHaveBeenCalled();

		document.dispatchEvent( new Event( 'pointerdown' ) );
		await Promise.resolve();
		expect( audioContextConstructor ).toHaveBeenCalledTimes( 1 );
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();

		expect( await sound.play() ).toBe( 'played' );
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 1 );
		oscillator.onended?.();
		await Promise.resolve();
		jest.advanceTimersByTime( 3000 );
		expect( await sound.play() ).toBe( 'played' );
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 2 );
		sound.dispose();
	} );

	it( 'does not play while hidden and throttles repeated sounds', async () => {
		const sound = createNotificationSound();
		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter' } ) );
		await Promise.resolve();

		Object.defineProperty( document, 'hidden', { configurable: true, value: true } );
		await sound.play();
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();

		Object.defineProperty( document, 'hidden', { configurable: true, value: false } );
		await sound.play();
		await sound.play();
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 3000 );
		await sound.play();
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 2 );
		sound.dispose();
	} );

	it( 'reports why a sound was or was not played', async () => {
		const sound = createNotificationSound();
		expect( await sound.play() ).toBe( 'not_activated' );

		document.dispatchEvent( new Event( 'pointerdown' ) );
		await Promise.resolve();
		expect( await sound.play() ).toBe( 'played' );
		expect( await sound.play() ).toBe( 'cooldown' );

		Object.defineProperty( document, 'hidden', { configurable: true, value: true } );
		expect( await sound.play() ).toBe( 'hidden' );
		sound.dispose();
		expect( await sound.play() ).toBe( 'disposed' );
	} );

	it( 'reports an unsupported browser without an error', async () => {
		delete ( window as { AudioContext?: typeof AudioContext } ).AudioContext;
		const onError = jest.fn();
		const sound = createNotificationSound( { onError } );

		document.dispatchEvent( new Event( 'pointerdown' ) );

		expect( await sound.play() ).toBe( 'unsupported' );
		expect( onError ).not.toHaveBeenCalled();
		sound.dispose();
	} );

	it( 'reports a resume that throws synchronously', async () => {
		const error = new Error( 'InvalidStateError' );
		audioContext.resume.mockImplementation( () => {
			throw error;
		} );
		const onError = jest.fn();
		const sound = createNotificationSound( { onError } );

		document.dispatchEvent( new Event( 'pointerdown' ) );

		expect( onError ).toHaveBeenCalledWith( error, 'resume' );
		expect( await sound.play() ).toBe( 'not_activated' );
		sound.dispose();
	} );

	it( 'reports a failure to create the audio context and stops trying', async () => {
		const error = new Error( 'Too many audio contexts' );
		audioContextConstructor.mockImplementation( () => {
			throw error;
		} );
		const onError = jest.fn();
		const sound = createNotificationSound( { onError } );

		document.dispatchEvent( new Event( 'pointerdown' ) );
		document.dispatchEvent( new Event( 'pointerdown' ) );

		expect( onError ).toHaveBeenCalledTimes( 1 );
		expect( onError ).toHaveBeenCalledWith( error, 'create' );
		expect( await sound.play() ).toBe( 'create_failed' );
		sound.dispose();
	} );

	it( 'reports a rejected resume and close', async () => {
		const resumeError = new Error( 'resume failed' );
		const closeError = new Error( 'close failed' );
		audioContext.resume.mockRejectedValue( resumeError );
		audioContext.close.mockRejectedValue( closeError );
		const onError = jest.fn();
		const sound = createNotificationSound( { onError } );

		document.dispatchEvent( new Event( 'pointerdown' ) );
		sound.dispose();
		await Promise.resolve();
		await Promise.resolve();

		expect( onError ).toHaveBeenCalledWith( resumeError, 'resume' );
		expect( onError ).toHaveBeenCalledWith( closeError, 'close' );
	} );

	it( 'reports a failure to play without throwing', async () => {
		const error = new Error( 'createOscillator failed' );
		audioContext.createOscillator.mockImplementation( () => {
			throw error;
		} );
		const onError = jest.fn();
		const sound = createNotificationSound( { onError } );
		document.dispatchEvent( new Event( 'pointerdown' ) );
		await Promise.resolve();

		expect( await sound.play() ).toBe( 'failed' );
		expect( onError ).toHaveBeenCalledWith( error, 'play' );
		sound.dispose();
	} );

	it( 'keeps working when the error reporter throws', async () => {
		audioContext.createOscillator.mockImplementation( () => {
			throw new Error( 'createOscillator failed' );
		} );
		const sound = createNotificationSound( {
			onError: () => {
				throw new Error( 'reporter failed' );
			},
		} );
		document.dispatchEvent( new Event( 'pointerdown' ) );
		await Promise.resolve();

		expect( await sound.play() ).toBe( 'failed' );
		sound.dispose();
	} );

	it( 'unlocks touch audio on pointerup after pointerdown was blocked', async () => {
		setHasBeenActive( false );
		audioContext.resume.mockImplementationOnce( () => Promise.resolve() );
		const sound = createNotificationSound();
		document.dispatchEvent( new Event( 'pointerdown' ) );
		await Promise.resolve();
		expect( audioContext.state ).toBe( 'suspended' );

		setHasBeenActive( true );
		document.dispatchEvent( new Event( 'pointerup' ) );
		await Promise.resolve();
		expect( audioContext.state ).toBe( 'running' );
		expect( await sound.play() ).toBe( 'played' );
		expect( audioContext.resume ).toHaveBeenCalledTimes( 2 );
		sound.dispose();
	} );

	it.each( [ 'suspended', 'interrupted' ] )(
		'listens for a new tap after audio becomes %s',
		async ( state ) => {
			setHasBeenActive( true );
			const sound = createNotificationSound();
			await Promise.resolve();
			await Promise.resolve();
			const resumeCalls = audioContext.resume.mock.calls.length;
			audioContext.state = state;
			audioContext.onstatechange?.();
			document.dispatchEvent( new Event( 'pointerup' ) );
			await Promise.resolve();

			expect( audioContext.resume ).toHaveBeenCalledTimes( resumeCalls + 1 );
			expect( await sound.play() ).toBe( 'played' );
			sound.dispose();
		}
	);

	it( 'suspends and disconnects audio after a tone and resumes for the next alert', async () => {
		setHasBeenActive( true );
		const sound = createNotificationSound();
		expect( await sound.play() ).toBe( 'played' );
		oscillator.onended?.();
		await Promise.resolve();
		expect( oscillator.disconnect ).toHaveBeenCalledTimes( 1 );
		expect( gain.disconnect ).toHaveBeenCalledTimes( 1 );
		expect( audioContext.suspend ).toHaveBeenCalledTimes( 1 );
		expect( audioContext.state ).toBe( 'suspended' );
		const resumeCalls = audioContext.resume.mock.calls.length;
		document.dispatchEvent( new Event( 'pointerdown' ) );
		document.dispatchEvent( new Event( 'pointerup' ) );
		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter' } ) );
		await Promise.resolve();
		expect( audioContext.state ).toBe( 'suspended' );
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 1 );
		expect( sound.play() ).toBe( 'cooldown' );
		expect( audioContext.resume ).toHaveBeenCalledTimes( resumeCalls );

		jest.advanceTimersByTime( 3000 );
		expect( await sound.play() ).toBe( 'played' );
		sound.dispose();
		oscillator.onended?.();
		expect( audioContext.suspend ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports a failed suspend without losing the next alert', async () => {
		setHasBeenActive( true );
		const error = new Error( 'suspend failed' );
		audioContext.suspend.mockRejectedValue( error );
		const onError = jest.fn();
		const sound = createNotificationSound( { onError } );
		expect( await sound.play() ).toBe( 'played' );
		oscillator.onended?.();
		await Promise.resolve();
		expect( onError ).toHaveBeenCalledWith( error, 'suspend' );
		audioContext.state = 'suspended';
		audioContext.onstatechange?.();
		const resumeCalls = audioContext.resume.mock.calls.length;
		document.dispatchEvent( new Event( 'pointerup' ) );
		await Promise.resolve();
		expect( audioContext.resume ).toHaveBeenCalledTimes( resumeCalls + 1 );
		jest.advanceTimersByTime( 3000 );
		expect( await sound.play() ).toBe( 'played' );
		sound.dispose();
	} );

	it( 'collapses pending alerts but releases the cooldown when audio times out', async () => {
		setHasBeenActive( true );
		audioContext.resume.mockImplementation( () => new Promise( () => {} ) );
		const sound = createNotificationSound();
		const result = sound.play();
		expect( sound.play() ).toBe( 'cooldown' );
		jest.advanceTimersByTime( 1000 );
		await expect( result ).resolves.toBe( 'not_activated' );

		audioContext.state = 'running';
		document.dispatchEvent( new Event( 'pointerup' ) );
		expect( await sound.play() ).toBe( 'played' );
		expect( sound.play() ).toBe( 'cooldown' );
		sound.dispose();
	} );

	it( 'releases the cooldown when a pending alert becomes hidden', async () => {
		setHasBeenActive( true );
		const sound = createNotificationSound();
		const result = sound.play();
		Object.defineProperty( document, 'hidden', { configurable: true, value: true } );
		await expect( result ).resolves.toBe( 'hidden' );

		Object.defineProperty( document, 'hidden', { configurable: true, value: false } );
		expect( await sound.play() ).toBe( 'played' );
		sound.dispose();
	} );

	it( 'releases the cooldown after tone creation fails', async () => {
		setHasBeenActive( true );
		audioContext.createOscillator.mockImplementationOnce( () => {
			throw new Error( 'failed' );
		} );
		const sound = createNotificationSound();
		expect( await sound.play() ).toBe( 'failed' );
		expect( await sound.play() ).toBe( 'played' );
		sound.dispose();
	} );

	it( 'counts the cooldown from when a delayed tone actually plays', async () => {
		setHasBeenActive( true );
		let finishResume: () => void = () => {};
		const resume = new Promise< void >( ( resolve ) => {
			finishResume = () => {
				audioContext.state = 'running';
				resolve();
			};
		} );
		audioContext.resume.mockReturnValue( resume );
		const sound = createNotificationSound();
		const result = sound.play();
		jest.advanceTimersByTime( 900 );
		finishResume();
		await expect( result ).resolves.toBe( 'played' );
		jest.advanceTimersByTime( 2100 );
		expect( sound.play() ).toBe( 'cooldown' );
		jest.advanceTimersByTime( 900 );
		expect( await sound.play() ).toBe( 'played' );
		sound.dispose();
	} );

	it( 'releases the audio context and gesture listeners on cleanup', async () => {
		const sound = createNotificationSound();
		document.dispatchEvent( new Event( 'pointerdown' ) );

		sound.dispose();
		document.dispatchEvent( new Event( 'keydown' ) );

		expect( audioContext.close ).toHaveBeenCalledTimes( 1 );
		expect( audioContextConstructor ).toHaveBeenCalledTimes( 1 );
	} );
} );
