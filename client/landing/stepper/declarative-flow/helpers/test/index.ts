import { shouldRedirectToSiteMigration } from '..';
import { STEPS } from '../../internals/steps';
describe( 'DeclarativeFlowHelpers', () => {
	it( 'returns true when current step, platform and origin as set properly', () => {
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				'wordpress',
				'en',
				STEPS.SITE_MIGRATION_IDENTIFY.slug
			)
		).toBe( true );
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				'wordpress',
				'en-gb',
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
				'en',
				STEPS.SITE_MIGRATION_IDENTIFY.slug
			)
		).toBe( false );
	} );

	it( 'returns false when locale is not en', () => {
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				'wordpress',
				'es',
				STEPS.SITE_MIGRATION_IDENTIFY.slug
			)
		).toBe( false );
	} );

	it( 'returns false when the origin is not set', () => {
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				STEPS.SITE_MIGRATION_IDENTIFY.slug,
				'en',
				null
			)
		).toBe( false );
	} );

	it( 'returns false when the origin is not the site-migration-identify', () => {
		expect(
			shouldRedirectToSiteMigration( STEPS.IMPORT_LIST.slug, 'wordpress', 'en', 'other-origin' )
		).toBe( false );
	} );
} );
