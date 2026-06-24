import {
	EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
	buildEarlyProvisionDestination,
} from '../early-provisioning';

describe( 'Site Spec early provisioning', () => {
	describe( 'buildEarlyProvisionDestination', () => {
		it( 'hands off to AI Site Builder with a WPCOM Atomic provision target', () => {
			const destination = buildEarlyProvisionDestination( {
				specId: 'spec id',
				phSessionId: 'ph-session',
				source: 'vega',
			} );
			const url = new URL( destination, 'https://wordpress.com' );

			expect( url.pathname ).toBe( '/setup/ai-site-builder/' );
			expect( url.searchParams.get( 'trigger_backend_build' ) ).toBe( '0' );
			expect( url.searchParams.get( 'spec_id' ) ).toBe( 'spec id' );
			expect( url.searchParams.get( 'provision_target' ) ).toBe(
				EARLY_PROVISION_TARGET_WPCOM_ATOMIC
			);
			expect( url.searchParams.has( 'early_created_site' ) ).toBe( false );
			expect( url.searchParams.get( '_ph' ) ).toBe( 'ph-session' );
			expect( url.searchParams.get( 'source' ) ).toBe( 'vega' );
			expect( url.searchParams.has( 'create_garden_site' ) ).toBe( false );
		} );
	} );
} );
