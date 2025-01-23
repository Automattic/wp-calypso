import { SITE_SETUP_FLOW } from '@automattic/onboarding';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { getFinalImporterUrl } from '../../internals/steps-repository/import/helper';

const isWpAdminImporter = ( importerPath: string ) =>
	importerPath.startsWith( 'http' ) || importerPath.startsWith( '/import' );

interface GoToImporterParams {
	platform: ImporterPlatform;
	siteId: string;
	siteSlug: string;
	backToFlow?: string;
	replaceHistory?: boolean;
	from?: string | null;
	ref?: string;
}

/**
 * @deprecated generate the full flow URL in your flow instead
 * @see backToFlow property
 */

const goTo = ( path: string, replaceHistory: boolean ) => {
	if ( replaceHistory ) {
		return window.location.replace( path );
	}

	return window.location.assign( path );
};

export const goToImporter = ( {
	platform,
	siteId,
	siteSlug,
	replaceHistory = false,
	backToFlow,
	from,
	ref,
}: GoToImporterParams ) => {
	const path = getFinalImporterUrl( siteSlug, from || '', platform, backToFlow );

	if ( isWpAdminImporter( path ) ) {
		return goTo( path, replaceHistory );
	}

	const stepURL = addQueryArgs(
		{
			siteId,
			siteSlug,
			ref: ref,
			...( platform === 'wordpress' ? { option: 'content' } : {} ),
		},
		`/setup/${ SITE_SETUP_FLOW }/${ path }`
	);

	return goTo( stepURL, replaceHistory );
};
