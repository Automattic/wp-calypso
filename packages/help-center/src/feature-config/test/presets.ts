import { PRODUCT_PRESETS } from '../presets';

const untranslated = ( text: string ) => text;

describe( 'PRODUCT_PRESETS AI disclosure lines', () => {
	it.each( [
		[ 'wpcom', 'You’re chatting with AI from WordPress.com Support.' ],
		[ 'woo', 'You’re chatting with AI from Woo Support.' ],
	] as const )( 'gives %s its own line', ( product, line ) => {
		expect( PRODUCT_PRESETS[ product ].aiDisclosureLine?.( untranslated ) ).toBe( line );
	} );

	it( 'gives A4A no line, since its chat is off', () => {
		expect( PRODUCT_PRESETS.a4a.chat.enabled ).toBe( false );
		expect( PRODUCT_PRESETS.a4a.aiDisclosureLine ).toBeUndefined();
	} );
} );
