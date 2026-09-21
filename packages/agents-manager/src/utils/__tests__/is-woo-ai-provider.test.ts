import { isWooAiProvider } from '../is-woo-ai-provider';

describe( 'isWooAiProvider', () => {
	it( 'recognizes the Woo AI Zendesk integration', () => {
		expect( isWooAiProvider( 'woo' ) ).toBe( true );
	} );

	it.each( [ undefined, '', 'wpcom' ] )( 'rejects non-Woo integrations (%s)', ( integration ) => {
		expect( isWooAiProvider( integration ) ).toBe( false );
	} );
} );
