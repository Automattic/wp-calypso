import { SITE_SETUP_FLOW } from '@automattic/onboarding';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { getFinalImporterUrl } from '../../internals/steps-repository/import/helper';

export const getPartialImporterURL = ( platform: ImporterPlatform ) => {
	return getFinalImporterUrl( '{site}', '', platform );
};

export const getWPOrgImporterURL = ( partial: string, siteSlug: string ) => {
	return partial.replace( '{site}', siteSlug );
};

const isWPOrgImporter = ( importer: string ) =>
	importer.startsWith( 'http' ) || importer.startsWith( '/import' );

export const goToImporter = (
	importer: string,
	siteId: string,
	siteSlug: string,
	backToStep?: {
		step: string;
		flow: string;
	}
) => {
	if ( isWPOrgImporter( importer ) ) {
		return window.location.replace( getWPOrgImporterURL( importer, siteSlug ) );
	}

	return window.location.replace(
		addQueryArgs(
			{
				siteId,
				siteSlug,

				...( backToStep ? { backToFlow: `${ backToStep.flow }/${ backToStep.step }` } : {} ),
				...( importer === 'importerWordpress' ? { option: 'content' } : {} ),
			},
			`/setup/${ SITE_SETUP_FLOW }/${ importer }`
		)
	);
};
