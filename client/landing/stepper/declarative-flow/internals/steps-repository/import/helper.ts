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
	isAtomicSite: boolean | null,
	framework: 'signup' | 'stepper' = 'signup'
) {
	let importerUrl;

	// Escape WordPress, has two sub-flows "Import everything" and "Content only"
	// firstly show import type chooser screen and then decide about importer url
	if ( isAtomicSite && platform !== 'wordpress' ) {
		importerUrl = getWpOrgImporterUrl( targetSlug, platform );
	} else if (
		( platform === 'blogger' && isEnabled( 'onboarding/import-from-blogger' ) ) ||
		( platform === 'medium' && isEnabled( 'onboarding/import-from-medium' ) ) ||
		( platform === 'squarespace' && isEnabled( 'onboarding/import-from-squarespace' ) ) ||
		( platform === 'wix' && isEnabled( 'onboarding/import-from-wix' ) ) ||
		( platform === 'wordpress' && isEnabled( 'onboarding/import-from-wordpress' ) )
	) {
		importerUrl = getWpComOnboardingUrl( targetSlug, platform, fromSite, framework );
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
