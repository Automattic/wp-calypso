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
	/**
	 * @deprecated use backToFlow instead
	 */
	backToStep?: StepperStep;
	backToFlow?: string;
	migrateEntireSiteStep?: StepperStep;
	replaceHistory?: boolean;
	from?: string | null;
	ref?: string;
}

/**
 * @deprecated generate the full flow URL in your flow instead
 * @see backToFlow property
 */
const getFlowPath = ( step: string ) => `/${ MIGRATION_FLOW }/${ step }`;

const goTo = ( path: string, replaceHistory: boolean ) => {
	if ( replaceHistory ) {
		return window.location.replace( path );
	}

	return window.location.assign( path );
};

const getBackToFlowFromStep = ( backToStep?: StepperStep ) => {
	if ( backToStep ) {
		return getFlowPath( backToStep.slug );
	}

	return undefined;
};

export const goToImporter = ( {
	platform,
	siteId,
	siteSlug,
	backToStep,
	migrateEntireSiteStep,
	replaceHistory = false,
	backToFlow,
	from,
	ref,
}: GoToImporterParams ) => {
	const backToFlowURL = backToFlow || getBackToFlowFromStep( backToStep );
	const customizedActionGoToFlow = migrateEntireSiteStep
		? getFlowPath( migrateEntireSiteStep?.slug )
		: undefined;
	const path = getFinalImporterUrl(
		siteSlug,
		from || '',
		platform,
		backToFlowURL,
		customizedActionGoToFlow
	);

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
