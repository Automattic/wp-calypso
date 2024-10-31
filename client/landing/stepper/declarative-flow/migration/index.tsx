import config from '@automattic/calypso-config';
import {
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
} from '@automattic/calypso-products';
import { MIGRATION_FLOW } from '@automattic/onboarding';
import { useSearchParams } from 'react-router-dom';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { HOW_TO_MIGRATE_OPTIONS } from '../../constants';
import { stepsWithRequiredLogin } from '../../utils/steps-with-required-login';
import { STEPS } from '../internals/steps';
import { MigrationUpgradePlanActions } from '../internals/steps-repository/migration-upgrade-plan/actions';
import { goToImporter } from './helpers';
import { useFlowNavigator } from './hooks/use-flow-navigator';
import type { ProvidedDependencies } from '../internals/types';
import type {
	Flow,
	Navigate,
	StepperStep,
} from 'calypso/landing/stepper/declarative-flow/internals/types';

const {
	PLATFORM_IDENTIFICATION,
	PROCESSING,
	SITE_CREATION_STEP,
	MIGRATION_UPGRADE_PLAN,
	MIGRATION_HOW_TO_MIGRATE,
	MIGRATION_SOURCE_URL,
	SITE_MIGRATION_INSTRUCTIONS,
	SITE_MIGRATION_STARTED,
	SITE_MIGRATION_ASSISTED_MIGRATION,
	SITE_MIGRATION_CREDENTIALS,
	SITE_MIGRATION_ALREADY_WPCOM,
	SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
	SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
} = STEPS;

const steps = [
	PLATFORM_IDENTIFICATION,
	SITE_CREATION_STEP,
	PROCESSING,
	MIGRATION_UPGRADE_PLAN,
	MIGRATION_HOW_TO_MIGRATE,
	MIGRATION_SOURCE_URL,
	SITE_MIGRATION_INSTRUCTIONS,
	SITE_MIGRATION_STARTED,
	SITE_MIGRATION_ASSISTED_MIGRATION,
	SITE_MIGRATION_CREDENTIALS,
	SITE_MIGRATION_ALREADY_WPCOM,
	SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
	SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
];

const plans: { [ key: string ]: string } = {
	business: PLAN_BUSINESS,
	'business-2y': PLAN_BUSINESS_2_YEARS,
	'business-3y': PLAN_BUSINESS_3_YEARS,
};

