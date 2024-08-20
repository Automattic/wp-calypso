import { MIGRATION_FLOW, SITE_SETUP_FLOW } from '@automattic/onboarding';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { getFinalImporterUrl } from '../../internals/steps-repository/import/helper';
import { StepperStep } from '../../internals/types';

const isWpAdminImporter = ( importerPath: string ) =>
	importerPath.startsWith( 'http' ) || importerPath.startsWith( '/import' );

interface GoToImporterParams {
	platform: ImporterPlatform;
	siteId: string;
	siteSlug: string;
	backToStep?: StepperStep;
}

const getBackToFlowParam = ( step: string ) => `/${ MIGRATION_FLOW }/${ step }`;

export const goToImporter = ( { platform, siteId, siteSlug, backToStep }: GoToImporterParams ) => {
	const backToFlow = backToStep ? getBackToFlowParam( backToStep?.slug ) : undefined;
	const path = getFinalImporterUrl( siteSlug, '', platform, backToFlow );

	if ( isWpAdminImporter( path ) ) {
		return window.location.replace( path );
	}

	return window.location.replace(
		addQueryArgs(
			{
				siteId,
				siteSlug,
				ref: MIGRATION_FLOW,
				...( platform === 'wordpress' ? { option: 'content' } : {} ),
			},
			`/setup/${ SITE_SETUP_FLOW }/${ path }`
		)
	);
};
