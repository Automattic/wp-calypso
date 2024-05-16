import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { isHostedSiteMigrationFlow } from '@automattic/onboarding';
import { SiteExcerptData } from '@automattic/sites';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/url';
import { useSiteData } from '../hooks/use-site-data';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { useStartUrl } from '../hooks/use-start-url';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { goToCheckout } from '../utils/checkout';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { type SiteMigrationIdentifyAction } from './internals/steps-repository/site-migration-identify';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const FLOW_NAME = 'site-migration';

const siteMigration: Flow = {
	name: FLOW_NAME,
	isSignupFlow: false,

	useSteps() {
		const baseSteps = [
			STEPS.SITE_MIGRATION_IDENTIFY,
			STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
			STEPS.SITE_MIGRATION_UPGRADE_PLAN,
			STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN,
			STEPS.SITE_MIGRATION_INSTRUCTIONS_I2,
			STEPS.ERROR,
			STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
		];

		const hostedVariantSteps = isHostedSiteMigrationFlow( this.variantSlug ?? FLOW_NAME )
			? [ STEPS.PICK_SITE, STEPS.SITE_CREATION_STEP, STEPS.PROCESSING ]
			: [];

		return [ ...baseSteps, ...hostedVariantSteps ];
	},

	useAssertConditions(): AssertConditionResult {
		const { siteSlug, siteId } = useSiteData();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const startUrl = useStartUrl( this.variantSlug ?? FLOW_NAME );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };
		const { isOwner } = useIsSiteOwner();

		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				const logInUrl = startUrl;
				window.location.assign( logInUrl );
			}
		}, [ startUrl, userIsLoggedIn ] );

		useEffect( () => {
			if ( isOwner === false ) {
				window.location.assign( '/start' );
			}
		}, [ isOwner ] );

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'site-migration requires a logged in user',
			};

			return result;
		}

		if ( ! siteSlug && ! siteId && ! isHostedSiteMigrationFlow( this.variantSlug ?? FLOW_NAME ) ) {
			window.location.assign( '/start' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'site-setup did not provide the site slug or site id it is configured to.',
			};
		}

		return result;
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const variantSlug = this.variantSlug;
		const flowPath = variantSlug ?? flowName;
		const siteCount =
			useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] )
				?.site_count ?? 0;

		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
		const siteSlugParam = useSiteSlugParam();
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );
		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		// TODO - We may need to add `...params: string[]` back once we start adding more steps.
		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, intent, flowName, currentStep, variantSlug );
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug );

			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const { from, platform, action } = providedDependencies as {
						from: string;
						platform: string;
						action: SiteMigrationIdentifyAction;
					};

					if ( action === 'skip_platform_identification' || platform !== 'wordpress' ) {
						// siteId/siteSlug wont be defined here if coming from a direct link/signup.
						// We need to make sure the importer works when no site is available.
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
						return exitFlow(
							addQueryArgs(
								{
									siteSlug,
									siteId,
									backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }`,
								},
								'/setup/site-setup/importList'
							)
						);
					}

					// Take the user to the upgrade plan step.
					if ( providedDependencies?.destination === 'upgrade' ) {
						return navigate( STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug, {
							siteId,
							siteSlug,
						} );
					}

					// Continue with the migration flow.
					return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug: {
					if ( providedDependencies?.error ) {
						return navigate( STEPS.ERROR.slug );
					}

					return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					if ( providedDependencies?.goToCheckout ) {
						const redirectAfterCheckout = providedDependencies?.userAcceptedDeal
							? STEPS.SITE_MIGRATION_ASSISTED_MIGRATION.slug
							: STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug;

						const destination = addQueryArgs(
							{
								siteSlug,
								siteId,
								// don't use from query param if the user takes the migration deal.
								// This is to avoid the user being redirected to the wrong page after checkout.
								...( ! providedDependencies?.userAcceptedDeal ? { from: fromQueryParam } : {} ),
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
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
					return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
				}
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					return exitFlow( `/setup/site-setup/goals?${ urlQueryParams }` );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					if ( urlQueryParams.has( 'showModal' ) ) {
						urlQueryParams.delete( 'showModal' );
						return navigate(
							`${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?${ urlQueryParams }`
						);
					}
					urlQueryParams.set( 'showModal', 'true' );

					return navigate( `site-migration-upgrade-plan?${ urlQueryParams.toString() }` );
				}
			}
		};

		return { goBack, submit, exitFlow };
	},
};

export default siteMigration;
