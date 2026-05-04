/**
 * @jest-environment jsdom
 */
import { render, act } from '@testing-library/react';
import { ArcadeModeProvider, KonamiListener, matchesKonamiSequence } from '../';

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

describe( 'arcade-mode', () => {
	afterEach( () => {
		document.body.classList.remove( 'is-arcade-mode' );
		document.body.classList.remove( 'is-arcade-mode--just-activated' );
		document.getElementById( 'arcade-mode-font' )?.remove();
	} );

	describe( 'matchesKonamiSequence', () => {
		it( 'returns false for an empty buffer', () => {
			expect( matchesKonamiSequence( [] ) ).toBe( false );
		} );

		it( 'returns false for a partial sequence', () => {
			expect( matchesKonamiSequence( [ 'arrowup', 'arrowup' ] ) ).toBe( false );
		} );

		it( 'returns true for the exact sequence', () => {
			expect(
				matchesKonamiSequence( [
					'arrowup',
					'arrowup',
					'arrowdown',
					'arrowdown',
					'arrowleft',
					'arrowright',
					'arrowleft',
					'arrowright',
					'b',
					'a',
				] )
			).toBe( true );
		} );

		it( 'returns false for a wrong sequence', () => {
			expect(
				matchesKonamiSequence( [
					'arrowup',
					'arrowup',
					'arrowdown',
					'arrowdown',
					'arrowleft',
					'arrowright',
					'arrowleft',
					'arrowright',
					'a',
					'b',
				] )
			).toBe( false );
		} );
	} );

	describe( 'KonamiListener', () => {
		it( 'adds the arcade body class after the Konami sequence', () => {
			render(
				<ArcadeModeProvider>
					<KonamiListener />
				</ArcadeModeProvider>
			);

			act( () => {
				KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
			} );

			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
		} );

		it( 'ignores key events from editable targets', () => {
			render(
				<ArcadeModeProvider>
					<KonamiListener />
				</ArcadeModeProvider>
			);

			const input = document.createElement( 'input' );
			document.body.appendChild( input );

			act( () => {
				KONAMI_KEYS.forEach( ( key ) => dispatchKey( key, input ) );
			} );

			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( false );
			input.remove();
		} );

		it( 'still activates after a mistyped key — buffer keeps the last 10 sequence keys', () => {
			render(
				<ArcadeModeProvider>
					<KonamiListener />
				</ArcadeModeProvider>
			);

			act( () => {
				dispatchKey( 'ArrowUp' );
				dispatchKey( 'ArrowDown' ); // wrong second key
				KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
			} );

			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
		} );

		it( 'removes the arcade body class when Escape is pressed while active', () => {
			render(
				<ArcadeModeProvider>
					<KonamiListener />
				</ArcadeModeProvider>
			);

			act( () => {
				KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
			} );
			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );

			act( () => {
				dispatchKey( 'Escape' );
			} );
			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( false );
		} );

		it( 'ignores Escape pressed inside an editable element', () => {
			render(
				<ArcadeModeProvider>
					<KonamiListener />
				</ArcadeModeProvider>
			);

			act( () => {
				KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
			} );
			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );

			const input = document.createElement( 'input' );
			document.body.appendChild( input );
			act( () => {
				dispatchKey( 'Escape', input );
			} );
			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
			input.remove();
		} );

		it( 'allows re-activating after deactivation', () => {
			render(
				<ArcadeModeProvider>
					<KonamiListener />
				</ArcadeModeProvider>
			);

			act( () => {
				KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
				dispatchKey( 'Escape' );
				KONAMI_KEYS.forEach( ( key ) => dispatchKey( key ) );
			} );

			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( true );
		} );

		it( 'does not activate when arrow keys are pressed in the wrong order', () => {
			render(
				<ArcadeModeProvider>
					<KonamiListener />
				</ArcadeModeProvider>
			);

			act( () => {
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
			} );

			expect( document.body.classList.contains( 'is-arcade-mode' ) ).toBe( false );
		} );
	} );
} );
