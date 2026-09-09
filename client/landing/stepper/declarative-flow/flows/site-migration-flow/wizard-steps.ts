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
	// Scan and Preview are parked with their screens, so the header does not
	// number steps the user never reaches.
	{ slug: STEPS.SITE_MIGRATION_DESTINATION.slug, label: __( 'Choose' ) },
	{ slug: STEPS.SITE_MIGRATION_DOMAIN.slug, label: __( 'Domain' ) },
	{ slug: STEPS.SITE_MIGRATION_SEO.slug, label: __( 'SEO' ) },
	{ slug: STEPS.SITE_MIGRATION_REVIEW.slug, label: __( 'Review' ) },
];
