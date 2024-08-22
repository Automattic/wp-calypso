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
} = STEPS;

const plans: { [ key: string ]: string } = {
	business: PLAN_BUSINESS,
	'business-2y': PLAN_BUSINESS_2_YEARS,
	'business-3y': PLAN_BUSINESS_3_YEARS,
};

const useCreateStepHandlers = ( _navigate: Navigate< StepperStep[] >, flowObject: Flow ) => {
	const [ query ] = useSearchParams();
	const flowPath = ( flowObject.variantSlug ?? flowObject.name ) as string;
	const { navigate, getFromPropsOrUrl } = useFlowNavigator( _navigate );

	const navigateToCheckout = ( {
		siteId,
		siteSlug,
		from,
		plan,
		props,
		forceRedirection,
	}: {
		siteId: string;
		siteSlug: string;
		from?: string;
		plan: string;
		props?: ProvidedDependencies;
		forceRedirection?: boolean;
	} ) => {
		const redirectAfterCheckout = MIGRATION_HOW_TO_MIGRATE.slug;
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
						return navigate( MIGRATION_UPGRADE_PLAN, [ 'siteId', 'siteSlug', 'from' ], props );
					}

					return navigate( SITE_CREATION_STEP, [ 'from' ], props );
				}

				if ( hasSite ) {
					return goToImporter( {
						siteId,
						siteSlug,
						platform,
						backToStep: PLATFORM_IDENTIFICATION,
					} );
				}

				return navigate( SITE_CREATION_STEP, [ 'platform', 'from', 'platform' ], props, {
					replaceHistory: true,
				} );
			},
		},
		[ SITE_CREATION_STEP.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				return navigate( PROCESSING, [ 'platform', 'plan', 'from' ], props, {
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

				return navigate( MIGRATION_UPGRADE_PLAN, [ 'siteId', 'siteSlug', 'from' ], props, {
					replaceHistory: true,
				} );
			},
		},
		[ MIGRATION_UPGRADE_PLAN.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;
				const from = getFromPropsOrUrl( 'from', props ) as string;

				const plan = props?.plan as string;

				if ( props?.action === MigrationUpgradePlanActions.IMPORT_CONTENT_ONLY ) {
					return goToImporter( {
						platform: 'wordpress',
						siteId,
						siteSlug,
						backToStep: PLATFORM_IDENTIFICATION,
						migrateEntireSiteStep: MIGRATION_UPGRADE_PLAN,
						replaceHistory: true,
					} );
				}

				if ( props?.goToCheckout ) {
					return navigateToCheckout( { siteId, siteSlug, plan, from, props } );
				}
			},
			goBack: ( props?: ProvidedDependencies ) => {
				return navigate( PLATFORM_IDENTIFICATION, [ 'siteId', 'siteSlug', 'plan', 'from' ], props );
			},
		},
		[ MIGRATION_HOW_TO_MIGRATE.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const how = getFromPropsOrUrl( 'how', props );

				if ( how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ) {
					return navigate( SITE_MIGRATION_INSTRUCTIONS, [ 'siteId', 'siteSlug', 'from' ], props );
				}

				return navigate( MIGRATION_SOURCE_URL, [ 'siteId', 'siteSlug', 'from' ], props );
			},
		},
		[ SITE_MIGRATION_INSTRUCTIONS.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				return navigate( SITE_MIGRATION_STARTED, [ 'siteId', 'siteSlug', 'from' ], props );
			},
		},
		[ MIGRATION_SOURCE_URL.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				return navigate(
					SITE_MIGRATION_ASSISTED_MIGRATION,
					[ 'siteId', 'siteSlug', 'from' ],
					props
				);
			},
			goBack: ( props?: ProvidedDependencies ) => {
				return navigate( MIGRATION_HOW_TO_MIGRATE, [ 'siteId', 'siteSlug', 'from' ], props );
			},
		},
	};
};

export default {
	name: MIGRATION_FLOW,
	isSignupFlow: false,
	useSteps() {
		return stepsWithRequiredLogin( [
			PLATFORM_IDENTIFICATION,
			SITE_CREATION_STEP,
			PROCESSING,
			MIGRATION_UPGRADE_PLAN,
			MIGRATION_HOW_TO_MIGRATE,
			MIGRATION_SOURCE_URL,
			SITE_MIGRATION_INSTRUCTIONS,
			SITE_MIGRATION_STARTED,
			SITE_MIGRATION_ASSISTED_MIGRATION,
		] );
	},

	useStepNavigation( currentStep, navigate ) {
		const stepHandlers = useCreateStepHandlers( navigate, this );

		return stepHandlers[ currentStep ];
	},
} satisfies Flow;
