import { SITE_SETUP_FLOW } from '@automattic/onboarding';
import { useHref, useLocation } from 'react-router-dom';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { getFinalImporterUrl } from '../../internals/steps-repository/import/helper';

type PartialImporter = string;

const isWPOrgImporter = ( importer: PartialImporter ) =>
	importer.startsWith( 'http' ) || importer.startsWith( '/import' );

export const parsePartial = ( partial: PartialImporter, siteSlug: string ) => {
	return partial.replace( '{site}', siteSlug );
};

export const useImporterNavigator = () => {
	const location = useLocation();
	const backToFlow = useHref( location.pathname );

	const getPartial = ( platform: ImporterPlatform ): PartialImporter => {
		return getFinalImporterUrl( '{site}', '', platform, backToFlow );
	};

	const goToImporter = ( importer: PartialImporter, siteId: string, siteSlug: string ) => {
		if ( isWPOrgImporter( importer ) ) {
			return window.location.replace( parsePartial( importer, siteSlug ) );
		}

		return window.location.replace(
			addQueryArgs(
				{
					siteId,
					siteSlug,
					...( importer === 'importerWordpress' ? { option: 'content' } : {} ),
				},
				`/setup/${ SITE_SETUP_FLOW }/${ importer }`
			)
		);
	};

	return {
		getPartial,
		goToImporter,
	};
};
