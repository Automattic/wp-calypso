import { Onboard } from '@automattic/data-stores';
import { SITE_MIGRATION_FLOW, STATIC_SITE_IMPORT_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import { matchPath } from 'react-router';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	getFullImporterUrl,
	isPlatformImportable,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout, goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { addQueryArgs, pathToUrl } from 'calypso/lib/url';
import {
	getSignupCompleteFlowName,
	getSignupCompleteSiteID,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { withLocale } from '../../helpers/with-locale';
import { siteSetupImportListPath } from '../site-migration-flow/paths';
import { canUseStaticSiteImport } from './helpers';
import type { OnboardActions } from '@automattic/data-stores';
import type {
	AssertConditionResult,
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const BASE_STEPS = [ STEPS.UNIFIED_PLANS, STEPS.STATIC_SITE_IMPORT_READING, STEPS.ERROR ];

// Sources are identified by site-migration, which hands eligible ones here with `from` and `platform`.
function initialize() {
	const { search } = window.location;
	const searchParams = new URLSearchParams( search );
	const platform = searchParams.get( 'platform' ) as ImporterPlatform | null;

	if ( ! canUseStaticSiteImport( platform, searchParams.get( 'from' ) ) ) {
		window.location.replace(
			`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }${ search }`
		);
		return false as const;
	}

	if ( searchParams.has( 'siteId' ) || searchParams.has( 'siteSlug' ) ) {
		return stepsWithRequiredLogin( BASE_STEPS );
	}

	const readingPath = matchPath(
		`/setup/${ STATIC_SITE_IMPORT_FLOW }/${ STEPS.STATIC_SITE_IMPORT_READING.slug }/:lang?`,
		window.location.pathname
	);
	if ( readingPath ) {
		const plansPath = withLocale(
			`/setup/${ STATIC_SITE_IMPORT_FLOW }/plans`,
			readingPath.params.lang ?? ''
		);
		window.location.replace( `${ plansPath }${ search }` );
		return false as const;
	}

	return [
		STEPS.UNIFIED_PLANS,
		...stepsWithRequiredLogin( [ STEPS.STATIC_SITE_IMPORT_READING ] ),
		STEPS.ERROR,
	];
}

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
		const hasDestinationSite = Boolean(
			urlQueryParams.get( 'siteId' ) || urlQueryParams.get( 'siteSlug' )
		);

		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				isInSignup: ! hasDestinationSite,
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
	useAssertConditions(): AssertConditionResult {
		const { isAdmin, isFetching } = useIsSiteAdmin();
		const query = useQuery();
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		const hasDestinationSite = Boolean( query.get( 'siteId' ) || query.get( 'siteSlug' ) );
		useEffect( () => {
			if ( userIsLoggedIn && hasDestinationSite && isAdmin === false ) {
				window.location.assign( '/start' );
			}
		}, [ userIsLoggedIn, hasDestinationSite, isAdmin ] );

		return {
			state:
				hasDestinationSite && userIsLoggedIn && isFetching
					? AssertConditionState.CHECKING
					: AssertConditionState.SUCCESS,
		};
	},

	useStepNavigation( currentStep, navigate: NavigateV2< typeof BASE_STEPS > ) {
		const flowPath = this.variantSlug ?? this.name;
		const locale = useFlowLocale();
		const siteData = useSiteData();
		const urlQueryParams = useQuery();
		const hasDestinationSite = Boolean(
			urlQueryParams.get( 'siteId' ) || urlQueryParams.get( 'siteSlug' )
		);
		const siteId = hasDestinationSite ? siteData.siteId : 0;
		const siteSlug = hasDestinationSite ? siteData.siteSlug : '';
		const site = hasDestinationSite ? siteData.site : undefined;
		const hasSite = Boolean( siteId && siteSlug );
		const from = urlQueryParams.get( 'from' ) ?? '';
		const platform = ( urlQueryParams.get( 'platform' ) || 'unknown' ) as ImporterPlatform;
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE ) as OnboardActions;

		useEffect( () => {
			const restoreDestination = () => {
				const createdSiteId = getSignupCompleteSiteID();
				const destination = retrieveSignupDestination();
				if (
					! hasDestinationSite &&
					getSignupCompleteFlowName() === STATIC_SITE_IMPORT_FLOW &&
					createdSiteId &&
					destination &&
					getQueryArg( destination, 'from' ) === from &&
					getQueryArg( destination, 'platform' ) === platform
				) {
					window.location.replace(
						addQueryArgs( { siteId: createdSiteId }, window.location.href )
					);
				}
			};
			restoreDestination();
			window.addEventListener( 'pageshow', restoreDestination );
			return () => window.removeEventListener( 'pageshow', restoreDestination );
		}, [ hasDestinationSite, from, platform ] );

		const isSiteOnPaidPlan = Boolean( site?.plan ) && ! site?.plan?.is_free;

		const exitFlow = ( to: string ) =>
			window.location.replace( addQueryArgs( { ref: STATIC_SITE_IMPORT_FLOW }, to ) );

		useEffect( () => {
			if ( currentStep === STEPS.UNIFIED_PLANS.slug && isSiteOnPaidPlan ) {
				navigate( STEPS.STATIC_SITE_IMPORT_READING.slug, undefined, true );
			}
		}, [ currentStep, isSiteOnPaidPlan, navigate ] );

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.STATIC_SITE_IMPORT_READING.slug: {
					if ( providedDependencies.action === 'unavailable' ) {
						if ( ! hasSite ) {
							return navigate( STEPS.UNIFIED_PLANS.slug );
						}
						if ( isPlatformImportable( platform ) && from ) {
							return exitFlow( getFullImporterUrl( platform, siteSlug, from ) );
						}
						return exitFlow(
							siteSetupImportListPath( {
								siteId,
								siteSlug,
								from,
								origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
								backToFlow: `/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
							} )
						);
					}

					const { importSessionId } = providedDependencies;
					if ( hasSite && isSiteOnPaidPlan ) {
						return exitFlow(
							addQueryArgs(
								{ importSessionId, from, platform },
								dashboardLink( `/sites/${ siteSlug }` )
							)
						);
					}

					return navigate(
						`${ STEPS.UNIFIED_PLANS.slug }?importSessionId=${ encodeURIComponent( importSessionId ) }`,
						undefined,
						true
					);
				}

				case STEPS.UNIFIED_PLANS.slug: {
					const planCartItem = providedDependencies?.cartItems?.[ 0 ];
					if ( ! planCartItem?.product_slug ) {
						return navigate( STEPS.ERROR.slug, { errorReason: 'no_plan_selected' } );
					}
					setPlanCartItem( planCartItem );
					const cancelDestination = addQueryArgs(
						Object.fromEntries( urlQueryParams ),
						withLocale( `/setup/${ flowPath }/plans`, locale )
					);
					const readingUrl = addQueryArgs(
						{
							...Object.fromEntries( urlQueryParams ),
							siteId: hasSite ? siteId : undefined,
							siteSlug: hasSite ? siteSlug : undefined,
							applySiteSettings:
								! hasSite ||
								( getSignupCompleteFlowName() === STATIC_SITE_IMPORT_FLOW &&
									Number( getSignupCompleteSiteID() ) === siteId )
									? '1'
									: undefined,
						},
						withLocale( `/setup/${ flowPath }/${ STEPS.STATIC_SITE_IMPORT_READING.slug }`, locale )
					);

					if ( hasSite ) {
						return goToCheckout( {
							flowName: flowPath,
							stepName: STEPS.UNIFIED_PLANS.slug,
							siteSlug,
							plan: planCartItem.product_slug,
							destination: readingUrl,
							cancelDestination,
						} );
					}

					return goToUnifiedCheckout( {
						flowName: flowPath,
						plan: planCartItem.product_slug,
						userIsLoggedIn,
						// The pending page resolves the literal placeholder from the purchase receipt.
						destination: `${ readingUrl }&siteId=:siteId`,
						cancelDestination,
						siteIntent: Onboard.SiteIntent.SiteMigration,
						extraQueryParams: {
							lang: locale,
							...Object.fromEntries(
								[ 'coupon', 'ref', 'source' ]
									.filter( ( param ) => urlQueryParams.has( param ) )
									.map( ( param ) => [ param, urlQueryParams.get( param )! ] )
							),
							checkoutBackUrl: pathToUrl( cancelDestination ),
						},
					} );
				}
			}
		};

		const goBack = () => {
			if (
				currentStep === STEPS.UNIFIED_PLANS.slug ||
				currentStep === STEPS.STATIC_SITE_IMPORT_READING.slug
			) {
				return window.location.assign(
					addQueryArgs(
						{
							from,
							siteId: hasSite ? siteId : undefined,
							siteSlug: hasSite ? siteSlug : undefined,
						},
						withLocale(
							`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
							locale
						)
					)
				);
			}
		};

		return { submit, goBack };
	},
};

export default staticSiteImport;
