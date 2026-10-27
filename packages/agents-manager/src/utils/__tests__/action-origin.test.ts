import { markActionOrigin, takeActionOrigin } from '../action-origin';

describe( 'action origin', () => {
	beforeEach( () => {
		takeActionOrigin( 'open' );
		takeActionOrigin( 'send' );
	} );

	it( 'defaults to the chat UI', () => {
		expect( takeActionOrigin( 'open' ) ).toBe( 'user' );
		expect( takeActionOrigin( 'send' ) ).toBe( 'composer' );
	} );

	it( 'hands a mark to exactly one take', () => {
		markActionOrigin( 'open', 'host' );

		expect( takeActionOrigin( 'open' ) ).toBe( 'host' );
		expect( takeActionOrigin( 'open' ) ).toBe( 'user' );
	} );

	it( 'keeps opens and sends apart', () => {
		markActionOrigin( 'send', 'host' );

		expect( takeActionOrigin( 'open' ) ).toBe( 'user' );
		expect( takeActionOrigin( 'send' ) ).toBe( 'host' );
	} );
} );
