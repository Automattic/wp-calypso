/**
 * @jest-environment jsdom
 */
import { activateArcadeMode } from '../activate';
import { installKonamiListener } from '../detect';

jest.mock( '../activate', () => ( {
	activateArcadeMode: jest.fn(),
} ) );

const realActivate = jest.requireActual< typeof import('../activate') >( '../activate' );

const KONAMI_KEYS = [
	'ArrowUp',
	'ArrowUp',
	'ArrowDown',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowLeft',
	'ArrowRight',
	'b',
	'a',
];

function dispatchKey( key: string, target: EventTarget = document ) {
	const event = new KeyboardEvent( 'keydown', { key, bubbles: true } );
	Object.defineProperty( event, 'target', { value: target, configurable: true } );
	target.dispatchEvent( event );
}

async function flushImport() {
	// installKonamiListener triggers a dynamic import on match — wait for the
	// resulting microtasks to settle so the mock is observed.
	await Promise.resolve();
	await Promise.resolve();
}

describe( 'installKonamiListener', () => {
	let uninstall: () => void;

	beforeEach( () => {
		( activateArcadeMode as jest.Mock ).mockClear();
		uninstall = installKonamiListener();
	} );

	afterEach( () => {
		uninstall();
	} );

	it( 'invokes activateArcadeMode after the Konami sequence', async () => {
		KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
		await flushImport();
		expect( activateArcadeMode ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores key events from editable targets', async () => {
		const input = document.createElement( 'input' );
		document.body.appendChild( input );
		KONAMI_KEYS.forEach( ( key ) => dispatchKey( key, input ) );
		await flushImport();
		expect( activateArcadeMode ).not.toHaveBeenCalled();
		input.remove();
	} );

	it( 'still activates after a mistyped key — buffer keeps the last 10 sequence keys', async () => {
		dispatchKey( 'ArrowUp' );
		dispatchKey( 'ArrowDown' ); // wrong second key
		KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
		await flushImport();
		expect( activateArcadeMode ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not activate when arrow keys are pressed in the wrong order', async () => {
		[
			'ArrowDown',
			'ArrowUp',
			'ArrowUp',
			'ArrowDown',
			'ArrowLeft',
			'ArrowRight',
			'ArrowLeft',
			'ArrowRight',
			'b',
			'a',
		].forEach( ( key ) => dispatchKey( key ) );
		await flushImport();
		expect( activateArcadeMode ).not.toHaveBeenCalled();
	} );
} );

describe( 'activateArcadeMode', () => {
	afterEach( () => {
		// Send Escape to deactivate, then sweep any leftovers from a failed test.
		dispatchKey( 'Escape' );
		document.body.classList.remove( 'is-arcade-mode', 'is-arcade-mode--just-activated' );
		document.getElementById( 'arcade-mode-font' )?.remove();
		document.getElementById( 'arcade-mode-lives' )?.remove();
	} );

	it( 'adds the arcade body class', () => {
		realActivate.activateArcadeMode();
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
	} );

	it( 'removes the arcade body class when Escape is pressed', () => {
		realActivate.activateArcadeMode();
		dispatchKey( 'Escape' );
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( false );
	} );

	it( 'ignores Escape pressed inside an editable element', () => {
		realActivate.activateArcadeMode();
		const input = document.createElement( 'input' );
		document.body.appendChild( input );
		dispatchKey( 'Escape', input );
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
		input.remove();
	} );

	it( 'is idempotent — calling again while active does not re-add side effects', () => {
		realActivate.activateArcadeMode();
		realActivate.activateArcadeMode();
		expect( document.querySelectorAll( '#arcade-mode-font' ) ).toHaveLength( 1 );
	} );

	it( 'allows re-activation after Escape', () => {
		realActivate.activateArcadeMode();
		dispatchKey( 'Escape' );
		realActivate.activateArcadeMode();
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
	} );
} );
