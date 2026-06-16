import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { ENTREPRENEUR_FLOW, SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { anonIdCache, useCachedAnswers } from 'calypso/data/segmentaton-survey';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useEntrepreneurAdminDestination } from 'calypso/landing/stepper/hooks/use-entrepreneur-admin-destination';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import {
	SESSION_KEY_FROM_PLAYGROUND_PUBLISH,
	SESSION_KEY_PLAYGROUND_ID,
} from '../../internals/steps-repository/playground/lib/constants';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { ENTREPRENEUR_TRIAL_SURVEY_KEY } from '../../internals/steps-repository/segmentation-survey';
import type { Flow, ProvidedDependencies, StepperStep } from '../../internals/types';

const SEGMENTATION_SURVEY_SLUG = 'start';

const entrepreneurFlow: Flow = {
	name: ENTREPRENEUR_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,

	useSteps() {
		const [ searchParams ] = useSearchParams();

		useEffect( () => {
			if ( searchParams.get( 'from' ) === 'playground-publish' ) {
				sessionStorage.setItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH, '1' );
			}
			const playgroundId = searchParams.get( 'playground' );
			if ( playgroundId ) {
				sessionStorage.setItem( SESSION_KEY_PLAYGROUND_ID, playgroundId );
			}
		}, [ searchParams ] );

		const isPlaygroundPublish =
			searchParams.get( 'from' ) === 'playground-publish' ||
			sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) === '1';

		// When launched from the Playground publish flow skip straight to site
		// creation — the WC trial is provisioned in SITE_CREATION_STEP regardless.
		if ( isPlaygroundPublish ) {
			return stepsWithRequiredLogin( [
				STEPS.SITE_CREATION_STEP,
				STEPS.PROCESSING,
				STEPS.IMPORTER_PLAYGROUND,
				STEPS.ERROR,
			] );
		}

		// Replacing the `segmentation-survey` slug with `start` as having the
		// word `survey` in the address bar might discourage users from continuing.
		const surveyStep = {
			...STEPS.SEGMENTATION_SURVEY,
			...{ slug: SEGMENTATION_SURVEY_SLUG as StepperStep[ 'slug' ] },
		} as StepperStep;

		return [
			surveyStep,
			...stepsWithRequiredLogin( [
				STEPS.TRIAL_ACKNOWLEDGE,
				STEPS.SITE_CREATION_STEP,
				STEPS.PROCESSING,
				STEPS.WAIT_FOR_ATOMIC,
				STEPS.WAIT_FOR_PLUGIN_INSTALL,
				STEPS.ERROR,
			] ),
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const { setPluginsToVerify } = useDispatch( ONBOARD_STORE );
		setPluginsToVerify( [ 'woocommerce' ] );

		const [ isMigrationFlow, setIsMigrationFlow ] = useState( false );
		const [ lastQuestionPath, setlastQuestionPath ] = useState( '#1' );
		const { clearAnswers } = useCachedAnswers( ENTREPRENEUR_TRIAL_SURVEY_KEY );

		const { siteId, siteSlug } = useSiteData();

		const entrepreneurAdminDestination = useEntrepreneurAdminDestination();
		const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

		const goBack = () => {
			if ( currentStep === STEPS.TRIAL_ACKNOWLEDGE.slug ) {
				navigate( SEGMENTATION_SURVEY_SLUG + lastQuestionPath );
			}
		};

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const siteSlugDependency = providedDependencies?.siteSlug as string | undefined;
			const siteIdDependency = providedDependencies?.siteId as string | number | undefined;

			const navigateWithSiteId = ( url: string, extraData?: any, replace?: boolean ) => {
				const urlWithSiteId = addQueryArgs( url, { siteId: siteId || siteIdDependency } );

				return navigate( urlWithSiteId, extraData, replace );
			};

			switch ( currentStep ) {
				case SEGMENTATION_SURVEY_SLUG as StepperStep[ 'slug' ]: {
					setIsMigrationFlow( !! providedDependencies.isMigrationFlow );

					if ( providedDependencies.lastQuestionPath ) {
						setlastQuestionPath( providedDependencies.lastQuestionPath as string );
					}

					if (
						isEnabled( 'entrepreneur/skip-trial-for-migration' ) &&
						providedDependencies.isMigrationFlow
					) {
						const migrationFlowUrl = addQueryArgs(
							`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_CREATION_STEP.slug }`,
							{
								siteSlug: siteSlug || siteSlugDependency,
								siteId: siteId || siteIdDependency,
								ref: 'entrepreneur-signup',
								how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
								action: 'migrate',
							}
						);

						return window.location.assign( migrationFlowUrl );
					}

					return navigate( STEPS.TRIAL_ACKNOWLEDGE.slug );
				}

				case STEPS.TRIAL_ACKNOWLEDGE.slug: {
					// After the trial acknowledge step, the answers from the segmentation survey are cleared.
					clearAnswers();

					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					return navigate( STEPS.PROCESSING.slug, {
						currentStep,
					} );
				}

				case STEPS.PROCESSING.slug: {
					const processingResult = providedDependencies.processingResult as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigateWithSiteId( STEPS.ERROR.slug );
					}

					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return navigateWithSiteId( STEPS.WAIT_FOR_PLUGIN_INSTALL.slug, {
							siteId: siteId || siteIdDependency,
							siteSlug: siteSlug || siteSlugDependency,
						} );
					}

					if ( providedDependencies?.pluginsInstalled ) {
						if ( isMigrationFlow ) {
							// If the user is migrating a site, send them to the DIFM credentials step in the site migration flow.
							const migrationFlowUrl = addQueryArgs(
								`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_CREATION_STEP.slug }`,
								{
									siteSlug: siteSlug || siteSlugDependency,
									siteId: siteId || siteIdDependency,
									ref: 'entrepreneur-signup',
									how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
								}
							);

							return window.location.assign( migrationFlowUrl );
						}

						if ( entrepreneurAdminDestination ) {
							return window.location.assign( entrepreneurAdminDestination );
						} else if ( siteAdminUrl ) {
							return window.location.assign( siteAdminUrl );
						}

						// Default to /home if we don't have the site admin URL.
						// We shouldn't get here, but better safe than sorry.
						return window.location.assign( `/home/${ siteId }` );
					}

					const storedPlaygroundId = sessionStorage.getItem( SESSION_KEY_PLAYGROUND_ID );
					if (
						sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) === '1' &&
						storedPlaygroundId
					) {
						return navigateWithSiteId(
							addQueryArgs( STEPS.IMPORTER_PLAYGROUND.slug, {
								siteSlug: siteSlug || siteSlugDependency,
								playground: storedPlaygroundId,
							} )
						);
					}

					return navigateWithSiteId( STEPS.WAIT_FOR_ATOMIC.slug, {
						siteId: siteId || siteIdDependency,
						siteSlug: siteSlug || siteSlugDependency,
					} );
				}

				case STEPS.WAIT_FOR_ATOMIC.slug: {
					return navigateWithSiteId( STEPS.PROCESSING.slug, {
						currentStep,
						siteId: siteId || siteIdDependency,
						siteSlug: siteSlug || siteSlugDependency,
					} );
				}

				case STEPS.WAIT_FOR_PLUGIN_INSTALL.slug: {
					return navigateWithSiteId( STEPS.PROCESSING.slug, {
						currentStep,
						siteId: siteId || siteIdDependency,
						siteSlug: siteSlug || siteSlugDependency,
					} );
				}

				case STEPS.IMPORTER_PLAYGROUND.slug: {
					// Import complete — clear Playground session flags before leaving.
					sessionStorage.removeItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH );
					sessionStorage.removeItem( SESSION_KEY_PLAYGROUND_ID );
					if ( siteAdminUrl ) {
						return window.location.assign( siteAdminUrl );
					}
					return window.location.assign( `/home/${ siteId }` );
				}
			}
			return providedDependencies;
		}

		return { goBack, submit };
	},

	useSideEffect( currentStepSlug ) {
		const isLoggedIn = useSelector( isUserLoggedIn );

		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			// We need to store the anonymous user ID in localStorage because
			// we need to pass it to the server on site creation, i.e. after the user signs up or logs in.
			const anonymousUserId = getTracksAnonymousUserId();
			if ( anonymousUserId ) {
				anonIdCache.store( anonymousUserId );
			}
		}, [ isLoggedIn ] );

		useEffect( () => {
			// We only need to reset the store when the flow is mounted.
			if ( ! currentStepSlug ) {
				resetOnboardStore();
			}
		}, [ currentStepSlug, resetOnboardStore ] );
	},
};

export default entrepreneurFlow;
