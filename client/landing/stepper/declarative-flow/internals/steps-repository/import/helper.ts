import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { camelCase } from 'lodash';
import { ImporterPlatform } from 'calypso/blocks/import/types';
import {
	getImporterUrl,
	getWpComOnboardingUrl,
	getWpOrgImporterUrl,
} from 'calypso/blocks/import/util';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
import { BASE_ROUTE } from './config';

export function getFinalImporterUrl(
	targetSlug: string,
	fromSite: string,
	platform: ImporterPlatform
) {
	let importerUrl;
	const encodedFromSite = encodeURIComponent( fromSite );
	const productImporters = [ 'blogger', 'medium', 'substack', 'squarespace', 'wix', 'wordpress' ];

	if ( productImporters.includes( platform ) ) {
		importerUrl = isEnabled( `onboarding/import-from-${ platform }` )
			? getWpComOnboardingUrl( targetSlug, platform, encodedFromSite )
			: getImporterUrl( targetSlug, platform, encodedFromSite );

		if ( platform === 'wordpress' && ! fromSite ) {
			importerUrl = addQueryArgs( importerUrl, {
				option: WPImportOption.CONTENT_ONLY,
			} );
		} else if ( platform === 'wix' && fromSite ) {
			importerUrl = addQueryArgs( importerUrl, {
				run: true,
			} );
		}
	} else {
		importerUrl = getWpOrgImporterUrl( targetSlug, platform );
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
