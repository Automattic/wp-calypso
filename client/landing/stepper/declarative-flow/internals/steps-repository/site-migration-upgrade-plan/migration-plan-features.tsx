import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
} from '@automattic/calypso-products';
import { __ } from '@wordpress/i18n';
import type { PlanSlug } from '@automattic/calypso-products';

const jetpackFeatures = [
	__( 'In-depth site analytics dashboard' ),
	__( 'SEO, marketing, and analytics tools' ),
	__( 'Plugin auto-updates' ),
	__( 'Real-time backups and one-click restores' ),
];

const businessFeatures = [
	__( 'Unrestricted bandwidth and visitors' ),
	__( 'Install plugins and themes' ),
	__( 'SFTP/SSH, WP-CLI, Git tools' ),
];

export const migrationPlanFeatures: Record< PlanSlug, string[] > = {
	[ PLAN_BUSINESS ]: [
		__( '50% off your first year' ),
		__( '39% annual savings' ),
		__( 'Free domain for a year' ),
		__( 'Free migration service' ),
		__( 'Refundable within 14 days' ),
		...businessFeatures,
		...jetpackFeatures,
	],
	[ PLAN_BUSINESS_MONTHLY ]: [
		__( 'No first year discount' ),
		__( 'No annual savings' ),
		__( 'No free domain' ),
		__( 'Free migration service' ),
		__( 'Refundable within 7 days' ),
		...businessFeatures,
		...jetpackFeatures,
	],
	[ PLAN_BUSINESS_2_YEARS ]: [
		__( '50% off your first two years' ),
		__( '52% annual savings' ),
		__( 'Free domain for a year' ),
		__( 'Free migration service' ),
		__( 'Refundable within 14 days' ),
		...businessFeatures,
		...jetpackFeatures,
	],
};
