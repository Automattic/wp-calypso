import { isWooAiHost } from '../is-wooai-agent';

type WithBareGlobal = typeof globalThis & { agentsManagerData?: unknown };

function setBareGlobal( value: unknown ): void {
	( globalThis as WithBareGlobal ).agentsManagerData = value;
}

function clearBareGlobal(): void {
	delete ( globalThis as WithBareGlobal ).agentsManagerData;
}

describe( 'isWooAiHost', () => {
	const originalWindow = globalThis.window;

	afterEach( () => {
		globalThis.window = originalWindow;
		clearBareGlobal();
	} );

	it( 'returns `false` when `window` is undefined (SSR)', () => {
		// @ts-expect-error - Mocking window
		delete globalThis.window;
		expect( isWooAiHost() ).toBe( false );
	} );

	it( "returns `true` when the bare global `sectionName` is 'wooai-admin'", () => {
		globalThis.window = { ...originalWindow } as unknown as Window & typeof globalThis;
		setBareGlobal( { sectionName: 'wooai-admin' } );
		expect( isWooAiHost() ).toBe( true );
	} );

	it( "returns `true` for any 'wooai'-prefixed section name", () => {
		globalThis.window = { ...originalWindow } as unknown as Window & typeof globalThis;
		setBareGlobal( { sectionName: 'wooai' } );
		expect( isWooAiHost() ).toBe( true );
	} );

	it( 'falls back to `window.agentsManagerData` when no bare global exists', () => {
		globalThis.window = {
			...originalWindow,
			agentsManagerData: { sectionName: 'wooai-admin' },
		} as unknown as Window & typeof globalThis;
		expect( isWooAiHost() ).toBe( true );
	} );

	it( 'returns `false` for a non-Woo section name', () => {
		globalThis.window = { ...originalWindow } as unknown as Window & typeof globalThis;
		setBareGlobal( { sectionName: 'gutenberg' } );
		expect( isWooAiHost() ).toBe( false );
	} );

	it( 'returns `false` when `agentsManagerData` is missing', () => {
		globalThis.window = { ...originalWindow } as unknown as Window & typeof globalThis;
		expect( isWooAiHost() ).toBe( false );
	} );
} );
