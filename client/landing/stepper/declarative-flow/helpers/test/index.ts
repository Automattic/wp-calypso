import { shouldRedirectToSiteMigration } from '..';
import { STEPS } from '../../internals/steps';
describe( 'DeclarativeFlowHelpers', () => {
	it( 'returns true when current step, platform and origin as set properly', () => {
		expect(
			shouldRedirectToSiteMigration(
				STEPS.IMPORT_LIST.slug,
				'wordpress',
				'site-migration-identify'
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
				'site-migration-identify'
			)
		).toBe( false );
	} );
} );
