import { MIGRATION_FLOW, SITE_SETUP_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { getFinalImporterUrl } from '../../internals/steps-repository/import/helper';
import { StepperStep } from '../../internals/types';

const isWpAdminImporter = ( importerPath: string ) =>
	importerPath.startsWith( 'http' ) || importerPath.startsWith( '/import' );

interface GoToImporterParams {
	platform: ImporterPlatform;
	siteId: string;
	siteSlug: string;
	backToStep?: StepperStep;
	replaceHistory?: boolean;
	customizedActionButton?: {
		step: string;
		flow: string;
		label: string;
	};
}

const getBackToFlowParam = ( step: string ) => `/${ MIGRATION_FLOW }/${ step }`;
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
	replaceHistory = false,
	customizedActionButton,
}: GoToImporterParams ) => {
	const backToFlow = backToStep ? getBackToFlowParam( backToStep?.slug ) : undefined;
	const path = getFinalImporterUrl( siteSlug, '', platform, backToFlow );

	if ( isWpAdminImporter( path ) ) {
		return goTo( path, replaceHistory );
	}

	const stepURL = addQueryArgs( `/setup/${ SITE_SETUP_FLOW }/${ path }`, {
		siteId,
		siteSlug,
		ref: MIGRATION_FLOW,
		...( platform === 'wordpress' ? { option: 'content' } : {} ),
		...( customizedActionButton
			? {
					customizedActionFlow: `${ customizedActionButton.flow }/${ customizedActionButton.step }`,
					customizedActionLabel: customizedActionButton.label,
			  }
			: {} ),
	} );

	return goTo( stepURL, replaceHistory );
};
