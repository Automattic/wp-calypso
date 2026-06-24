import { canSwitchEnvironment } from '../features';
import type { Site, User } from '@automattic/api-core';

const ownerUser = { ID: 1 } as User;
const secondaryAdminUser = { ID: 2 } as User;

const baseSite = {
	ID: 1,
	slug: 'test-site',
	site_owner: 1,
	is_wpcom_atomic: true,
	is_wpcom_staging_site: false,
	is_a4a_dev_site: false,
	plan: { features: { active: [ 'staging-sites' ] } },
	site_migration: { in_progress: false, is_complete: false },
} as unknown as Site;

describe( 'canSwitchEnvironment', () => {
	test( 'returns true for the site owner with staging feature', () => {
		expect( canSwitchEnvironment( baseSite, ownerUser ) ).toBe( true );
	} );

	test( 'returns false for a secondary admin (non-owner)', () => {
		expect( canSwitchEnvironment( baseSite, secondaryAdminUser ) ).toBe( false );
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
		expect( canSwitchEnvironment( migratingSite, ownerUser ) ).toBe( false );
	} );

	test( 'returns false when site does not have staging feature', () => {
		const siteWithoutStaging = {
			...baseSite,
			plan: { features: { active: [] } },
		} as unknown as Site;
		expect( canSwitchEnvironment( siteWithoutStaging, ownerUser ) ).toBe( false );
	} );
} );
