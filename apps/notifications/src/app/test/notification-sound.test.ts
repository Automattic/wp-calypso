import { createNotificationSound } from '../notification-sound';

describe( 'createNotificationSound', () => {
	let oscillator: {
		type: string;
		frequency: { setValueAtTime: jest.Mock };
		connect: jest.Mock;
		start: jest.Mock;
		stop: jest.Mock;
	};
	let gain: {
		gain: { setValueAtTime: jest.Mock; exponentialRampToValueAtTime: jest.Mock };
		connect: jest.Mock;
	};
	let audioContext: {
		currentTime: number;
		destination: object;
		state: string;
		createOscillator: jest.Mock;
		createGain: jest.Mock;
		resume: jest.Mock;
		close: jest.Mock;
	};
	let audioContextConstructor: jest.Mock;
	let originalHidden: PropertyDescriptor | undefined;

	beforeEach( () => {
		oscillator = {
			type: '',
			frequency: { setValueAtTime: jest.fn() },
			connect: jest.fn(),
			start: jest.fn(),
			stop: jest.fn(),
		};
		gain = {
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
			createOscillator: jest.fn( () => oscillator ),
			createGain: jest.fn( () => gain ),
			resume: jest.fn().mockResolvedValue( undefined ),
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
	} );

	it( 'waits for a user gesture and does not replay an alert that arrived before it', () => {
		const sound = createNotificationSound();
		sound.play();

		expect( audioContextConstructor ).not.toHaveBeenCalled();

		document.dispatchEvent( new Event( 'pointerdown' ) );
		expect( audioContextConstructor ).toHaveBeenCalledTimes( 1 );
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();

		sound.play();
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 1 );
		sound.dispose();
	} );

	it( 'does not play while hidden and throttles repeated sounds', () => {
		const sound = createNotificationSound();
		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter' } ) );

		Object.defineProperty( document, 'hidden', { configurable: true, value: true } );
		sound.play();
		expect( audioContext.createOscillator ).not.toHaveBeenCalled();

		Object.defineProperty( document, 'hidden', { configurable: true, value: false } );
		sound.play();
		sound.play();
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 3000 );
		sound.play();
		expect( audioContext.createOscillator ).toHaveBeenCalledTimes( 2 );
		sound.dispose();
	} );

	it( 'releases the audio context and gesture listeners on cleanup', () => {
		const sound = createNotificationSound();
		document.dispatchEvent( new Event( 'pointerdown' ) );

		sound.dispose();
		document.dispatchEvent( new Event( 'keydown' ) );

		expect( audioContext.close ).toHaveBeenCalledTimes( 1 );
		expect( audioContextConstructor ).toHaveBeenCalledTimes( 1 );
	} );
} );
