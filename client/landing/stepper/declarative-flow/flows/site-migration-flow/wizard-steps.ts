import { __ } from '@wordpress/i18n';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import type { MigrationWizardProgressStep } from '../../internals/steps-repository/components/migration-wizard-progress';

/**
 * The canonical list of numbered wizard screens for the non-WordPress migration
 * path, in order. Both the routing and the progress header read it, so the
 * labels and the slugs cannot drift apart.
 */
export const getMigrationWizardSteps = (): MigrationWizardProgressStep[] => [
	{ slug: STEPS.SITE_MIGRATION_IDENTIFY.slug, label: __( 'Your site' ) },
	{ slug: STEPS.SITE_MIGRATION_CAPTURE.slug, label: __( 'Reading your site' ) },
	{ slug: STEPS.SITE_MIGRATION_REVIEW.slug, label: __( 'Review' ) },
];
