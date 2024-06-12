import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { type UserSelect } from '@automattic/data-stores';
import { isHostedSiteMigrationFlow } from '@automattic/onboarding';
import { SiteExcerptData } from '@automattic/sites';
import { useSelect } from '@wordpress/data';
import { Children, lazy, Suspense, useMemo } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/url';
import { useIntent } from '../hooks/use-intent';
import { useSiteData } from '../hooks/use-site-data';
import { USER_STORE } from '../stores';
import { goToCheckout } from '../utils/checkout';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { type SiteMigrationIdentifyAction } from './internals/steps-repository/site-migration-identify';
import type { ProvidedDependencies, StepperStep } from './internals/types';

// const FLOW_NAME = 'site-migration';

// const siteMigration: Flow = {
// 	name: FLOW_NAME,
// 	isSignupFlow: false,

// 	useSteps() {
// 		const baseSteps = [
// 			STEPS.SITE_MIGRATION_IDENTIFY,
// 			STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
// 			STEPS.SITE_MIGRATION_UPGRADE_PLAN,
// 			STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN,
// 			STEPS.SITE_MIGRATION_INSTRUCTIONS_I2,
// 			STEPS.ERROR,
// 			STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
// 		];

// 		const hostedVariantSteps = isHostedSiteMigrationFlow( this.variantSlug ?? FLOW_NAME )
// 			? [ STEPS.PICK_SITE, STEPS.SITE_CREATION_STEP, STEPS.PROCESSING ]
// 			: [];

// 		return stepsWithRequiredLogin( [ ...baseSteps, ...hostedVariantSteps ] );
// 	},

// 	useAssertConditions(): AssertConditionResult {
// 		const { siteSlug, siteId } = useSiteData();
// 		const { isAdmin } = useIsSiteAdmin();
// 		const userIsLoggedIn = useSelect(
// 			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
// 			[]
// 		);
// 		const flowPath = this.variantSlug ?? FLOW_NAME;

// 		useEffect( () => {
// 			if ( isAdmin === false ) {
// 				window.location.assign( '/start' );
// 			}
// 		}, [ isAdmin ] );

// 		useEffect( () => {
// 			// We don't need to do anything if the user isn't logged in.
// 			if ( ! userIsLoggedIn ) {
// 				return;
// 			}

// 			if ( siteSlug || siteId ) {
// 				return;
// 			}

// 			if ( isHostedSiteMigrationFlow( flowPath ) ) {
// 				return;
// 			}

// 			window.location.assign( '/start' );
// 		}, [ flowPath, siteId, siteSlug, userIsLoggedIn, isAdmin ] );

// 		if ( ! siteSlug && ! siteId && ! isHostedSiteMigrationFlow( flowPath ) ) {
// 			return {
// 				state: AssertConditionState.FAILURE,
// 				message: 'site-migration does not have the site slug or site id.',
// 			};
// 		}

// 		return { state: AssertConditionState.SUCCESS };
// 	},

// 	useStepNavigation( currentStep, navigate ) {
// 		const flowName = this.name;
// 		const { siteId } = useSiteData();
// 		const variantSlug = this.variantSlug;
// 		const flowPath = variantSlug ?? flowName;
// 		const siteCount =
// 			useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] )
// 				?.site_count ?? 0;

// 		const intent = useSelect(
// 			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
// 			[]
// 		);
// 		const siteSlugParam = useSiteSlugParam();
// 		const urlQueryParams = useQuery();
// 		const fromQueryParam = urlQueryParams.get( 'from' );
// 		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
// 		const { data: urlData, isLoading: isLoadingFromData } = useAnalyzeUrlQuery(
// 			fromQueryParam || '',
// 			true
// 		);
// 		const isFromSiteWordPress = ! isLoadingFromData && urlData?.platform === 'wordpress';

// 		const exitFlow = ( to: string ) => {
// 			window.location.assign( to );
// 		};

// 		// Call triggerGuidesForStep for the current step
// 		useEffect( () => {
// 			triggerGuidesForStep( flowName, currentStep, siteId );
// 		}, [ flowName, currentStep, siteId ] );

// 		// TODO - We may need to add `...params: string[]` back once we start adding more steps.

// 		const goBack = () => {
// 			switch ( currentStep ) {
// 				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
// 					return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
// 				}
// 				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
// 					return exitFlow( `/setup/site-setup/goals?${ urlQueryParams }` );
// 				}

// 				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
// 					if ( urlQueryParams.has( 'showModal' ) || ! isFromSiteWordPress ) {
// 						urlQueryParams.delete( 'showModal' );
// 						return navigate(
// 							`${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?${ urlQueryParams }`
// 						);
// 					}

// 					if ( isFromSiteWordPress ) {
// 						urlQueryParams.set( 'showModal', 'true' );
// 					}

// 					return navigate( `site-migration-upgrade-plan?${ urlQueryParams.toString() }` );
// 				}
// 			}
// 		};

// 		return { goBack, submit, exitFlow };
// 	},
// };

// interface NavigationResult {
// 	path: string;
// 	queryParams?: Record< string, string | number >;
// }

const AsyncComponent = ( props ) => {
	const { pathname } = useLocation();
	const [ , , stepName ] = pathname.split( '/' );

	const step = Object.entries( STEPS ).find( ( [ key, value ] ) => value.slug === stepName )?.[ 1 ];
	const Component = lazy( step.asyncComponent );

	return (
		<Suspense>
			<Component { ...props } />
		</Suspense>
	);
};

const Flow = ( { children, name, navigation } ) => {
	return (
		<Routes>
			{ Children.map( children, ( child ) => {
				const step = child.props.step;
				return (
					<Route
						path={ `/${ name }/${ step.slug }` }
						element={ <AsyncComponent navigation={ navigation } /> }
					/>
				);
			} ) }
		</Routes>
	);
};

const Step = ( { step }: { step: StepperStep } ) => {
	return null;
};

const exitFlow = ( to: string ) => {
	window.location.assign( to );
};

// export default siteMigration;
const SiteMigrationFlow = ( { navigate } ) => {
	const { pathname } = useLocation();
	const [ , flowName, stepName ] = pathname.split( '/' );
	const currentStep = stepName;
	const { siteId, siteSlug } = useSiteData();
	const intent = useIntent();
	const siteCount =
		useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] )
			?.site_count ?? 0;
	const urlQueryParams = useQuery();
	const fromQueryParam = urlQueryParams.get( 'from' );
	const flowPath = flowName;

	const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
		recordSubmitStep( providedDependencies, intent, flowName, currentStep, flowName );
		switch ( currentStep ) {
			case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
				const { from, platform, action } = providedDependencies as {
					from: string;
					platform: string;
					action: SiteMigrationIdentifyAction;
				};

				if ( action === 'skip_platform_identification' || platform !== 'wordpress' ) {
					if ( isHostedSiteMigrationFlow( flowName ) ) {
						if ( ! siteSlug ) {
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
								backToFlow: `/${ flowName }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
							},
							'/setup/site-setup/importList'
						)
					);
				}

				if ( isHostedSiteMigrationFlow( flowName ) ) {
					if ( ! siteSlug ) {
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
									backToFlow: `/${ flowName }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
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
		}
	};

	const navigation = useMemo(
		() => ( {
			submit,
		} ),
		[ flowName, stepName ]
	);

	return (
		<Flow name="site-migration" navigation={ navigation }>
			<Step step={ STEPS.SITE_MIGRATION_IDENTIFY } />
			<Step step={ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE } />
		</Flow>
	);
};

export default SiteMigrationFlow;
