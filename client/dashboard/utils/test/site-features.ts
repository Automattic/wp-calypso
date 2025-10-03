import { DotcomFeatures, HostingFeatures } from '@automattic/api-core';
import { hasHostingFeature, hasPlanFeature } from '../site-features';
import type { Site } from '@automattic/api-core';

describe( 'hasPlanFeature', () => {
	it( 'should return false if the site does not have active plan', () => {
		const site = {} as Site;
		expect( hasPlanFeature( site, DotcomFeatures.COPY_SITE ) ).toBe( false );
	} );

	it( 'should return false if the plan does not have the feature', () => {
		const site = {
			plan: {
				features: {
					active: [ DotcomFeatures.SUBSCRIPTION_GIFTING ],
				},
			},
		} as Site;
		expect( hasPlanFeature( site, DotcomFeatures.COPY_SITE ) ).toBe( false );
	} );

	it( 'should return true if the plan has the feature', () => {
		const site = {
			plan: {
				features: {
					active: [ DotcomFeatures.COPY_SITE ],
				},
			},
		} as Site;
		expect( hasPlanFeature( site, DotcomFeatures.COPY_SITE ) ).toBe( true );
	} );
} );

describe( 'hasHostingFeature', () => {
	it( 'should return false if the site does not have active plan', () => {
		const site = {} as Site;
		expect( hasHostingFeature( site, HostingFeatures.BACKUPS ) ).toBe( false );
	} );

	it( 'should return false if the plan does not have the feature', () => {
		const site = {
			plan: {
				features: {
					active: [ HostingFeatures.SCAN ],
				},
			},
		} as Site;
		expect( hasHostingFeature( site, HostingFeatures.BACKUPS ) ).toBe( false );
	} );

	it( 'should return false if the site is hosted on WordPress.com but not Atomic yet, even though the plan has the feature', () => {
		const site = {
			plan: {
				features: {
					active: [ DotcomFeatures.ATOMIC, HostingFeatures.BACKUPS ],
				},
			},
			is_wpcom_atomic: false,
		} as Site;
		expect( hasHostingFeature( site, HostingFeatures.BACKUPS ) ).toBe( false );
	} );

	it( 'should return false if site is hosted on WordPress.com, and already Atomic, and the plan has the feature, but the plan already expired', () => {
		const site = {
			plan: {
				features: {
					active: [ DotcomFeatures.ATOMIC, HostingFeatures.BACKUPS ],
				},
				expired: true,
			},
			is_wpcom_atomic: true,
		} as Site;
		expect( hasHostingFeature( site, HostingFeatures.BACKUPS ) ).toBe( false );
	} );

	it( 'should return true if site is not hosted on WordPress.com, and the plan has the feature', () => {
		const site = {
			plan: {
				features: {
					active: [ HostingFeatures.BACKUPS ],
				},
			},
		} as Site;
		expect( hasHostingFeature( site, HostingFeatures.BACKUPS ) ).toBe( true );
	} );
} );
