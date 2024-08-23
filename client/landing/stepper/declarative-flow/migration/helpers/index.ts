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
	migrateEntireSiteStep?: StepperStep;
	replaceHistory?: boolean;
}

const getFlowPath = ( step: string ) => `/${ MIGRATION_FLOW }/${ step }`;
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
	backToStep,
	migrateEntireSiteStep,
	replaceHistory = false,
}: GoToImporterParams ) => {
	const backToFlow = backToStep ? getFlowPath( backToStep?.slug ) : undefined;
	const customizedActionGoToFlow = migrateEntireSiteStep
		? getFlowPath( migrateEntireSiteStep?.slug )
		: undefined;
	const path = getFinalImporterUrl( siteSlug, '', platform, backToFlow, customizedActionGoToFlow );

	if ( isWpAdminImporter( path ) ) {
		return goTo( path, replaceHistory );
	}

	const stepURL = addQueryArgs(
		{
			siteId,
			siteSlug,
			ref: MIGRATION_FLOW,
			...( platform === 'wordpress' ? { option: 'content' } : {} ),
		},
		`/setup/${ SITE_SETUP_FLOW }/${ path }`
	);

	return goTo( stepURL, replaceHistory );
};
