import {
	EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
	buildEarlyProvisionDestination,
	getEarlyProvisionSiteCreateBody,
	getEarlyProvisionedSiteId,
} from '../early-provisioning';

describe( 'Site Spec early provisioning', () => {
	describe( 'getEarlyProvisionSiteCreateBody', () => {
		it( 'requests WPCOM Atomic early provisioning without Garden fields', () => {
			const body = getEarlyProvisionSiteCreateBody( 'client-id', 'client-secret' );

			expect( body ).toEqual( {
				client_id: 'client-id',
				client_secret: 'client-secret',
				blog_title: '',
				blog_name: '',
				options: {
					site_creation_flow: 'ai-site-builder',
					trigger_backend_build: false,
					early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
				},
			} );
			expect( body ).not.toHaveProperty( 'garden_name' );
			expect( body ).not.toHaveProperty( 'garden_partner_name' );
		} );
	} );

	describe( 'getEarlyProvisionedSiteId', () => {
		it( 'returns the blog id only when WPCOM Atomic transfer details are present', () => {
			expect(
				getEarlyProvisionedSiteId( {
					blog_details: {
						blogid: '255716498',
					},
					atomic_transfer: {
						id: '123',
						status: 'active',
					},
					early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
				} )
			).toBe( 255716498 );
		} );

		it( 'rejects a response without the WPCOM Atomic target', () => {
			expect(
				getEarlyProvisionedSiteId( {
					blog_details: {
						blogid: '255716498',
					},
					atomic_transfer: {
						id: '123',
					},
				} )
			).toBeNull();
		} );

		it( 'rejects a response without an Atomic transfer id', () => {
			expect(
				getEarlyProvisionedSiteId( {
					blog_details: {
						blogid: '255716498',
					},
					early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
				} )
			).toBeNull();
		} );

		it( 'rejects a response without a valid blog id', () => {
			expect(
				getEarlyProvisionedSiteId( {
					blog_details: {
						blogid: 'not-a-number',
					},
					atomic_transfer: {
						id: '123',
					},
					early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
				} )
			).toBeNull();
		} );
	} );

	describe( 'buildEarlyProvisionDestination', () => {
		it( 'hands off to AI Site Builder with the early-created WPCOM Atomic site', () => {
			const destination = buildEarlyProvisionDestination( {
				specId: 'spec id',
				blogId: 255716498,
				phSessionId: 'ph-session',
				source: 'vega',
			} );
			const url = new URL( destination, 'https://wordpress.com' );

			expect( url.pathname ).toBe( '/setup/ai-site-builder/' );
			expect( url.searchParams.get( 'trigger_backend_build' ) ).toBe( '0' );
			expect( url.searchParams.get( 'spec_id' ) ).toBe( 'spec id' );
			expect( url.searchParams.get( 'early_provision_target' ) ).toBe(
				EARLY_PROVISION_TARGET_WPCOM_ATOMIC
			);
			expect( url.searchParams.get( 'early_created_site' ) ).toBe( '255716498' );
			expect( url.searchParams.get( '_ph' ) ).toBe( 'ph-session' );
			expect( url.searchParams.get( 'source' ) ).toBe( 'vega' );
			expect( url.searchParams.has( 'create_garden_site' ) ).toBe( false );
		} );
	} );
} );
