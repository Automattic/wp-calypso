import { generatePath } from 'react-router';
import { Primitive } from 'utility-types';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';

/**
 * Builds a path helper function that can be used to build paths with query params and path params.
 * @param path - The path to build.
 * @returns A function that can be used to build paths with query params and path params.
 * @example
 * const path = buildPathHelper<{
 * 	queryParams: {
 * 		from: string;
 * 	};
 * 	params: {
 * 		id: string;
 * 	};
 * }>( '/test/:id' );
 *
 * path( { from: 'test' }, { id: '123' } ); // '/test/123?from=test'
 * path( { from: 'test' } ); // '/test?from=test'
 * path( null, { id: '123' } ); // '/test/123'
 */
export function buildPathHelper<
	T extends { queryParams?: Record< string, Primitive | null >; params?: Record< string, string > },
	U extends string = string,
>( path: U ) {
	return ( queryParams?: T[ 'queryParams' ] | null, params?: T[ 'params' ] ) => {
		const pathWithParams = generatePath(
			path as string,
			params as Record< string, string >
		) as `${ U }?${ string }`;

		if ( ! queryParams ) {
			return pathWithParams;
		}

		return addQueryArgs( queryParams, pathWithParams ) as `${ U }?${ string }`;
	};
}

export const siteCreationPath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			platform: ImporterPlatform;
			ssh?: string;
			host?: string;
			wizardComplete?: string;
			importSessionId?: string | null;
			archiveHash?: string | null;
		};
	},
	typeof STEPS.SITE_CREATION_STEP.slug
>( STEPS.SITE_CREATION_STEP.slug );

export const sitePickerPath = buildPathHelper<
	{
		queryParams: {
			from: string | null;
			platform: ImporterPlatform;
			ssh?: string;
			host?: string;
		};
	},
	typeof STEPS.PICK_SITE.slug
>( STEPS.PICK_SITE.slug );

export const importOrMigratePath = buildPathHelper<
	{
		queryParams: {
			from?: string;
			siteSlug: string;
			siteId?: number | string;
		};
	},
	typeof STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug
>( STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug );

export const howToMigratePath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			siteSlug: string;
			siteId?: number | string;
		};
	},
	typeof STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug
>( STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug );

export const processingPath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			platform: ImporterPlatform;
			action: string | null;
			host?: string | null;
			wizardComplete?: string;
		};
	},
	typeof STEPS.PROCESSING.slug
>( STEPS.PROCESSING.slug );

export const credentialsPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
			authorizationUrl?: string;
			backTo?: string;
			how?: string;
		};
	},
	typeof STEPS.SITE_MIGRATION_CREDENTIALS.slug
>( STEPS.SITE_MIGRATION_CREDENTIALS.slug );

export const upgradePlanPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
			destination?: string;
			how?: string;
			ssh?: string;
			host?: string;
		};
	},
	typeof STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug
>( STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug );

export const alreadyWpcomPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_ALREADY_WPCOM.slug
>( STEPS.SITE_MIGRATION_ALREADY_WPCOM.slug );

export const instructionsPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_INSTRUCTIONS.slug
>( STEPS.SITE_MIGRATION_INSTRUCTIONS.slug );

export const otherPlatformDetectedImportPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
			platform?: ImporterPlatform;
		};
	},
	typeof STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug
>( STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug );

export const applicationPasswordAuthorizationPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
			authorizationUrl?: string | null;
			success?: string | null;
			password?: string | null;
			user_login?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug
>( STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug );

export const fallbackCredentialsPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
			authorizationUrl?: string | null;
			backTo?: string;
		};
	},
	typeof STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug
>( STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug );

export const supportInstructionsPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug?: string;
			from?: string | null;
			preventTicketCreation?: boolean;
		};
	},
	typeof STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS.slug
>( STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS.slug );

export const sshVerificationPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug: string;
			from?: string | null;
			host?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_SSH_VERIFICATION.slug
>( STEPS.SITE_MIGRATION_SSH_VERIFICATION.slug );

export const sshShareAccessPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug: string;
			transferId?: number | string;
			from?: string | null;
			host?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_SSH_SHARE_ACCESS.slug
>( STEPS.SITE_MIGRATION_SSH_SHARE_ACCESS.slug );

export const sshInProgressPath = buildPathHelper<
	{
		queryParams: {
			siteId?: number | string;
			siteSlug: string;
		};
	},
	typeof STEPS.SITE_MIGRATION_SSH_IN_PROGRESS.slug
>( STEPS.SITE_MIGRATION_SSH_IN_PROGRESS.slug );

export const scanPath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			platform?: ImporterPlatform;
			siteId?: number | string;
			siteSlug?: string;
			switchRunId?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_SCAN.slug
>( STEPS.SITE_MIGRATION_SCAN.slug );

export const previewPath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			platform?: ImporterPlatform;
			siteId?: number | string;
			siteSlug?: string;
			switchRunId?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_PREVIEW.slug
>( STEPS.SITE_MIGRATION_PREVIEW.slug );

/**
 * "Reading your site". Carries the import session it starts on `importSessionId`,
 * which is not Stepper's own `sessionId` query parameter.
 */
export const capturePath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			platform?: ImporterPlatform;
			siteId?: number | string;
			siteSlug?: string;
			importSessionId?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_CAPTURE.slug
>( STEPS.SITE_MIGRATION_CAPTURE.slug );

export const plansPath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			platform?: ImporterPlatform;
			siteId?: number | string;
			siteSlug?: string;
			importSessionId?: string | null;
			archiveHash?: string | null;
		};
	},
	typeof STEPS.UNIFIED_PLANS.slug
>( STEPS.UNIFIED_PLANS.slug );

export const reviewPath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			platform?: ImporterPlatform;
			siteId?: number | string;
			siteSlug?: string;
			importSessionId?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_REVIEW.slug
>( STEPS.SITE_MIGRATION_REVIEW.slug );

export const importProgressPath = buildPathHelper<
	{
		queryParams: {
			from?: string | null;
			siteId?: number | string;
			siteSlug?: string;
			sessionId?: string | null;
			/** The import session, and the archive hash the user reviewed. */
			importSessionId?: string | null;
			archiveHash?: string | null;
		};
	},
	typeof STEPS.SITE_MIGRATION_IMPORT_PROGRESS.slug
>( STEPS.SITE_MIGRATION_IMPORT_PROGRESS.slug );

export const identifyPath = buildPathHelper<
	{
		queryParams: { from: string | null };
	},
	typeof STEPS.SITE_MIGRATION_IDENTIFY.slug
>( STEPS.SITE_MIGRATION_IDENTIFY.slug );

export const siteSetupImportListPath = buildPathHelper< {
	queryParams: {
		from: string | null;
		siteId?: number | string;
		siteSlug: string;
		origin: string;
		backToFlow: string;
	};
} >( `/setup/site-setup/${ STEPS.IMPORT_LIST.slug }` );

export const calypsoImporterPath = buildPathHelper< {
	queryParams: { engine: string; ref: string };
	params: { siteSlug: string };
} >( '/import/:siteSlug' );

export const siteSetupImportWordpressPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug: string;
		from: string;
		backToFlow: string;
	};
} >( '/setup/site-setup/importerWordpress' );

export const calypsoOverviewPath = buildPathHelper< {
	queryParams: { ref: string };
	params: { siteSlug: string };
} >( '/overview/:siteSlug' );

export const dashboardSiteSSHMigration = buildPathHelper< {
	queryParams: {
		'ssh-migration': 'completed' | 'failed';
	};
	params: {
		siteSlug: string;
	};
} >( '/sites/:siteSlug' );
