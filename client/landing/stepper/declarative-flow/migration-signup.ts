import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { MIGRATION_SIGNUP_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/url';
import { useSiteData } from '../hooks/use-site-data';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { goToCheckout } from '../utils/checkout';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { type SiteMigrationIdentifyAction } from './internals/steps-repository/site-migration-identify';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { SiteSelect, UserSelect } from '@automattic/data-stores';

const FLOW_NAME = MIGRATION_SIGNUP_FLOW;

const migrationSignup: Flow = {
	name: FLOW_NAME,
	isSignupFlow: true,

	useSteps() {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			resetOnboardStore();
		}, [] );

		return stepsWithRequiredLogin( [
			STEPS.SITE_MIGRATION_IDENTIFY,
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.SITE_MIGRATION_UPGRADE_PLAN,
			STEPS.SITE_MIGRATION_INSTRUCTIONS,
			STEPS.SITE_MIGRATION_STARTED,
			STEPS.ERROR,
		] );
	},

	useSideEffect( currentStep, navigate ) {
		const { siteSlug, siteId } = useSiteData();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );

		// Ensure we navigate to the site creation step if we have a logged-in user,
		// we don't have a site defined, and we are not on the site creation, processing, or error steps.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				return;
			}

			if (
				[ STEPS.SITE_CREATION_STEP.slug, STEPS.PROCESSING.slug, STEPS.ERROR.slug ].includes(
					currentStep
				)
			) {
				return;
			}

			if ( ! siteSlug && ! siteId ) {
				navigate( addQueryArgs( { from: fromQueryParam }, STEPS.SITE_CREATION_STEP.slug ) );
			}
		}, [ fromQueryParam, siteSlug, siteId, userIsLoggedIn ] );
	},

	useStepNavigation( currentStep, navigate ) {
		const siteSlugParam = useSiteSlugParam();
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );

		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		// TODO - We may need to add `...params: string[]` back once we start adding more steps.
		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug ) || urlQueryParams.get( 'siteId' );

			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const { from, platform, action } = providedDependencies as {
						from: string;
						platform: string;
						action: SiteMigrationIdentifyAction;
					};

					if ( action === 'skip_platform_identification' || platform !== 'wordpress' ) {
						return exitFlow(
							addQueryArgs(
								{
									siteId,
									siteSlug,
									from,
									origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
									backToFlow: `/${ FLOW_NAME }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
								},
								'/setup/site-setup/importList'
							)
						);
					}

					return navigate(
						addQueryArgs( { from: from, siteSlug, siteId }, STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug )
					);
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					return navigate(
						addQueryArgs( { from: fromQueryParam, siteSlug, siteId }, STEPS.PROCESSING.slug )
					);
				}

				case STEPS.PROCESSING.slug: {
					// If we just created the site, either go to the upgrade plan step, or the site identification step.
					if ( providedDependencies?.siteId && providedDependencies?.siteSlug ) {
						if ( ! fromQueryParam ) {
							return navigate(
								addQueryArgs( { siteId, siteSlug }, STEPS.SITE_MIGRATION_IDENTIFY.slug )
							);
						}

						return navigate(
							addQueryArgs(
								{ siteId, siteSlug, from: fromQueryParam },
								STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug
							),
							{ hideFreeMigrationTrialForNonVerifiedEmail: true }
						);
					}

					// Any process errors go to the error step.
					if ( providedDependencies?.error ) {
						return navigate( STEPS.ERROR.slug );
					}
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					if ( providedDependencies?.goToCheckout ) {
						const destination = addQueryArgs(
							{
								siteSlug,
								from: fromQueryParam,
								siteId,
							},
							`/setup/${ FLOW_NAME }/${ STEPS.SITE_MIGRATION_INSTRUCTIONS.slug }`
						);
						goToCheckout( {
							flowName: FLOW_NAME,
							stepName: 'site-migration-upgrade-plan',
							siteSlug: siteSlug,
							destination: destination,
							plan: providedDependencies.plan as string,
							extraQueryParams:
								providedDependencies?.sendIntentWhenCreatingTrial &&
								providedDependencies?.plan === PLAN_MIGRATION_TRIAL_MONTHLY
									? { hosting_intent: HOSTING_INTENT_MIGRATE }
									: {},
						} );
						return;
					}
				}

				case STEPS.SITE_MIGRATION_INSTRUCTIONS.slug: {
					// Take the user to the migration started step.
					if ( providedDependencies?.destination === 'migration-started' ) {
						return navigate( STEPS.SITE_MIGRATION_STARTED.slug, {
							siteId,
							siteSlug,
						} );
					}
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					return navigate( `${ STEPS.SITE_MIGRATION_IDENTIFY.slug }?${ urlQueryParams }` );
				}
			}
		};

		return { goBack, submit, exitFlow };
	},
};

export default migrationSignup;
