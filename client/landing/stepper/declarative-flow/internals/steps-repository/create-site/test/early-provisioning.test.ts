import { AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import {
	EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
	getAtomicProvisionedSiteSlug,
	getEarlyCreatedSiteId,
} from '../early-provisioning';

describe( 'getEarlyCreatedSiteId', () => {
	it( 'requires an early-created site for WPCOM Atomic early provisioning', () => {
		expect( () =>
			getEarlyCreatedSiteId( AI_SITE_BUILDER_FLOW, null, EARLY_PROVISION_TARGET_WPCOM_ATOMIC )
		).toThrow( 'Missing early_created_site for WPCOM Atomic early provisioning.' );
	} );

	it( 'returns the early-created site ID for WPCOM Atomic early provisioning', () => {
		expect(
			getEarlyCreatedSiteId(
				AI_SITE_BUILDER_FLOW,
				'255716498',
				EARLY_PROVISION_TARGET_WPCOM_ATOMIC
			)
		).toBe( 255716498 );
	} );

	it( 'allows regular AI Site Builder creation when WPCOM Atomic early provisioning is not requested', () => {
		expect( getEarlyCreatedSiteId( AI_SITE_BUILDER_FLOW, null, null ) ).toBeNull();
	} );
} );

describe( 'getAtomicProvisionedSiteSlug', () => {
	it( 'prefers the site slug from the provisioning response', () => {
		expect(
			getAtomicProvisionedSiteSlug(
				{
					URL: 'https://fallback.wordpress.com',
					slug: 'provisioned.wordpress.com',
				},
				123
			)
		).toBe( 'provisioned.wordpress.com' );
	} );

	it( 'falls back to the host from the site URL', () => {
		expect(
			getAtomicProvisionedSiteSlug(
				{
					URL: 'https://provisioned.wordpress.com',
				},
				123
			)
		).toBe( 'provisioned.wordpress.com' );
	} );

	it( 'falls back to the site ID when the response has no usable slug', () => {
		expect(
			getAtomicProvisionedSiteSlug(
				{
					URL: 'not a url',
				},
				123
			)
		).toBe( '123' );
	} );
} );
