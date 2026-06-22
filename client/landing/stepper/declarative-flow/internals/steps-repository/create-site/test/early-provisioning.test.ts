import { AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import { EARLY_PROVISION_TARGET_WPCOM_ATOMIC, getEarlyCreatedSiteId } from '../early-provisioning';

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
