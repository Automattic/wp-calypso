import { isEnabled } from '@automattic/calypso-config';
import { SiteDetails, SourceSiteMigrationDetails } from '@automattic/data-stores/src/site';
import { addQueryArgs } from '@wordpress/url';
import { camelCase } from 'lodash';
import wpcomRequest from 'wpcom-proxy-request';
import { ImporterPlatform } from 'calypso/blocks/import/types';
import {
	getImporterUrl,
	getWpComOnboardingUrl,
	getWpOrgImporterUrl,
} from 'calypso/blocks/import/util';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
import wpcom from 'calypso/lib/wp';
import { BASE_ROUTE } from './config';

export function getFinalImporterUrl(
	targetSlug: string,
	fromSite: string,
	platform: ImporterPlatform,
	isAtomicSite: boolean | null,
	framework: 'signup' | 'stepper' = 'signup'
) {
	let importerUrl;

	// Escape WordPress, has two sub-flows "Import everything" and "Content only"
	// firstly show import type chooser screen and then decide about importer url
	if ( isAtomicSite && platform !== 'wordpress' ) {
		importerUrl = getWpOrgImporterUrl( targetSlug, platform );
	} else if (
		[ 'blogger', 'medium', 'squarespace', 'wix', 'wordpress' ].some( ( targetPlatform ) => {
			return (
				platform === targetPlatform && isEnabled( `onboarding/import-from-${ targetPlatform }` )
			);
		} )
	) {
		importerUrl = getWpComOnboardingUrl( targetSlug, platform, fromSite, framework );

		if ( platform === 'wordpress' && ! fromSite && isAtomicSite ) {
			importerUrl = getWpOrgImporterUrl( targetSlug, platform );
		} else if ( platform === 'wordpress' && ! fromSite ) {
			importerUrl = addQueryArgs( importerUrl, {
				option: WPImportOption.CONTENT_ONLY,
			} );
		}
	} else {
		importerUrl = getImporterUrl( targetSlug, platform, fromSite );
	}

	return importerUrl;
}

/**
 * Stepper's redirection handlers
 * generateStepPath share the same interface/params between 'signup' & 'stepper' frameworks
 */
export function generateStepPath( stepName: string, stepSectionName?: string ) {
	if ( stepName === 'intent' ) {
		return 'goals';
	} else if ( stepName === 'capture' ) {
		return BASE_ROUTE;
	}

	const routes = [ BASE_ROUTE, stepName, stepSectionName ];
	const path = routes.join( '_' );

	return camelCase( path ) as string;
}

export async function addTempSiteToSourceOption( targetBlogId: number, sourceSiteSlug: string ) {
	return wpcom.req
		.post( {
			path: `/migrations/from-source/${ sourceSiteSlug }`,
			apiNamespace: 'wpcom/v2',
			body: {
				target_blog_id: targetBlogId,
			},
		} )
		.catch( ( error: Error ) => {
			// eslint-disable-next-line no-console
			console.error( 'Unable to store option in source site', error );
		} );
}

export function getSite( sourceSiteSlug: string ) {
	return wpcomRequest< SiteDetails >( {
		path: '/sites/' + encodeURIComponent( sourceSiteSlug as string ),
		apiVersion: '1.1',
	} );
}

export function getSourceSiteMigrationData(
	sourceId: number
): Promise< SourceSiteMigrationDetails > {
	return wpcom.req.get( {
		path: '/migrations/from-source/' + encodeURIComponent( sourceId as number ),
		apiNamespace: 'wpcom/v2',
	} );
}
