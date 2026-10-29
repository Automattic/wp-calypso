import { Onboard } from '@automattic/data-stores';
import { SITE_MIGRATION_FLOW, STATIC_SITE_IMPORT_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
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
import { addQueryArgs } from 'calypso/lib/url';
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

const hasDestinationSite = ( query: URLSearchParams ) =>
	Boolean( query.get( 'siteId' ) || query.get( 'siteSlug' ) );

// Sources are identified by site-migration, which hands eligible ones here with `from` and `platform`.
function initialize() {
	const { pathname, search } = window.location;
	const query = new URLSearchParams( search );
	const platform = query.get( 'platform' ) as ImporterPlatform | null;

	if ( ! canUseStaticSiteImport( platform, query.get( 'from' ) ) ) {
		window.location.replace(
			`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }${ search }`
		);
		return false as const;
	}

	if ( hasDestinationSite( query ) ) {
		return stepsWithRequiredLogin( BASE_STEPS );
	}

	// A new destination comes from checkout, so reading starts at the public plans step.
	if ( pathname.includes( `/${ STEPS.STATIC_SITE_IMPORT_READING.slug }` ) ) {
		window.location.replace(
			pathname.replace( STEPS.STATIC_SITE_IMPORT_READING.slug, STEPS.UNIFIED_PLANS.slug ) + search
		);
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
		return ! hasDestinationSite( new URLSearchParams( window.location.search ) );
	},
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepsProps() {
		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				isInSignup: ! hasDestinationSite( useQuery() ),
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
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		const checksDestination = hasDestinationSite( useQuery() ) && userIsLoggedIn;
		useEffect( () => {
			if ( checksDestination && isAdmin === false ) {
				window.location.assign( '/start' );
			}
		}, [ checksDestination, isAdmin ] );

		return {
			state:
				checksDestination && isFetching
					? AssertConditionState.CHECKING
					: AssertConditionState.SUCCESS,
		};
	},

	useStepNavigation( currentStep, navigate: NavigateV2< typeof BASE_STEPS > ) {
		const flowPath = this.variantSlug ?? this.name;
		const locale = useFlowLocale();
		const urlQueryParams = useQuery();
		const hasDestination = hasDestinationSite( urlQueryParams );
		// Site data can linger from an earlier flow; only the URL names a destination.
		const siteData = useSiteData();
		const siteId = hasDestination ? siteData.siteId : 0;
		const siteSlug = hasDestination ? siteData.siteSlug : '';
		const site = hasDestination ? siteData.site : undefined;
		const hasSite = Boolean( siteId && siteSlug );
		const isSiteOnPaidPlan = Boolean( site?.plan ) && ! site?.plan?.is_free;
		const from = urlQueryParams.get( 'from' ) ?? '';
		const platform = ( urlQueryParams.get( 'platform' ) || 'unknown' ) as ImporterPlatform;
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE ) as OnboardActions;

		useEffect( () => {
			if ( currentStep === STEPS.UNIFIED_PLANS.slug && isSiteOnPaidPlan ) {
				navigate( STEPS.STATIC_SITE_IMPORT_READING.slug, undefined, true );
			}
		}, [ currentStep, isSiteOnPaidPlan, navigate ] );

		const exitFlow = ( to: string ) =>
			window.location.replace( addQueryArgs( { ref: STATIC_SITE_IMPORT_FLOW }, to ) );

		const stepUrl = ( slug: string, args: Record< string, string | undefined > = {} ) =>
			addQueryArgs(
				{ ...Object.fromEntries( urlQueryParams ), ...args },
				withLocale( `/setup/${ flowPath }/${ slug }`, locale )
			);

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
					if ( isSiteOnPaidPlan ) {
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
					const cancelDestination = stepUrl( STEPS.UNIFIED_PLANS.slug );

					if ( hasSite ) {
						return goToCheckout( {
							flowName: flowPath,
							stepName: STEPS.UNIFIED_PLANS.slug,
							siteSlug,
							plan: planCartItem.product_slug,
							destination: stepUrl( STEPS.STATIC_SITE_IMPORT_READING.slug ),
							cancelDestination,
						} );
					}

					return goToUnifiedCheckout( {
						flowName: flowPath,
						plan: planCartItem.product_slug,
						userIsLoggedIn,
						// The pending page resolves the literal placeholder from the purchase receipt.
						destination: `${ stepUrl( STEPS.STATIC_SITE_IMPORT_READING.slug, {
							newSite: '1',
						} ) }&siteId=:siteId`,
						cancelDestination,
						siteIntent: Onboard.SiteIntent.SiteMigration,
					} );
				}
			}
		};

		const goBack = () =>
			window.location.assign(
				addQueryArgs(
					{
						from,
						siteId: siteId || undefined,
						siteSlug: siteSlug || undefined,
					},
					withLocale(
						`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
						locale
					)
				)
			);

		return { submit, goBack };
	},
};

export default staticSiteImport;
