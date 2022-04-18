import { isEnabled } from '@automattic/calypso-config';
import { ImporterPlatform } from 'calypso/signup/steps/import/types';
import {
	getWpComOnboardingUrl,
	getWpOrgImporterUrl,
	getImporterUrl,
} from 'calypso/signup/steps/import/util';

export function redirect( to: string ) {
	window.location.href = to;
}

export function removeTrailingSlash( str: string ) {
	return str.replace( /\/+$/, '' );
}

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
		( platform === 'blogger' && isEnabled( 'onboarding/import-from-blogger' ) ) ||
		( platform === 'medium' && isEnabled( 'onboarding/import-from-medium' ) ) ||
		( platform === 'squarespace' && isEnabled( 'onboarding/import-from-squarespace' ) ) ||
		( platform === 'wix' && isEnabled( 'onboarding/import-from-wix' ) ) ||
		( platform === 'wordpress' && isEnabled( 'onboarding/import-from-wordpress' ) )
	) {
		importerUrl = getWpComOnboardingUrl( targetSlug, platform, fromSite );
	} else {
		importerUrl = getImporterUrl( targetSlug, platform, fromSite );
	}

	return importerUrl;
}