const useCreateStepHandlers = ( navigate: Navigate< StepperStep[] >, flowObject: Flow ) => {
	const [ query, setQuery ] = useSearchParams();
	const flowPath = ( flowObject.variantSlug ?? flowObject.name ) as string;
	const { navigateWithQueryParams, getFromPropsOrUrl } = useFlowNavigator( {
		navigate,
		persistedUrlParams: [ 'siteId', 'siteSlug', 'from' ],
	} );

	const navigateToCheckout = ( {
		siteId,
		siteSlug,
		from,
		plan,
		props,
		destinationStep = MIGRATION_HOW_TO_MIGRATE,
		forceRedirection,
	}: {
		siteId: string;
		siteSlug: string;
		from?: string;
		plan: string;
		destinationStep?: StepperStep;
		props?: ProvidedDependencies;
		forceRedirection?: boolean;
	} ) => {
		const redirectAfterCheckout = destinationStep.slug;
		const destination = addQueryArgs(
			{ siteId, siteSlug, from },
			`/setup/${ flowPath }/${ redirectAfterCheckout }`
		);

		const cancelDestination = addQueryArgs(
			{ siteId, siteSlug, from },
			`/setup/${ flowPath }/${ MIGRATION_UPGRADE_PLAN.slug }?${ query.toString() }`
		);

		let extraQueryParams: Record< string, string > | undefined =
			props?.sendIntentWhenCreatingTrial && plan === PLAN_MIGRATION_TRIAL_MONTHLY
				? { hosting_intent: HOSTING_INTENT_MIGRATE }
				: undefined;

		// If the redirection is forced, the upgrade step won't add the introductory offer, so it adds it through the checkout.
		if ( forceRedirection ) {
			extraQueryParams = {
				...extraQueryParams,
				introductoryOffer: '1',
			};
		}
		return goToCheckout( {
			flowName: flowPath,
			stepName: MIGRATION_UPGRADE_PLAN.slug,
			siteSlug,
			destination,
			plan,
			cancelDestination,
			extraQueryParams,
			forceRedirection,
		} );
	};

	return {
		[ PLATFORM_IDENTIFICATION.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const platform = getFromPropsOrUrl( 'platform', props ) as ImporterPlatform;
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;
				const hasSite = Boolean( siteId ) || Boolean( siteSlug );

				if ( platform === 'wordpress' ) {
					if ( hasSite ) {
						return navigateWithQueryParams( MIGRATION_UPGRADE_PLAN, [], props );
					}

					return navigateWithQueryParams( SITE_CREATION_STEP, [], props );
				}

				if ( hasSite ) {
					return goToImporter( {
						siteId,
						siteSlug,
						platform,
						backToStep: PLATFORM_IDENTIFICATION,
						ref: MIGRATION_FLOW,
					} );
				}

				return navigateWithQueryParams( SITE_CREATION_STEP, [ 'platform' ], props, {
					replaceHistory: true,
				} );
			},
		},
		[ SITE_CREATION_STEP.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				return navigateWithQueryParams( PROCESSING, [ 'platform', 'plan' ], props, {
					replaceHistory: true,
				} );
			},
		},
		[ PROCESSING.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const platform = getFromPropsOrUrl( 'platform', props ) as ImporterPlatform;
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;
				const plan = getFromPropsOrUrl( 'plan', props ) as string;
				const from = getFromPropsOrUrl( 'from', props ) as string;
				const selectedPlan = plans[ plan ];

				if ( platform ) {
					return goToImporter( {
						platform,
						siteId,
						siteSlug,
						backToStep: PLATFORM_IDENTIFICATION,
						replaceHistory: true,
						ref: MIGRATION_FLOW,
					} );
				}

				// If plan is already selected and it exists.
				// Entry point example: /setup/migration/create-site?plan=business
				if ( selectedPlan ) {
					return navigateToCheckout( {
						siteId,
						siteSlug,
						plan: selectedPlan,
						from,
						props,
						forceRedirection: true,
					} );
				}

				return navigateWithQueryParams( MIGRATION_UPGRADE_PLAN, [], props, {
					replaceHistory: true,
				} );
			},
		},
		[ MIGRATION_UPGRADE_PLAN.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;
				const from = getFromPropsOrUrl( 'from', props ) as string;
				const migrationDealAccepted = getFromPropsOrUrl( 'userAcceptedDeal', props ) as string;
				const plan = props?.plan as string;

				if ( props?.action === MigrationUpgradePlanActions.IMPORT_CONTENT_ONLY ) {
					return goToImporter( {
						platform: 'wordpress',
						siteId,
						siteSlug,
						backToStep: PLATFORM_IDENTIFICATION,
						migrateEntireSiteStep: MIGRATION_UPGRADE_PLAN,
						replaceHistory: true,
						ref: MIGRATION_FLOW,
					} );
				}

				if ( props?.goToCheckout ) {
					if ( query.has( 'showModal' ) ) {
						query.delete( 'showModal' );
						setQuery( query );
					}

					const destinationStep = migrationDealAccepted
						? MIGRATION_SOURCE_URL
						: MIGRATION_HOW_TO_MIGRATE;

					return navigateToCheckout( { siteId, siteSlug, plan, from, props, destinationStep } );
				}
			},
			goBack: ( props?: ProvidedDependencies ) => {
				if ( ! query.has( 'showModal' ) ) {
					query.set( 'showModal', 'true' );
					return setQuery( query );
				}

				return navigateWithQueryParams( PLATFORM_IDENTIFICATION, [ 'plan' ], props );
			},
		},
		[ MIGRATION_HOW_TO_MIGRATE.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const how = getFromPropsOrUrl( 'how', props );

				if ( how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ) {
					return navigateWithQueryParams( SITE_MIGRATION_INSTRUCTIONS, [], props );
				}

				// @deprecated Remove the MIGRATION_SOURCE_URL when SITE_MIGRATION_CREDENTIALS is considered stable.
				const SOURCE_STEP = config.isEnabled( 'automated-migration/collect-credentials' )
					? SITE_MIGRATION_CREDENTIALS
					: MIGRATION_SOURCE_URL;

				return navigateWithQueryParams( SOURCE_STEP, [], props );
			},
		},
		[ SITE_MIGRATION_INSTRUCTIONS.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				return navigateWithQueryParams( SITE_MIGRATION_STARTED, [], props );
			},
		},

		// @deprecated Remove the MIGRATION_SOURCE_URL when SITE_MIGRATION_CREDENTIALS is considered stable.
		[ MIGRATION_SOURCE_URL.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				return navigateWithQueryParams( SITE_MIGRATION_ASSISTED_MIGRATION, [], props );
			},
			goBack: ( props?: ProvidedDependencies ) => {
				return navigateWithQueryParams( MIGRATION_HOW_TO_MIGRATE, [], props );
			},
		},

		[ SITE_MIGRATION_CREDENTIALS.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const action = getFromPropsOrUrl( 'action', props ) as
					| 'skip'
					| 'submit'
					| 'already-wpcom'
					| 'site-is-not-using-wordpress';

				if ( action === 'already-wpcom' ) {
					return navigateWithQueryParams( SITE_MIGRATION_ALREADY_WPCOM, [], props, {
						replaceHistory: true,
					} );
				}

				if ( action === 'site-is-not-using-wordpress' ) {
					return navigateWithQueryParams(
						SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
						[ 'platform' ],
						props,
						{ replaceHistory: true }
					);
				}

				const extraPrams = {
					...( action !== 'skip' ? { preventTicketCreation: true } : {} ),
				};

				return navigateWithQueryParams(
					SITE_MIGRATION_ASSISTED_MIGRATION,
					[ 'preventTicketCreation' ],
					{ ...props, ...extraPrams },
					{ replaceHistory: true }
				);
			},
			goBack: ( props?: ProvidedDependencies ) => {
				return navigateWithQueryParams( MIGRATION_HOW_TO_MIGRATE, [], props );
			},
		},
		[ SITE_MIGRATION_ASSISTED_MIGRATION.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const hasError = getFromPropsOrUrl( 'hasError', props );
				const extraPrams = {
					...( hasError === 'ticket-creation' ? { error: hasError } : {} ),
				};

				return navigateWithQueryParams(
					SITE_MIGRATION_CREDENTIALS,
					[ 'error' ],
					{ ...props, ...extraPrams },
					{ replaceHistory: true }
				);
			},
		},
		[ SITE_MIGRATION_ALREADY_WPCOM.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				return navigateWithQueryParams(
					SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
					[ 'variation' ],
					{ ...props, variation: 'goals_shared' },
					{ replaceHistory: true }
				);
			},
		},
		[ SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const platform = getFromPropsOrUrl( 'platform', props ) as ImporterPlatform;
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;

				if ( props?.action === 'skip' ) {
					return navigateWithQueryParams( SITE_MIGRATION_SUPPORT_INSTRUCTIONS, [], props );
				}

				return goToImporter( {
					platform,
					siteId,
					siteSlug,
					backToStep: SITE_MIGRATION_CREDENTIALS,
					replaceHistory: true,
					ref: MIGRATION_FLOW,
				} );
			},
			goBack: ( props?: ProvidedDependencies ) => {
				return navigateWithQueryParams( SITE_MIGRATION_CREDENTIALS, [], props );
			},
		},
	};
};

export default {
	name: MIGRATION_FLOW,
	isSignupFlow: true,
	useSteps() {
		return stepsWithRequiredLogin( steps );
	},

	useStepNavigation( currentStep, navigate ) {
		const stepHandlers = useCreateStepHandlers( navigate, this );

		return stepHandlers[ currentStep ] || {};
	},

	useSideEffect( currentStep, navigate ) {
		const [ search ] = useSearchParams();

		// Handle cases when starting the flow.
		if ( currentStep === steps[ 0 ].slug ) {
			// If the plan is already defined, it creates the site and automatically goes to the checkout.
			const plan = search.get( 'plan' ) ?? '';
			if ( Object.keys( plans ).includes( plan ) ) {
				return navigate( SITE_CREATION_STEP.slug, { plan } );
			}

			// If it has the from, it assumes that it's a WordPress site.
			// If we need to handle it for other platforms in the future, we should enhance the conditionals.
			if ( search.get( 'from' ) ) {
				return navigate( SITE_CREATION_STEP.slug );
			}
		}
	},
} satisfies Flow;
