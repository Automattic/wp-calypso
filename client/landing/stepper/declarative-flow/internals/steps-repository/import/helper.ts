import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { camelCase } from 'lodash';
import {
	getImporterUrl,
	getWpComOnboardingUrl,
	getWpOrgImporterUrl,
} from 'calypso/blocks/import/util';
import { getImporterEngines } from 'calypso/lib/importer/importer-config';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { BASE_ROUTE } from './config';

export function getFinalImporterUrl(
	targetSlug: string,
	fromSite: string,
	platform: ImporterPlatform,
	backToFlow?: string,
	customizedActionGoToFlow?: string
) {
	let importerUrl;
	const encodedFromSite = encodeURIComponent( fromSite );
	const productImporters = getImporterEngines();

	if ( productImporters.includes( platform ) ) {
		importerUrl = isEnabled( `onboarding/import-from-${ platform }` )
			? getWpComOnboardingUrl( targetSlug, platform, encodedFromSite )
			: getImporterUrl( targetSlug, platform, encodedFromSite );

		if ( platform === 'wix' && fromSite ) {
			importerUrl = addQueryArgs( importerUrl, {
				run: true,
			} );
		}
	} else {
		importerUrl = getWpOrgImporterUrl( targetSlug, platform );
	}

	if ( backToFlow ) {
		importerUrl = addQueryArgs( importerUrl, {
			backToFlow,
		} );
	}

	if ( customizedActionGoToFlow ) {
		importerUrl = addQueryArgs( importerUrl, {
			customizedActionGoToFlow,
		} );
	}

	return importerUrl;
}

/**
 * Stepper's redirection handlers
 */
export function generateStepPath( stepName: string, stepSectionName?: string ) {
	switch ( stepName ) {
		case 'intent':
		case 'goals':
			return 'goals';

		case 'capture':
			return BASE_ROUTE;

		default: {
			const routes = [ BASE_ROUTE, stepName, stepSectionName ];
			const path = routes.join( '_' );

			return camelCase( path ) as string;
		}
	}
}

/**
 * Returns true if the platform is importable
 *
 * @param platform - The platform to check
 * @returns True if the platform is importable, false otherwise
 */
export function isPlatformImportable( platform: ImporterPlatform ) {
	const productImporters = getImporterEngines();
	return productImporters.includes( platform );
}

/**
 * Returns the full importer URL for the given platform
 *
 * @param platform - The platform to get the importer URL for
 * @param targetSlug - The target slug for the importer URL
 * @param fromSite - The from site for the importer URL
 */
export function getFullImporterUrl(
	platform: ImporterPlatform,
	targetSlug: string,
	fromSite: string
) {
	if ( ! isPlatformImportable( platform ) ) {
		return getWpOrgImporterUrl( targetSlug, platform );
	}

	const hasSiteSetupImporter = [ 'blogger', 'medium', 'squarespace', 'wix', 'wordpress' ];
	if ( hasSiteSetupImporter.includes( platform ) ) {
		let url = '/setup/site-setup/' + getWpComOnboardingUrl( targetSlug, platform, fromSite );

		if ( platform === 'wix' ) {
			url = addQueryArgs( url, {
				run: true,
			} );
		}

		return url;
	}

	return getImporterUrl( targetSlug, platform, fromSite );
}
