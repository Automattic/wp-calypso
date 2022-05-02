import { isEnabled } from '@automattic/calypso-config';
import { camelCase } from 'lodash';
import { ImporterPlatform } from 'calypso/signup/steps/import/types';
import {
	getImporterUrl,
	getWpComOnboardingUrl,
	getWpOrgImporterUrl,
} from 'calypso/signup/steps/import/util';
import { BASE_ROUTE } from './config';
import type { StepPath } from '../../steps-repository';

export function getFinalImporterUrl(
	targetSlug: string,
	fromSite: string,
	platform: ImporterPlatform,
	isAtomicSite: boolean | null
) {
	let importerUrl;

	// Escape WordPress, has two sub-flows "Import everything" and "Content only"
	// firstly show import type chooser screen and then decide about importer url
	if ( isAtomicSite && platform !== 'wordpress' ) {
		importerUrl = getWpOrgImporterUrl( targetSlug, platform );
	} else if (
		[ 'blogger', 'medium', 'squarespace', 'wix', 'wordpress' ].some( ( platform ) =>
			isEnabled( `onboarding/import-from-${ platform }` )
		)
	) {
		importerUrl = getWpComOnboardingUrl( targetSlug, platform, fromSite );
	} else {
		importerUrl = getImporterUrl( targetSlug, platform, fromSite );
	}

	return importerUrl;
}

export function generateStepPath( stepName: string, stepSectionName?: string ): StepPath {
	// In the stepper framework, the capture screen is on `import` route (instead of `importCapture`)
	const excludeStepName = 'capture';
	const routes = [ BASE_ROUTE, stepName, stepSectionName ].filter( ( x ) => x !== 'capture' );
	const path = routes.join( '_' ).replace( excludeStepName, '' );

	return camelCase( path ) as StepPath;
}
