import { Onboard } from '@automattic/data-stores';
import {
	SITE_MIGRATION_FLOW,
	STATIC_SITE_IMPORT_FLOW,
	STATIC_SITE_IMPORT_PREVIEW_FLOW,
} from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { addQueryArgs } from 'calypso/lib/url';
import { withLocale } from '../../helpers/with-locale';
import { canUseStaticSiteImport } from '../static-site-import-flow/helpers';
import type {
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const ALL_STEPS = [ STEPS.SITE_MIGRATION_IDENTIFY, STEPS.STATIC_SITE_IMPORT_READING, STEPS.ERROR ];

/** The source, once identified or named on the flow's URL. */
const getSource = ( query: URLSearchParams ) => query.get( 'from' )?.trim() || '';

function initialize() {
	// A source on the URL skips identification.
	if ( getSource( new URLSearchParams( window.location.search ) ) ) {
		return stepsWithRequiredLogin( [ STEPS.STATIC_SITE_IMPORT_READING, STEPS.ERROR ] );
	}
	return stepsWithRequiredLogin( ALL_STEPS );
}

const staticSiteImportPreview: FlowV2< typeof initialize > = {
	name: STATIC_SITE_IMPORT_PREVIEW_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepsProps() {
		return {
			[ STEPS.STATIC_SITE_IMPORT_READING.slug ]: { buildPreview: true },
		};
	},
	useSideEffect() {
		const { setIntent, resetOnboardStore } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			resetOnboardStore();
			setIntent( Onboard.SiteIntent.SiteMigration );
		}, [ resetOnboardStore, setIntent ] );
	},

	useStepNavigation( _currentStep, navigate: NavigateV2< typeof ALL_STEPS > ) {
		const locale = useFlowLocale();
		const urlQueryParams = useQuery();
		const from = getSource( urlQueryParams );
		const platform = ( urlQueryParams.get( 'platform' ) || 'unknown' ) as ImporterPlatform;

		const exitFlow = ( to: string ) =>
			window.location.replace( addQueryArgs( { ref: STATIC_SITE_IMPORT_PREVIEW_FLOW }, to ) );

		const siteMigrationUrl = ( slug: string, args: Record< string, string | undefined > ) =>
			addQueryArgs( args, withLocale( `/setup/${ SITE_MIGRATION_FLOW }/${ slug }`, locale ) );

		const goToWordPressMigration = ( source: string, host?: string, isWpcom?: boolean ) =>
			exitFlow(
				siteMigrationUrl( STEPS.SITE_MIGRATION_CHECK.slug, {
					from: source,
					platform: 'wordpress',
					host: host || undefined,
					isWpcom: isWpcom ? 'true' : undefined,
				} )
			);

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const {
						action,
						from: source = '',
						platform: identifiedPlatform,
						host,
						isWpcom,
						staticSiteImportable,
					} = providedDependencies ?? { action: 'skip_platform_identification' };

					if ( action === 'continue' && identifiedPlatform === 'wordpress' && source ) {
						return goToWordPressMigration( source, host, isWpcom );
					}

					if (
						action === 'continue' &&
						staticSiteImportable &&
						canUseStaticSiteImport( identifiedPlatform as ImporterPlatform, source )
					) {
						return navigate(
							`${ STEPS.STATIC_SITE_IMPORT_READING.slug }?${ new URLSearchParams( {
								from: source,
								platform: identifiedPlatform ?? 'unknown',
							} ) }`
						);
					}

					// Parked, unhealthy and unrecognized sources take the regular migration paths.
					return exitFlow(
						siteMigrationUrl( STEPS.SITE_MIGRATION_IDENTIFY.slug, { from: source || undefined } )
					);
				}

				case STEPS.STATIC_SITE_IMPORT_READING.slug: {
					switch ( providedDependencies.action ) {
						case 'migrate':
							return goToWordPressMigration( from );
						case 'unavailable':
							return navigate( STEPS.ERROR.slug );
						// The server won't build a preview, so the customer can still move the site by
						// buying a plan for it first.
						case 'preview_failed':
							return exitFlow(
								addQueryArgs(
									{ from, platform },
									withLocale(
										`/setup/${ STATIC_SITE_IMPORT_FLOW }/${ STEPS.UNIFIED_PLANS.slug }`,
										locale
									)
								)
							);
					}

					const { importSessionId, previewSiteSlug } = providedDependencies;
					if ( ! previewSiteSlug ) {
						return navigate( STEPS.ERROR.slug );
					}
					return exitFlow(
						addQueryArgs(
							{ importSessionId, from, platform },
							dashboardLink( `/sites/${ previewSiteSlug }` )
						)
					);
				}
			}
		};

		return { submit };
	},
};

export default staticSiteImportPreview;
