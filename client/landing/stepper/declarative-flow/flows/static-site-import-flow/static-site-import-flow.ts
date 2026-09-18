import { Onboard } from '@automattic/data-stores';
import { SITE_MIGRATION_FLOW, STATIC_SITE_IMPORT_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { getSourceHost } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/components/static-site-import/utils';
import {
	getFullImporterUrl,
	isPlatformImportable,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { type SiteMigrationIdentifyAction } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-identify';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { siteSetupImportListPath } from '../site-migration-flow/paths';
import { canUseStaticSiteImport } from './helpers';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { StaticSiteImportDomainChoice } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/static-site-import-address';
import type {
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const BASE_STEPS = [
	STEPS.SITE_MIGRATION_IDENTIFY,
	STEPS.STATIC_SITE_IMPORT_READING,
	STEPS.STATIC_SITE_IMPORT_RESULTS,
	STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS,
	STEPS.STATIC_SITE_IMPORT_ADDRESS,
	STEPS.DOMAIN_SEARCH,
	STEPS.UNIFIED_PLANS,
	STEPS.SITE_CREATION_STEP,
	STEPS.PROCESSING,
	STEPS.STATIC_SITE_IMPORT_READY,
	STEPS.STATIC_SITE_IMPORT_BUILDING,
	STEPS.STATIC_SITE_IMPORT_DONE,
	STEPS.STATIC_SITE_IMPORT_EXPERT,
	STEPS.STATIC_SITE_IMPORT_FAILED,
	STEPS.ERROR,
];

function initialize() {
	return stepsWithRequiredLogin( BASE_STEPS );
}

const hasSite = ( siteId?: number, siteSlug?: string ) => Boolean( siteId && siteSlug );

const staticSiteImport: FlowV2< typeof initialize > = {
	name: STATIC_SITE_IMPORT_FLOW,
	get isSignupFlow() {
		const searchParams = new URLSearchParams( window.location.search );
		return ! searchParams.has( 'siteSlug' ) && ! searchParams.has( 'siteId' );
	},
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepsProps() {
		const urlQueryParams = useQuery();
		const hasDestinationSite = hasSite(
			Number( urlQueryParams.get( 'siteId' ) ),
			urlQueryParams.get( 'siteSlug' ) ?? ''
		);

		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				isInSignup: ! hasDestinationSite,
			},
			// "Keep my domain" is its own choice on the address step.
			[ STEPS.DOMAIN_SEARCH.slug ]: {
				hideUseMyDomainLink: true,
			},
		};
	},
	useSideEffect() {
		const { setIntent, resetOnboardStore } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			resetOnboardStore();
			setIntent( Onboard.SiteIntent.SiteMigration );
		}, [ resetOnboardStore, setIntent ] );
	},

	useStepNavigation( currentStep, navigate: NavigateV2< typeof BASE_STEPS > ) {
		const flowPath = this.variantSlug ?? this.name;
		const { siteId, siteSlug, site } = useSiteData();
		const urlQueryParams = useQuery();
		const from = urlQueryParams.get( 'from' ) ?? '';
		const platform = ( urlQueryParams.get( 'platform' ) || 'unknown' ) as ImporterPlatform;
		const domainChoice = urlQueryParams.get(
			'domainChoice'
		) as StaticSiteImportDomainChoice | null;
		const siteCount = useSelector( getCurrentUserSiteCount );
		const recordSignupComplete = useRecordSignupComplete( flowPath );
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setSignupDomainOrigin,
			setSiteUrl,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;

		const isSiteOnPaidPlan = Boolean( site?.plan ) && ! site?.plan?.is_free;

		const exitFlow = ( to: string, replace = false ) => {
			const url = addQueryArgs( { ref: STATIC_SITE_IMPORT_FLOW }, to );
			return replace ? window.location.replace( url ) : window.location.assign( url );
		};

		const exitToMigrationFlow = ( source: string, sourcePlatform: ImporterPlatform ) => {
			if ( ! hasSite( siteId, siteSlug ) ) {
				const step = siteCount && siteCount > 1 ? STEPS.PICK_SITE : STEPS.SITE_CREATION_STEP;
				return exitFlow(
					addQueryArgs(
						{ from: source, platform: sourcePlatform },
						`/setup/${ SITE_MIGRATION_FLOW }/${ step.slug }`
					),
					true
				);
			}

			if ( sourcePlatform === 'wordpress' ) {
				return exitFlow(
					addQueryArgs(
						{ from: source, siteId, siteSlug },
						`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }`
					),
					true
				);
			}

			if ( isPlatformImportable( sourcePlatform ) && source ) {
				return exitFlow( getFullImporterUrl( sourcePlatform, siteSlug, source ), true );
			}

			return exitFlow(
				siteSetupImportListPath( {
					siteId,
					siteSlug,
					from: source,
					origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
					backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
				} ),
				true
			);
		};

		const restartReading = () =>
			navigate( `${ STEPS.STATIC_SITE_IMPORT_READING.slug }?importSessionId=` );

		const goToImportCheckout = (
			destinationSiteId: number,
			destinationSiteSlug: string,
			plan?: string
		) => {
			const destination = addQueryArgs(
				{
					siteId: destinationSiteId,
					siteSlug: destinationSiteSlug,
					from,
					platform,
					importSessionId: urlQueryParams.get( 'importSessionId' ),
					domainChoice,
				},
				`/setup/${ flowPath }/${ STEPS.STATIC_SITE_IMPORT_READY.slug }`
			);

			return goToCheckout( {
				flowName: flowPath,
				stepName: STEPS.UNIFIED_PLANS.slug,
				siteSlug: destinationSiteSlug,
				destination,
				from,
				plan,
				historyBack: true,
			} );
		};

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const {
						from: identifiedFrom,
						platform: identifiedPlatform,
						action,
					} = providedDependencies as {
						from?: string;
						platform?: ImporterPlatform;
						action: SiteMigrationIdentifyAction;
					};

					if (
						action === 'skip_platform_identification' ||
						! canUseStaticSiteImport( identifiedPlatform, identifiedFrom )
					) {
						return exitToMigrationFlow(
							identifiedFrom ?? '',
							action === 'skip_platform_identification'
								? 'unknown'
								: ( identifiedPlatform ?? 'unknown' )
						);
					}

					return navigate(
						addQueryArgs(
							{ from: identifiedFrom, platform: identifiedPlatform, importSessionId: '' },
							STEPS.STATIC_SITE_IMPORT_READING.slug
						) as `${ typeof STEPS.STATIC_SITE_IMPORT_READING.slug }?${ string }`
					);
				}

				case STEPS.STATIC_SITE_IMPORT_READING.slug: {
					if ( providedDependencies.action === 'unavailable' ) {
						return exitToMigrationFlow( from, platform );
					}

					return navigate(
						`${ STEPS.STATIC_SITE_IMPORT_RESULTS.slug }?importSessionId=${ encodeURIComponent(
							providedDependencies.importSessionId
						) }`,
						undefined,
						true
					);
				}

				case STEPS.STATIC_SITE_IMPORT_RESULTS.slug:
					if ( providedDependencies.action === 'restart' ) {
						return restartReading();
					}

					return navigate( STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS.slug );

				case STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS.slug: {
					if ( hasSite( siteId, siteSlug ) ) {
						return navigate(
							isSiteOnPaidPlan ? STEPS.STATIC_SITE_IMPORT_READY.slug : STEPS.UNIFIED_PLANS.slug
						);
					}

					return navigate( STEPS.STATIC_SITE_IMPORT_ADDRESS.slug );
				}

				case STEPS.STATIC_SITE_IMPORT_ADDRESS.slug: {
					const { domainChoice: choice, siteUrl } = providedDependencies;
					if ( choice === 'register' ) {
						return navigate( `${ STEPS.DOMAIN_SEARCH.slug }?domainChoice=${ choice }` );
					}
					if ( siteUrl ) {
						setSiteUrl( siteUrl );
					}

					return navigate( `${ STEPS.UNIFIED_PLANS.slug }?domainChoice=${ choice }` );
				}

				case STEPS.DOMAIN_SEARCH.slug: {
					if ( providedDependencies && ! providedDependencies.navigateToUseMyDomain ) {
						setSiteUrl( providedDependencies.siteUrl as string );
						setDomain( providedDependencies.suggestion as DomainSuggestion );
						setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
						setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
						setSignupDomainOrigin(
							( providedDependencies.signupDomainOrigin as string ) ?? SIGNUP_DOMAIN_ORIGIN.CUSTOM
						);
					}

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}

				case STEPS.UNIFIED_PLANS.slug: {
					const planCartItem = providedDependencies?.cartItems?.[ 0 ];
					if ( planCartItem ) {
						setPlanCartItem( planCartItem );
					}

					// A new site gets the plan in its cart when it's created; an existing one needs it here.
					if ( hasSite( siteId, siteSlug ) ) {
						return goToImportCheckout( siteId, siteSlug, planCartItem?.product_slug );
					}

					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}

				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug, undefined, true );

				case STEPS.PROCESSING.slug: {
					const {
						siteCreated,
						siteId: createdSiteId,
						siteSlug: createdSiteSlug,
						goToCheckout: shouldGoToCheckout,
					} = providedDependencies as {
						siteCreated?: boolean;
						siteId: number;
						siteSlug: string;
						goToCheckout?: boolean;
					};

					if ( ! siteCreated ) {
						return navigate( STEPS.ERROR.slug, { message: 'Site not created' } );
					}

					recordSignupComplete( { siteId: createdSiteId } );

					if ( shouldGoToCheckout ) {
						return goToImportCheckout( createdSiteId, createdSiteSlug );
					}

					return navigate(
						`${
							STEPS.STATIC_SITE_IMPORT_READY.slug
						}?siteId=${ createdSiteId }&siteSlug=${ encodeURIComponent( createdSiteSlug ) }`,
						undefined,
						true
					);
				}

				case STEPS.STATIC_SITE_IMPORT_READY.slug: {
					if ( providedDependencies.action === 'restart' ) {
						return restartReading();
					}

					return navigate( STEPS.STATIC_SITE_IMPORT_BUILDING.slug, undefined, true );
				}

				case STEPS.STATIC_SITE_IMPORT_BUILDING.slug:
					return navigate(
						providedDependencies.state === 'finished'
							? STEPS.STATIC_SITE_IMPORT_DONE.slug
							: STEPS.STATIC_SITE_IMPORT_FAILED.slug,
						undefined,
						true
					);

				case STEPS.STATIC_SITE_IMPORT_DONE.slug: {
					if ( providedDependencies.action === 'reported' ) {
						return navigate( STEPS.STATIC_SITE_IMPORT_EXPERT.slug );
					}

					if ( providedDependencies.action === 'connect-domain' ) {
						return exitFlow(
							addQueryArgs(
								{ initialQuery: getSourceHost( from ) },
								`/domains/add/use-my-domain/${ siteSlug }`
							)
						);
					}

					return exitFlow( `/home/${ siteSlug }` );
				}

				case STEPS.STATIC_SITE_IMPORT_EXPERT.slug: {
					if ( providedDependencies.finished ) {
						return navigate( STEPS.STATIC_SITE_IMPORT_DONE.slug );
					}

					return exitToMigrationFlow( from, platform );
				}

				case STEPS.STATIC_SITE_IMPORT_FAILED.slug:
					return navigate( STEPS.STATIC_SITE_IMPORT_EXPERT.slug );
			}
		};

		const goBack = () => {
			switch ( currentStep ) {
				case STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS.slug:
					return navigate( STEPS.STATIC_SITE_IMPORT_RESULTS.slug );
				case STEPS.STATIC_SITE_IMPORT_ADDRESS.slug:
					return navigate( STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS.slug );
				case STEPS.DOMAIN_SEARCH.slug:
					return navigate( STEPS.STATIC_SITE_IMPORT_ADDRESS.slug );
				case STEPS.UNIFIED_PLANS.slug:
					if ( hasSite( siteId, siteSlug ) ) {
						return navigate( STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS.slug );
					}
					return navigate(
						domainChoice === 'register'
							? STEPS.DOMAIN_SEARCH.slug
							: STEPS.STATIC_SITE_IMPORT_ADDRESS.slug
					);
			}
		};

		return { submit, goBack };
	},
};

export default staticSiteImport;
