import config from '@automattic/calypso-config';
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Onboard, type SiteSelect, type UserSelect } from '@automattic/data-stores';
import { isHostedSiteMigrationFlow } from '@automattic/onboarding';
import { SiteExcerptData } from '@automattic/sites';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { addQueryArgs } from 'calypso/lib/url';
import { GUIDED_ONBOARDING_FLOW_REFERRER } from 'calypso/signup/steps/initial-intent/constants';
import { HOW_TO_MIGRATE_OPTIONS } from '../constants';
import { useIsSiteAdmin } from '../hooks/use-is-site-admin';
import { useSiteData } from '../hooks/use-site-data';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, SITE_STORE, ONBOARD_STORE } from '../stores';
import { goToCheckout } from '../utils/checkout';
import { STEPS } from './internals/steps';
import { getSiteIdParam } from './internals/steps-repository/import/util';
import { type SiteMigrationIdentifyAction } from './internals/steps-repository/site-migration-identify';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';

const FLOW_NAME = 'site-migration';

const siteMigration: Flow = {
	name: FLOW_NAME,
	isSignupFlow: false,

	useSideEffect() {
		const { setIntent } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			setIntent( Onboard.SiteIntent.SiteMigration );
		}, [] );
	},

	useSteps() {
		const baseSteps = [
			STEPS.SITE_MIGRATION_IDENTIFY,
			STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
			STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
			STEPS.SITE_MIGRATION_UPGRADE_PLAN,
			STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN,
			STEPS.SITE_MIGRATION_INSTRUCTIONS,
			STEPS.SITE_MIGRATION_STARTED,
			STEPS.ERROR,
			STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
			STEPS.SITE_MIGRATION_SOURCE_URL,
			STEPS.SITE_MIGRATION_CREDENTIALS,
		];

		const hostedVariantSteps = isHostedSiteMigrationFlow( this.variantSlug ?? FLOW_NAME )
			? [ STEPS.PICK_SITE, STEPS.SITE_CREATION_STEP, STEPS.PROCESSING ]
			: [];

		return stepsWithRequiredLogin( [ ...baseSteps, ...hostedVariantSteps ] );
	},

	useAssertConditions(): AssertConditionResult {
		const { siteSlug, siteId } = useSiteData();
		const { isAdmin } = useIsSiteAdmin();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const flowPath = this.variantSlug ?? FLOW_NAME;

		useEffect( () => {
			if ( isAdmin === false ) {
				window.location.assign( '/start' );
			}
		}, [ isAdmin ] );

		useEffect( () => {
			// We don't need to do anything if the user isn't logged in.
			if ( ! userIsLoggedIn ) {
				return;
			}

			if ( siteSlug || siteId ) {
				return;
			}

			if ( isHostedSiteMigrationFlow( flowPath ) ) {
				return;
			}

			window.location.assign( '/start' );
		}, [ flowPath, siteId, siteSlug, userIsLoggedIn, isAdmin ] );

		if ( ! siteSlug && ! siteId && ! isHostedSiteMigrationFlow( flowPath ) ) {
			return {
				state: AssertConditionState.FAILURE,
				message: 'site-migration does not have the site slug or site id.',
			};
		}

		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const { siteId } = useSiteData();
		const variantSlug = this.variantSlug;
		const flowPath = variantSlug ?? flowName;
		const siteCount =
			useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] )
				?.site_count ?? 0;
		const siteSlugParam = useSiteSlugParam();
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );
		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const { data: urlData, isLoading: isLoadingFromData } = useAnalyzeUrlQuery(
			fromQueryParam || '',
			true
		);
		const isFromSiteWordPress = ! isLoadingFromData && urlData?.platform === 'wordpress';

		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		// Call triggerGuidesForStep for the current step
		useEffect( () => {
			triggerGuidesForStep( flowName, currentStep, siteId );
		}, [ flowName, currentStep, siteId ] );

		// TODO - We may need to add `...params: string[]` back once we start adding more steps.
		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug ) || getSiteIdParam( urlQueryParams );

			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const { from, platform, action } = providedDependencies as {
						from: string;
						platform: string;
						action: SiteMigrationIdentifyAction;
					};

					if ( action === 'skip_platform_identification' || platform !== 'wordpress' ) {
						if ( isHostedSiteMigrationFlow( variantSlug ?? '' ) ) {
							// siteId/siteSlug wont be defined here if coming from a direct link/signup.
							// We need to make sure there's a site to import into.
							if ( ! siteSlugParam ) {
								return navigate( STEPS.SITE_CREATION_STEP.slug );
							}
						}
						return exitFlow(
							addQueryArgs(
								{
									siteId,
									siteSlug,
									from,
									origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
									backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
								},
								'/setup/site-setup/importList'
							)
						);
					}

					if ( isHostedSiteMigrationFlow( variantSlug ?? '' ) ) {
						if ( ! siteSlugParam ) {
							if ( siteCount > 0 ) {
								return navigate( `sitePicker?from=${ encodeURIComponent( from ) }` );
							}

							if ( from ) {
								return navigate( addQueryArgs( { from }, STEPS.SITE_CREATION_STEP.slug ) );
							}
							return navigate( 'error' );
						}
					}

					return navigate(
						addQueryArgs(
							{ from: from, siteSlug, siteId },
							STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug
						)
					);
				}

				case STEPS.PICK_SITE.slug: {
					switch ( providedDependencies?.action ) {
						case 'update-query': {
							const newQueryParams =
								( providedDependencies?.queryParams as { [ key: string ]: string } ) || {};

							Object.keys( newQueryParams ).forEach( ( key ) => {
								newQueryParams[ key ]
									? urlQueryParams.set( key, newQueryParams[ key ] )
									: urlQueryParams.delete( key );
							} );

							return navigate( `sitePicker?${ urlQueryParams.toString() }` );
						}
						case 'select-site': {
							const { ID: newSiteId, slug: newSiteSlug } =
								providedDependencies.site as SiteExcerptData;
							return navigate(
								addQueryArgs(
									{ siteId: newSiteId, siteSlug: newSiteSlug, from: fromQueryParam },
									STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug
								)
							);
						}
						case 'create-site':
							return navigate(
								addQueryArgs( { from: fromQueryParam }, STEPS.SITE_CREATION_STEP.slug )
							);
					}
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					return navigate( addQueryArgs( { from: fromQueryParam }, STEPS.PROCESSING.slug ) );
				}

				case STEPS.PROCESSING.slug: {
					if ( providedDependencies?.siteCreated ) {
						if ( ! fromQueryParam ) {
							// If we get to this point without a fromQueryParam then we are coming from a direct
							// pick your current platform link. That's why we navigate to the importList step.
							return exitFlow(
								addQueryArgs(
									{
										siteId,
										siteSlug,
										origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
										backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
									},
									'/setup/site-setup/importList'
								)
							);
						}
						return navigate(
							addQueryArgs(
								{ siteId, siteSlug, from: fromQueryParam },
								STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug
							)
						);
					}
				}

				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
					// Switch to the normal Import flow.
					if ( providedDependencies?.destination === 'import' ) {
						if ( urlQueryParams.get( 'ref' ) === 'calypso-importer' ) {
							return exitFlow(
								addQueryArgs(
									{ engine: 'wordpress', ref: 'site-migration' },
									`/import/${ siteSlug }`
								)
							);
						}

						return exitFlow(
							addQueryArgs(
								{
									siteSlug,
									from: fromQueryParam ?? '',
									option: 'content',
									backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }`,
								},
								`/setup/site-setup/importerWordpress`
							)
						);
					}

					if ( config.isEnabled( 'migration-flow/enable-migration-assistant' ) ) {
						return navigate( STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug, {
							siteId,
							siteSlug,
						} );
					}

					// Take the user to the upgrade plan step.
					if ( providedDependencies?.destination === 'upgrade' ) {
						return navigate( STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug, {
							siteId,
							siteSlug,
						} );
					}

					// Continue with the migration flow.
					return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS.slug, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug: {
					// Take the user to the upgrade plan step.
					if ( providedDependencies?.destination === 'upgrade' ) {
						return navigate(
							addQueryArgs(
								{
									siteId,
									siteSlug,
									from: fromQueryParam,
									destination: providedDependencies?.destination,
									how: providedDependencies?.how as string,
								},
								STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug
							)
						);
					}

					// Do it for me option.
					if ( providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
						return navigate( STEPS.SITE_MIGRATION_ASSISTED_MIGRATION.slug, {
							siteId,
							siteSlug,
						} );
					}

					// Continue with the migration flow.
					return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS.slug, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug: {
					if ( providedDependencies?.error ) {
						return navigate( STEPS.ERROR.slug );
					}

					return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS.slug, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					if ( providedDependencies?.goToCheckout ) {
						let redirectAfterCheckout = STEPS.SITE_MIGRATION_INSTRUCTIONS.slug;

						if (
							providedDependencies?.userAcceptedDeal ||
							urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME
						) {
							if ( config.isEnabled( 'automated-migration/collect-credentials' ) ) {
								redirectAfterCheckout = STEPS.SITE_MIGRATION_CREDENTIALS.slug;
							} else if ( ! fromQueryParam ) {
								// If the user selected "Do it for me" but has not given us a source site, we should take them to the source URL step.
								redirectAfterCheckout = STEPS.SITE_MIGRATION_SOURCE_URL.slug;
							} else {
								redirectAfterCheckout = STEPS.SITE_MIGRATION_ASSISTED_MIGRATION.slug;
							}
						}

						const destination = addQueryArgs(
							{
								siteSlug,
								from: fromQueryParam,
								siteId,
							},
							`/setup/${ flowPath }/${ redirectAfterCheckout }`
						);

						urlQueryParams.delete( 'showModal' );
						goToCheckout( {
							flowName: flowPath,
							stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
							siteSlug: siteSlug,
							destination: destination,
							plan: providedDependencies.plan as string,
							cancelDestination: `/setup/${ flowPath }/${
								STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug
							}?${ urlQueryParams.toString() }`,
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

				case STEPS.SITE_MIGRATION_SOURCE_URL.slug: {
					const { from } = providedDependencies as {
						from: string;
					};
					const nextStepUrl = addQueryArgs(
						{ from, siteSlug, siteId },
						STEPS.SITE_MIGRATION_ASSISTED_MIGRATION.slug
					);
					// Navigate to the assisted migration step.
					return navigate( nextStepUrl, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.SITE_MIGRATION_CREDENTIALS.slug: {
					return navigate( STEPS.SITE_MIGRATION_ASSISTED_MIGRATION.slug, {
						siteId,
						siteSlug,
					} );
				}
			}
		}

		const goBack = () => {
			const siteSlug = urlQueryParams.get( 'siteSlug' ) || '';
			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
					if ( urlQueryParams.get( 'ref' ) === 'calypso-importer' ) {
						return exitFlow( addQueryArgs( { ref: 'site-migration' }, `/import/${ siteSlug }` ) );
					}
					return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
				}
				case STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug: {
					return navigate( STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug );
				}
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					if ( urlQueryParams.get( 'ref' ) === GUIDED_ONBOARDING_FLOW_REFERRER ) {
						return exitFlow( '/start/initial-intent' );
					}

					return exitFlow( `/setup/site-setup/goals?${ urlQueryParams }` );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					if ( urlQueryParams.has( 'showModal' ) || ! isFromSiteWordPress ) {
						urlQueryParams.delete( 'showModal' );
						if ( config.isEnabled( 'migration-flow/enable-migration-assistant' ) ) {
							return navigate(
								`${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }?${ urlQueryParams }`
							);
						}

						return navigate(
							`${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?${ urlQueryParams }`
						);
					}

					// If the user selected the "Do it for me" option, we should take them back to the how to migrate step skipping
					// the modal.
					if (
						config.isEnabled( 'migration-flow/enable-migration-assistant' ) &&
						urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME
					) {
						return navigate( `${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }?${ urlQueryParams }` );
					}

					if ( isFromSiteWordPress ) {
						urlQueryParams.set( 'showModal', 'true' );
					}

					return navigate( `site-migration-upgrade-plan?${ urlQueryParams.toString() }` );
				}

				case STEPS.SITE_MIGRATION_CREDENTIALS.slug: {
					return navigate( `${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }?${ urlQueryParams }` );
				}
			}
		};

		return { goBack, submit, exitFlow };
	},
	use__Temporary__ShouldTrackEvent: ( event ) => 'submit' === event,
};

export default siteMigration;
