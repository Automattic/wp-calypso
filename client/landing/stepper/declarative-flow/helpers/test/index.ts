import { shouldRedirectToSiteMigration } from '..';
import { STEPS } from '../../internals/steps';
describe( 'DeclarativeFlowHelpers', () => {
	it( 'returns true when current step, platform and origin as set properly', () => {
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				'wordpress',
				STEPS.SITE_MIGRATION_IDENTIFY.slug
			)
		).toBe( true );
	} );

	it( 'returns false when current step is not importList', () => {
		expect(
			shouldRedirectToSiteMigration( 'other-step', 'wordpress', 'site-migration-identify' )
		).toBe( false );
	} );

	it( 'returns false when platform is not wordpress', () => {
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				'other-platform',
				STEPS.SITE_MIGRATION_IDENTIFY.slug
			)
		).toBe( false );
	} );

	it( 'returns false when the origin is not set', () => {
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				STEPS.SITE_MIGRATION_IDENTIFY.slug,
				null
			)
		).toBe( false );
	} );

	it( 'returns false when the origin is not the site-migration-identify', () => {
		expect(
			shouldRedirectToSiteMigration( STEPS.IMPORT_LIST.slug, 'wordpress', 'other-origin' )
		).toBe( false );
	} );
} );
