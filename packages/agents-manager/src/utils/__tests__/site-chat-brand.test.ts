/**
 * @jest-environment jsdom
 */
import { getBrandName, getBrandLogoUrl } from '../site-chat-brand';

declare global {
	// eslint-disable-next-line no-var
	var agentsManagerData: Record< string, unknown > | undefined;
}

function setInlineData( data: Record< string, unknown > | undefined ) {
	( window as unknown as { agentsManagerData?: unknown } ).agentsManagerData = data;
}

describe( 'site chat brand', () => {
	afterEach( () => {
		setInlineData( undefined );
	} );

	describe( 'on the reader-chat host', () => {
		beforeEach( () => {
			setInlineData( {
				agentId: 'reader-chat',
				brandName: 'Ada',
				brandLogoUrl: 'https://example.com/icon.png',
			} );
		} );

		it( 'returns the name', () => {
			expect( getBrandName() ).toBe( 'Ada' );
		} );

		it( 'returns the logo URL', () => {
			expect( getBrandLogoUrl() ).toBe( 'https://example.com/icon.png' );
		} );

		it( 'treats an empty string as unbranded', () => {
			setInlineData( { agentId: 'reader-chat', brandName: '', brandLogoUrl: '' } );

			expect( getBrandName() ).toBeUndefined();
			expect( getBrandLogoUrl() ).toBeUndefined();
		} );

		it( 'tolerates a brand that was never set', () => {
			setInlineData( { agentId: 'reader-chat' } );

			expect( getBrandName() ).toBeUndefined();
			expect( getBrandLogoUrl() ).toBeUndefined();
		} );

		it( 'applies to every reader-chat variant', () => {
			setInlineData( { agentId: 'p2-reader-chat', brandName: 'Ada' } );

			expect( getBrandName() ).toBe( 'Ada' );
		} );
	} );

	describe( 'off-host', () => {
		// A blog's branding must never leak into wp-admin, Big Sky, or the
		// orchestrator — they all share these components.
		it( 'ignores a brand on the orchestrator', () => {
			setInlineData( {
				agentId: 'wp-orchestrator',
				brandName: 'Ada',
				brandLogoUrl: 'https://example.com/icon.png',
			} );

			expect( getBrandName() ).toBeUndefined();
			expect( getBrandLogoUrl() ).toBeUndefined();
		} );

		it( 'ignores a brand when no agent is identified', () => {
			setInlineData( { brandName: 'Ada', brandLogoUrl: 'https://example.com/icon.png' } );

			expect( getBrandName() ).toBeUndefined();
			expect( getBrandLogoUrl() ).toBeUndefined();
		} );

		it( 'tolerates missing inline data entirely', () => {
			setInlineData( undefined );

			expect( getBrandName() ).toBeUndefined();
			expect( getBrandLogoUrl() ).toBeUndefined();
		} );
	} );
} );
