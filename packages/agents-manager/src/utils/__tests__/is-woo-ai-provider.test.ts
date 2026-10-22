import { getWooZendeskIntegrationKey, isWooAiProvider } from '../is-woo-ai-provider';
import { setLoadedProviderIds } from '../loaded-provider-ids';

describe( 'isWooAiProvider', () => {
	afterEach( () => {
		setLoadedProviderIds( undefined );
	} );

	it( 'recognizes the Woo AI provider', () => {
		expect( isWooAiProvider( [ 'jetpack-ai-sidebar', 'woocommerce-ai' ] ) ).toBe( true );
	} );

	it.each( [ undefined, [], [ 'jetpack-ai-sidebar' ] ] )(
		'rejects non-Woo providers (%s)',
		( providerIds ) => {
			expect( isWooAiProvider( providerIds ) ).toBe( false );
		}
	);

	it( 'derives the Woo Zendesk integration when the provider is loaded', () => {
		setLoadedProviderIds( [ 'woocommerce-ai' ] );

		expect( getWooZendeskIntegrationKey() ).toBe( 'woo' );
		expect( getWooZendeskIntegrationKey( 'configured-woo' ) ).toBe( 'configured-woo' );
	} );

	it( 'does not expose a Zendesk integration without the Woo provider', () => {
		setLoadedProviderIds( [ 'jetpack-ai-sidebar' ] );

		expect( getWooZendeskIntegrationKey( 'woo' ) ).toBeUndefined();
	} );
} );
