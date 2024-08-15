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
import { addQueryArgs } from 'calypso/lib/url';
import { HOW_TO_MIGRATE_OPTIONS } from '../../constants';
import { stepsWithRequiredLogin } from '../../utils/steps-with-required-login';
import { STEPS } from '../internals/steps';
import { MigrationUpgradePlanActions } from '../internals/steps-repository/migration-upgrade-plan/actions';
import { goToImporter } from './helpers';
import type { ProvidedDependencies } from '../internals/types';
import type {
	Flow,
	Navigate,
	StepperStep,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { Primitive } from 'utility-types';

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

const useCreateStepHandlers = ( navigate: Navigate< StepperStep[] >, flowObject: Flow ) => {
	const [ query ] = useSearchParams();
	const flowPath = ( flowObject.variantSlug ?? flowObject.name ) as string;

	const getFromPropsOrUrl = ( key: string, props?: ProvidedDependencies ): Primitive => {
		const value = props?.[ key ] || query.get( key );
		return typeof value === 'object' ? undefined : ( value as Primitive );
	};

	const navigateToCheckout = (
		siteId: string,
		siteSlug: string,
		plan: string,
		props?: ProvidedDependencies,
		forceRedirection?: boolean
	) => {
		const redirectAfterCheckout = MIGRATION_HOW_TO_MIGRATE.slug;
		const destination = addQueryArgs(
			{ siteId, siteSlug },
			`/setup/${ flowPath }/${ redirectAfterCheckout }`
		);
		const cancelDestination = addQueryArgs(
			{ siteId, siteSlug },
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
				const platform = getFromPropsOrUrl( 'platform', props ) as string;
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;
				const hasSite = Boolean( siteId ) || Boolean( siteSlug );

				// The importer url is returning the importer name and empty query params, so we need to remove them;
				const importer = ( ( props?.url as string ) || '' ).split( '?' )[ 0 ];

				if ( platform === 'wordpress' ) {
					if ( hasSite ) {
						return navigate( addQueryArgs( { siteId, siteSlug }, MIGRATION_UPGRADE_PLAN.slug ) );
					}

					return navigate( SITE_CREATION_STEP.slug );
				}

				if ( hasSite ) {
					return goToImporter( importer, siteId, siteSlug );
				}

				return navigate( addQueryArgs( { importer }, SITE_CREATION_STEP.slug ) );
			},
		},
		[ SITE_CREATION_STEP.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const importer = getFromPropsOrUrl( 'importer', props );
				const plan = getFromPropsOrUrl( 'plan', props );

				return navigate( addQueryArgs( { importer, plan }, PROCESSING.slug ) );
			},
		},
		[ PROCESSING.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const importer = getFromPropsOrUrl( 'importer', props ) as string;
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;
				const plan = getFromPropsOrUrl( 'plan', props ) as string;

				if ( importer ) {
					return goToImporter( importer, siteId, siteSlug );
				}

				// If plan is already selected and it exists.
				// Entry point example: /setup/migration/create-site?platform=wordpress&plan=business
				if ( plans[ plan ] ) {
					return navigateToCheckout( siteId, siteSlug, plans[ plan ], props, true );
				}

				return navigate( addQueryArgs( { siteId, siteSlug }, MIGRATION_UPGRADE_PLAN.slug ) );
			},
		},
		[ MIGRATION_UPGRADE_PLAN.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const siteId = getFromPropsOrUrl( 'siteId', props ) as string;
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props ) as string;

				const plan = props?.plan as string;
				const backToStep = {
					step: MIGRATION_UPGRADE_PLAN.slug,
					flow: flowPath,
				};

				if ( props?.action === MigrationUpgradePlanActions.IMPORT_CONTENT_ONLY ) {
					return goToImporter( 'importerWordpress', siteId, siteSlug, backToStep );
				}

				if ( props?.goToCheckout ) {
					return navigateToCheckout( siteId, siteSlug, plan, props );
				}
			},
		},
		[ MIGRATION_HOW_TO_MIGRATE.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const how = getFromPropsOrUrl( 'how', props );
				const siteId = getFromPropsOrUrl( 'siteId', props );
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props );

				if ( how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ) {
					return navigate( addQueryArgs( { siteId, siteSlug }, SITE_MIGRATION_INSTRUCTIONS.slug ) );
				}

				return navigate( addQueryArgs( { siteId, siteSlug }, MIGRATION_SOURCE_URL.slug ) );
			},
		},
		[ SITE_MIGRATION_INSTRUCTIONS.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const siteId = getFromPropsOrUrl( 'siteId', props );
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props );

				return navigate( addQueryArgs( { siteId, siteSlug }, SITE_MIGRATION_STARTED.slug ) );
			},
		},
		[ MIGRATION_SOURCE_URL.slug ]: {
			submit: ( props?: ProvidedDependencies ) => {
				const siteId = getFromPropsOrUrl( 'siteId', props );
				const siteSlug = getFromPropsOrUrl( 'siteSlug', props );
				const from = getFromPropsOrUrl( 'from', props );

				return navigate(
					addQueryArgs( { siteId, siteSlug, from }, SITE_MIGRATION_ASSISTED_MIGRATION.slug )
				);
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
