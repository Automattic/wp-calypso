import { isEnabled } from '@automattic/calypso-config';
import { WITH_THEME_ASSEMBLER_FLOW, ASSEMBLER_FIRST_FLOW } from '@automattic/onboarding';

export default function getSiteAssemblerUrl( {
	isLoggedIn,
	selectedSite,
	shouldGoToAssemblerStep,
	siteEditorUrl,
} ) {
	if ( isLoggedIn && selectedSite && ! shouldGoToAssemblerStep ) {
		return siteEditorUrl;
	}

	const params = new URLSearchParams( { ref: 'calypshowcase' } );
	if ( isEnabled( 'themes/assembler-first' ) ) {
		return `/setup/${ ASSEMBLER_FIRST_FLOW }?${ params }`;
	}

	// Redirect people to create a site first if they don't log in or they have no sites.
	const basePathname = isLoggedIn && selectedSite ? '/setup' : '/start';

	if ( selectedSite?.slug ) {
		params.set( 'siteSlug', selectedSite.slug );
	}

	return `${ basePathname }/${ WITH_THEME_ASSEMBLER_FLOW }?${ params }`;
}
