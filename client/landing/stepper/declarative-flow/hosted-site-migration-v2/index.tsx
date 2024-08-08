import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { HOSTED_SITE_MIGRATION_V2_FLOW, SITE_SETUP_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { useSearchParams } from 'react-router-dom';
import { Primitive } from 'utility-types';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { type Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { addQueryArgs } from 'calypso/lib/url';
import { HOW_TO_MIGRATE_OPTIONS } from '../../constants';
import { stepsWithRequiredLogin } from '../../utils/steps-with-required-login';
import { STEPS } from '../internals/steps';
import { ProvidedDependencies } from '../internals/types';

const {
	PLATFORM_IDENTIFICATION,
	PROCESSING,
	SITE_CREATION_STEP,
	SITE_MIGRATION_UPGRADE_PLAN,
	SITE_MIGRATION_HOW_TO_MIGRATE,
	SITE_MIGRATION_SOURCE_URL,
	SITE_MIGRATION_INSTRUCTIONS,
	SITE_MIGRATION_STARTED,
	SITE_MIGRATION_ASSISTED_MIGRATION,
} = STEPS;

export default {
	name: HOSTED_SITE_MIGRATION_V2_FLOW,
	get title() {
		return translate( 'Site Migration' );
	},
	isSignupFlow: false,
	useSteps() {
		return stepsWithRequiredLogin( [
			PLATFORM_IDENTIFICATION,
			SITE_CREATION_STEP,
			PROCESSING,
			SITE_MIGRATION_UPGRADE_PLAN,
			SITE_MIGRATION_HOW_TO_MIGRATE,
			SITE_MIGRATION_SOURCE_URL,
			SITE_MIGRATION_INSTRUCTIONS,
			SITE_MIGRATION_STARTED,
			SITE_MIGRATION_ASSISTED_MIGRATION,
		] );
	},

	useStepNavigation( currentStep, navigate ) {
		const [ query ] = useSearchParams();

		return {
			submit: ( props?: ProvidedDependencies ) => {
				const data = {
					// Site Creation Step
					siteId: props?.siteId || query.get( 'siteId' ),
					siteSlug: props?.siteSlug || query.get( 'siteSlug' ),

					//Platform Identification Step
					platform: props?.platform || query.get( 'platform' ),
					next: props?.next || query.get( 'next' ),
					url: props?.url,

					//Upgrade Plan Step
					userAcceptedDeal: props?.userAcceptedDeal,
					goToCheckout: props?.goToCheckout,
					plan: props?.plan,
					sendIntentWhenCreatingTrial: props?.sendIntentWhenCreatingTrial,
					flowPath: this.variantSlug ?? this.name,

					// How to Migrate Step
					how: props?.how || query.get( 'how' ),

					// Source URL Step
					from: props?.from || query.get( 'from' ),
				} as Record< string, Primitive | string >;

				if ( currentStep === PLATFORM_IDENTIFICATION.slug ) {
					return navigate(
						addQueryArgs(
							{
								platform: data.platform,
								...( data.platform !== 'wordpress' ? { next: data.url } : {} ),
							},
							SITE_CREATION_STEP.slug
						)
					);
				}

				if ( currentStep === SITE_CREATION_STEP.slug ) {
					return navigate(
						addQueryArgs(
							{
								platform: data.platform,
								next: data.next,
							},
							PROCESSING.slug
						)
					);
				}

				if ( currentStep === PROCESSING.slug ) {
					if ( data?.next ) {
						return window.location.assign(
							addQueryArgs(
								{
									siteId: data?.siteId,
									siteSlug: data?.siteSlug,
								},
								`/setup/${ SITE_SETUP_FLOW }/${ data.next.toString() }`
							)
						);
					}

					return navigate(
						addQueryArgs(
							{
								siteId: data?.siteId,
								siteSlug: data?.siteSlug,
							},
							SITE_MIGRATION_UPGRADE_PLAN.slug
						)
					);
				}

				if ( currentStep === SITE_MIGRATION_UPGRADE_PLAN.slug ) {
					if ( data?.goToCheckout ) {
						const redirectAfterCheckout = SITE_MIGRATION_HOW_TO_MIGRATE.slug;
						const destination = addQueryArgs(
							{
								siteSlug: data.siteSlug,
								siteId: data.siteId,
							},
							`/setup/${ data.flowPath as string }/${ redirectAfterCheckout }`
						);

						return goToCheckout( {
							flowName: data.flowPath as string,
							stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
							siteSlug: data.siteSlug as string,
							destination: destination,
							plan: data.plan as string,
							cancelDestination: `/setup/${ data.flowPath as string }/${
								STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug
							}?${ query.toString() }`,
							extraQueryParams:
								data?.sendIntentWhenCreatingTrial && data?.plan === PLAN_MIGRATION_TRIAL_MONTHLY
									? { hosting_intent: HOSTING_INTENT_MIGRATE }
									: {},
						} );
					}
				}

				if ( currentStep === SITE_MIGRATION_HOW_TO_MIGRATE.slug ) {
					if ( data?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ) {
						return navigate(
							addQueryArgs(
								{
									siteId: data.siteId,
									siteSlug: data.siteSlug,
								},
								SITE_MIGRATION_INSTRUCTIONS.slug
							)
						);
					}

					return navigate(
						addQueryArgs(
							{
								siteId: data.siteId,
								siteSlug: data.siteSlug,
							},
							SITE_MIGRATION_SOURCE_URL.slug
						)
					);
				}

				if ( currentStep === SITE_MIGRATION_INSTRUCTIONS.slug ) {
					return navigate(
						addQueryArgs(
							{
								siteId: data.siteId,
								siteSlug: data.siteSlug,
							},
							SITE_MIGRATION_STARTED.slug
						)
					);
				}

				if ( currentStep === SITE_MIGRATION_SOURCE_URL.slug ) {
					return navigate(
						addQueryArgs(
							{
								siteId: data.siteId,
								siteSlug: data.siteSlug,
								from: data.from,
							},
							SITE_MIGRATION_ASSISTED_MIGRATION.slug
						)
					);
				}
			},
		};
	},
} satisfies Flow;
