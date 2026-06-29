/**
 * @jest-environment jsdom
 */
import { activateArcadeMode } from '../activate';
import { installKonamiListener } from '../detect';

jest.mock( '../activate', () => ( {
	activateArcadeMode: jest.fn(),
} ) );

const mockUnlockAchievement = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	unlockAchievement: ( ...args: unknown[] ) => mockUnlockAchievement( ...args ),
} ) );

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: () => null,
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

function mountFakeMasterbar() {
	const section = document.createElement( 'div' );
	section.className = 'masterbar__section--right';
	const profileWrapper = document.createElement( 'div' );
	profileWrapper.className = 'masterbar__item-wrapper';
	const profile = document.createElement( 'div' );
	profile.className = 'masterbar__item-howdy';
	profileWrapper.appendChild( profile );
	section.appendChild( profileWrapper );
	document.body.appendChild( section );
	return section;
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
	let masterbar: HTMLElement | null = null;

	beforeEach( () => {
		masterbar = mountFakeMasterbar();
		mockUnlockAchievement.mockReset();
		mockUnlockAchievement.mockResolvedValue( { granted: false } );
	} );

	afterEach( () => {
		// Send Escape to deactivate, then sweep any leftovers from a failed test.
		dispatchKey( 'Escape' );
		document.body.classList.remove( 'is-arcade-mode' );
		document.getElementById( 'arcade-mode-lives' )?.remove();
		document.querySelectorAll( '.arcade-mode-flash' ).forEach( ( node ) => node.remove() );
		masterbar?.remove();
		masterbar = null;
	} );

	it( 'adds the arcade body class', () => {
		realActivate.activateArcadeMode();
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
	} );

	it( 'mounts the lives counter inside the masterbar', () => {
		realActivate.activateArcadeMode();
		const counter = document.getElementById( 'arcade-mode-lives' );
		expect( counter ).not.toBeNull();
		expect( counter?.parentElement ).toBe( masterbar );
	} );

	it( 'mounts a translatable flash banner', () => {
		realActivate.activateArcadeMode();
		const banner = document.querySelector( '.arcade-mode-flash' );
		expect( banner ).not.toBeNull();
		expect( banner?.textContent ).toBeTruthy();
	} );

	it( 'does not activate when the masterbar is absent', () => {
		masterbar?.remove();
		masterbar = null;
		realActivate.activateArcadeMode();
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( false );
		expect( document.getElementById( 'arcade-mode-lives' ) ).toBeNull();
		expect( document.querySelector( '.arcade-mode-flash' ) ).toBeNull();
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

	it( 'is idempotent — calling again while active does not duplicate the lives counter', () => {
		realActivate.activateArcadeMode();
		realActivate.activateArcadeMode();
		expect( document.querySelectorAll( '#arcade-mode-lives' ) ).toHaveLength( 1 );
	} );

	it( 'allows re-activation after Escape', () => {
		realActivate.activateArcadeMode();
		dispatchKey( 'Escape' );
		realActivate.activateArcadeMode();
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
	} );

	it( 'activates normally even when the achievement unlock rejects', async () => {
		mockUnlockAchievement.mockRejectedValue( new Error( 'network down' ) );
		realActivate.activateArcadeMode();
		await Promise.resolve();
		await Promise.resolve();
		expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
	} );
} );
