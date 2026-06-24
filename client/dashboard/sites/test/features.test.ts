import { canSwitchEnvironment } from '../features';
import type { Site } from '@automattic/api-core';

const baseSite = {
	ID: 1,
	slug: 'test-site',
	is_wpcom_atomic: true,
	is_wpcom_staging_site: false,
	is_a4a_dev_site: false,
	plan: { features: { active: [ 'staging-sites' ] } },
	site_migration: { in_progress: false, is_complete: false },
} as unknown as Site;

describe( 'canSwitchEnvironment', () => {
	test( 'returns true when the site has the staging feature', () => {
		expect( canSwitchEnvironment( baseSite ) ).toBe( true );
	} );

	test( 'returns false when site migration is in progress', () => {
		const migratingSite = {
			...baseSite,
			site_migration: {
				migration_status: 'migration-in-progress',
				in_progress: true,
				is_complete: false,
			},
		} as unknown as Site;
		expect( canSwitchEnvironment( migratingSite ) ).toBe( false );
	} );

	test( 'returns false for an A4A dev site', () => {
		const a4aDevSite = { ...baseSite, is_a4a_dev_site: true } as unknown as Site;
		expect( canSwitchEnvironment( a4aDevSite ) ).toBe( false );
	} );

	test( 'returns false when the site does not have the staging feature', () => {
		const siteWithoutStaging = {
			...baseSite,
			plan: { features: { active: [] } },
		} as unknown as Site;
		expect( canSwitchEnvironment( siteWithoutStaging ) ).toBe( false );
	} );
} );
