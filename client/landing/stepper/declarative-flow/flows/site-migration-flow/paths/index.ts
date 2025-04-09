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
	T extends { queryParams?: Record< string, Primitive >; params?: Record< string, Primitive > },
>( path: string ) {
	return ( queryParams?: T[ 'queryParams' ] | null, params?: T[ 'params' ] | null ) => {
		const pathWithParams = generatePath( path, params as Record< string, string > );

		if ( ! queryParams ) {
			return pathWithParams;
		}

		return addQueryArgs( queryParams, pathWithParams );
	};
}

export const siteCreationPath = buildPathHelper< {
	queryParams: {
		from?: string | null;
		skipMigration?: boolean;
	};
} >( STEPS.SITE_CREATION_STEP.slug );

export const sitePickerPath = buildPathHelper< {
	queryParams: { from: string | null };
} >( STEPS.PICK_SITE.slug );

export const importOrMigratePath = buildPathHelper< {
	queryParams: {
		from?: string;
		siteSlug: string;
		siteId?: number | string;
	};
} >( STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug );

export const howToMigratePath = buildPathHelper< {
	queryParams: {
		from?: string | null;
		siteSlug: string;
		siteId?: number | string;
	};
} >( STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug );

export const processingPath = buildPathHelper< {
	queryParams: {
		from?: string | null;
		skipMigration?: boolean;
	};
} >( STEPS.PROCESSING.slug );

export const credentialsPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
		authorizationUrl?: string;
		backTo?: string;
	};
} >( STEPS.SITE_MIGRATION_CREDENTIALS.slug );

export const upgradePlanPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
		destination?: string;
		how?: string;
	};
} >( STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug );

export const alreadyWpcomPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
	};
} >( STEPS.SITE_MIGRATION_ALREADY_WPCOM.slug );

export const instructionsPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
	};
} >( STEPS.SITE_MIGRATION_INSTRUCTIONS.slug );

export const otherPlatformDetectedImportPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
		platform?: ImporterPlatform;
	};
} >( STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug );

export const applicationPasswordAuthorizationPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
		authorizationUrl?: string | null;
		success?: string | null;
		password?: string | null;
		user_login?: string | null;
	};
} >( STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug );

export const fallbackCredentialsPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
	};
} >( STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug );

export const supportInstructionsPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug?: string;
		from?: string | null;
		preventTicketCreation?: boolean;
	};
} >( STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS.slug );

export const identifyPath = buildPathHelper< {
	queryParams: { from: string | null };
} >( STEPS.SITE_MIGRATION_IDENTIFY.slug );

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
		option: 'content';
		backToFlow: string;
	};
} >( '/setup/site-setup/importerWordpress' );

export const calypsoOverviewPath = buildPathHelper< {
	queryParams: { ref: string };
	params: { siteSlug: string };
} >( '/overview/:siteSlug' );

export const siteSetupGoalsPath = buildPathHelper< {
	queryParams: {
		siteId?: number | string;
		siteSlug: string;
	};
} >( '/setup/site-setup/goals' );
