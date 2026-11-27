import { getStaticSiteImportErrorCode } from '@automattic/api-core';
import { createStaticSiteImportSessionMutation } from '@automattic/api-queries';
import { Onboard } from '@automattic/data-stores';
import {
	SITE_MIGRATION_FLOW,
	STATIC_SITE_IMPORT_FLOW,
	STATIC_SITE_IMPORT_PREVIEW_FLOW,
} from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout, goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepWithRequiredLogin } from 'calypso/landing/stepper/utils/step-with-required-login';
import { loadExperimentAssignment, useExperiment } from 'calypso/lib/explat';
import { addQueryArgs, addSchemeIfMissing } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { withLocale } from '../../helpers/with-locale';
import { canUseStaticSiteImport } from '../static-site-import-flow/helpers';
import type { OnboardActions } from '@automattic/data-stores';
import type {
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

/** Both variations' steps. Each variation starts at its own first step and goes only to its own. */
const ALL_STEPS = [
	STEPS.SITE_MIGRATION_IDENTIFY,
	STEPS.CONFIDENCE_STEP,
	STEPS.STATIC_SITE_IMPORT_PROGRESS,
	STEPS.UNIFIED_PLANS,
	STEPS.ERROR,
];

/** A source as the progress step names it, so the same site typed two ways still matches. */
const normalizeSource = ( source = '' ) =>
	source.trim() ? addSchemeIfMissing( source.trim(), 'https' ).replace( /\/+$/, '' ) : '';

/** A source named on the flow's URL. */
const getSource = ( query: URLSearchParams ) => query.get( 'from' )?.trim() || '';

/** The source to import: the one named on the flow's URL, or the one stored for this session. */
function useSource() {
	const { get } = useFlowState< typeof initialize >();
	const identified = get( STEPS.SITE_MIGRATION_IDENTIFY.slug );
	const query = useQuery();
	const urlSource = getSource( query );
	if ( urlSource ) {
		return {
			from: urlSource,
			platform: ( query.get( 'platform' ) || 'unknown' ) as ImporterPlatform,
		};
	}
	return {
		from: identified?.from || '',
		platform: ( identified?.platform || 'unknown' ) as ImporterPlatform,
	};
}

export const CHECKOUT_FIRST_EXPERIMENT = 'calypso_static_site_import_preview_checkout_first_202611';
export const CHECKOUT_FIRST_VARIATION = 'import_after_checkout';

/**
 * Leaving checkout comes back to plans with `checkoutExit`, and skipping plans goes to signup with
 * `skippedPlans`. Only the checkout-first variation does either, and signing up can change the
 * assignment, so the URL decides from then on.
 */
const isPastPlans = ( query: URLSearchParams ) =>
	query.get( 'checkoutExit' ) === '1' || query.get( 'skippedPlans' ) === '1';

const isCheckoutFirst = ( variationName: string | null | undefined, query: URLSearchParams ) =>
	variationName === CHECKOUT_FIRST_VARIATION || isPastPlans( query );

function useIsCheckoutFirst() {
	const [ , assignment ] = useExperiment( CHECKOUT_FIRST_EXPERIMENT );
	return isCheckoutFirst( assignment?.variationName, useQuery() );
}

async function initialize() {
	const query = new URLSearchParams( window.location.search );
	const assignment = await loadExperimentAssignment( CHECKOUT_FIRST_EXPERIMENT );
	// The checkout-first variation shows what will be moved, then asks for a plan and checkout
	// before signing up. The new site's Overview shows the move from there.
	const checkoutFirst = isCheckoutFirst( assignment.variationName, query );

	// A source on the URL skips identification.
	const afterIdentify = checkoutFirst ? STEPS.CONFIDENCE_STEP : STEPS.STATIC_SITE_IMPORT_PROGRESS;
	const first = getSource( query ) ? afterIdentify : STEPS.SITE_MIGRATION_IDENTIFY;
	const steps = [ first, ...ALL_STEPS.filter( ( step ) => step !== first ) ];

	// Checkout-first signs up at checkout.
	const needsLogin = ( step: ( typeof ALL_STEPS )[ number ] ) =>
		! checkoutFirst || step === STEPS.STATIC_SITE_IMPORT_PROGRESS;
	return steps.map( ( step ) =>
		needsLogin( step ) ? stepWithRequiredLogin( step ) : step
	) as typeof ALL_STEPS;
}

const staticSiteImportPreview: FlowV2< typeof initialize > = {
	name: STATIC_SITE_IMPORT_PREVIEW_FLOW,
	isSignupFlow: true,
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepsProps() {
		const { get } = useFlowState< typeof initialize >();
		const { from, platform } = useSource();
		const isCheckoutFirstRun = useIsCheckoutFirst();
		const started = get( STEPS.STATIC_SITE_IMPORT_PROGRESS.slug );
		return {
			// Both variations offer the same grid, without Free: the move needs a paid plan.
			[ STEPS.UNIFIED_PLANS.slug ]: {
				isInSignup: true,
				intent: 'plans-default-wpcom',
				hideFreePlan: true,
				// Skipping signs the customer up and moves the site onto a free preview instead.
				skippable: isCheckoutFirstRun,
			},
			[ STEPS.CONFIDENCE_STEP.slug ]: {
				from,
			},
			[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ]: {
				from,
				platform,
				// Going back to this step picks up the move it started, rather than copying the site again.
				startedImport:
					! isCheckoutFirstRun &&
					started?.action === 'started' &&
					normalizeSource( started.sourceUrl ) === normalizeSource( from )
						? started
						: undefined,
			},
		};
	},
	useSideEffect() {
		const { setIntent, resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const { set } = useFlowState< typeof initialize >();
		const query = useQuery();
		const urlSource = getSource( query );
		const urlPlatform = query.get( 'platform' ) || undefined;

		useEffect( () => {
			resetOnboardStore();
			setIntent( Onboard.SiteIntent.SiteMigration );
		}, [ resetOnboardStore, setIntent ] );

		// A source on the URL is stored like an identified one, so it outlasts the URL.
		useEffect( () => {
			if ( urlSource ) {
				set( STEPS.SITE_MIGRATION_IDENTIFY.slug, {
					action: 'continue',
					from: urlSource,
					platform: urlPlatform,
				} );
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps -- `set` changes on every render.
		}, [ urlSource, urlPlatform ] );
	},

	useStepNavigation( currentStep, navigate: NavigateV2< typeof ALL_STEPS > ) {
		const locale = useFlowLocale();
		const { get, set } = useFlowState< typeof initialize >();
		const { from, platform } = useSource();
		const isCheckoutFirstRun = useIsCheckoutFirst();
		const query = useQuery();
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const { mutate: createSession } = useMutation( createStaticSiteImportSessionMutation() );

		const exitFlow = ( to: string ) =>
			window.location.replace( addQueryArgs( { ref: STATIC_SITE_IMPORT_PREVIEW_FLOW }, to ) );

		const siteMigrationUrl = ( slug: string, args: Record< string, string | undefined > ) =>
			addQueryArgs( args, withLocale( `/setup/${ SITE_MIGRATION_FLOW }/${ slug }`, locale ) );

		const plansUrl = ( args: Record< string, string > = {} ) =>
			addQueryArgs(
				args,
				withLocale(
					`/setup/${ STATIC_SITE_IMPORT_PREVIEW_FLOW }/${ STEPS.UNIFIED_PLANS.slug }`,
					locale
				)
			);

		/** A site's Overview, which shows the session's move. */
		const overviewUrl = ( site: string, importSessionId: string ) =>
			`${ dashboardLink( `/sites/${ site }` ) }?${ new URLSearchParams( {
				importSessionId,
				from,
				platform,
			} ) }`;

		const startedMove = () => {
			const started = get( STEPS.STATIC_SITE_IMPORT_PROGRESS.slug );
			return started?.action === 'started' && started.previewSiteSlug ? started : undefined;
		};

		const goToPreviewOverview = ( started = startedMove() ) => {
			if ( ! started?.previewSiteSlug ) {
				return navigate( STEPS.ERROR.slug );
			}
			return exitFlow( overviewUrl( started.previewSiteSlug, started.importSessionId ) );
		};

		const goToWordPressMigration = ( source: string, host?: string, isWpcom?: boolean ) =>
			exitFlow(
				siteMigrationUrl( STEPS.SITE_MIGRATION_CHECK.slug, {
					from: source,
					platform: 'wordpress',
					host: host || undefined,
					isWpcom: isWpcom ? 'true' : undefined,
				} )
			);

		/**
		 * The session names the source, and the site checkout makes takes the move when its Overview
		 * opens, since the customer paid for it there.
		 */
		const checkOutNewSite = ( plan: string ) =>
			createSession( addSchemeIfMissing( from, 'https' ), {
				onSuccess: ( session ) =>
					goToUnifiedCheckout( {
						flowName: STATIC_SITE_IMPORT_PREVIEW_FLOW,
						plan,
						userIsLoggedIn,
						// The pending page resolves the literal placeholder from the purchase receipt.
						destination: overviewUrl( ':siteId', session.session_id ),
						cancelDestination: plansUrl( { from, platform, checkoutExit: '1' } ),
						siteIntent: Onboard.SiteIntent.SiteMigration,
					} ),
				onError: ( error ) =>
					getStaticSiteImportErrorCode( error ) === 'static_site_import_source_is_wordpress'
						? goToWordPressMigration( from )
						: navigate( STEPS.ERROR.slug ),
			} );

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const {
						action,
						from: source = '',
						platform: identifiedPlatform,
						host,
						isWpcom,
						staticSiteImportable,
					} = providedDependencies ?? { action: 'skip_platform_identification' };

					if ( action === 'continue' && identifiedPlatform === 'wordpress' && source ) {
						return goToWordPressMigration( source, host, isWpcom );
					}

					if (
						action === 'continue' &&
						staticSiteImportable &&
						canUseStaticSiteImport( identifiedPlatform as ImporterPlatform, source )
					) {
						set( STEPS.SITE_MIGRATION_IDENTIFY.slug, providedDependencies );
						return navigate(
							isCheckoutFirstRun
								? STEPS.CONFIDENCE_STEP.slug
								: STEPS.STATIC_SITE_IMPORT_PROGRESS.slug
						);
					}

					// Parked, unhealthy and unrecognized sources take the regular migration paths.
					return exitFlow(
						siteMigrationUrl( STEPS.SITE_MIGRATION_IDENTIFY.slug, { from: source || undefined } )
					);
				}

				case STEPS.CONFIDENCE_STEP.slug:
					return navigate( STEPS.UNIFIED_PLANS.slug );

				case STEPS.UNIFIED_PLANS.slug: {
					// The progress step needs login, then builds the preview the move goes onto.
					if ( isCheckoutFirstRun && providedDependencies?.action === 'skip_plan' ) {
						return navigate(
							`${ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug }?${ new URLSearchParams( {
								from,
								platform,
								skippedPlans: '1',
							} ) }`
						);
					}
					const planCartItem = providedDependencies?.cartItems?.[ 0 ];
					if ( ! planCartItem?.product_slug ) {
						return navigate( STEPS.ERROR.slug, { errorReason: 'no_plan_selected' } );
					}
					if ( isCheckoutFirstRun ) {
						setPlanCartItem( planCartItem );
						return checkOutNewSite( planCartItem.product_slug );
					}
					// The plan is for the preview, which already holds the copied site.
					const started = startedMove();
					if ( ! started?.previewSiteSlug ) {
						return navigate( STEPS.ERROR.slug );
					}
					return goToCheckout( {
						flowName: STATIC_SITE_IMPORT_PREVIEW_FLOW,
						stepName: STEPS.UNIFIED_PLANS.slug,
						siteSlug: started.previewSiteSlug,
						plan: planCartItem.product_slug,
						destination: overviewUrl( started.previewSiteSlug, started.importSessionId ),
						cancelDestination: plansUrl(),
					} );
				}

				case STEPS.STATIC_SITE_IMPORT_PROGRESS.slug: {
					switch ( providedDependencies.action ) {
						// The step goes on showing the move, which the flow keeps for going back to it.
						case 'started':
							set( STEPS.STATIC_SITE_IMPORT_PROGRESS.slug, providedDependencies );
							// Checkout-first follows the move on the preview's Overview.
							return isCheckoutFirstRun ? goToPreviewOverview( providedDependencies ) : undefined;
						case 'migrate':
							return goToWordPressMigration( from );
						case 'unavailable':
							return navigate( STEPS.ERROR.slug );
						// The server won't build a preview, so the customer can still move the site by
						// buying a plan for it first.
						case 'preview_failed':
							return exitFlow(
								addQueryArgs(
									{ from, platform },
									withLocale(
										`/setup/${ STATIC_SITE_IMPORT_FLOW }/${ STEPS.UNIFIED_PLANS.slug }`,
										locale
									)
								)
							);
						// The copied site is on the preview, so the customer picks a plan to keep it.
						case 'finished':
							return navigate( STEPS.UNIFIED_PLANS.slug );
					}
					// The preview's Overview shows how a move ended, and what can be done next.
					return goToPreviewOverview();
				}
			}
		};

		// Plans go back to the confidence step, which goes back to identifying the source.
		const goBack = () => {
			if ( currentStep === STEPS.UNIFIED_PLANS.slug ) {
				return navigate( STEPS.CONFIDENCE_STEP.slug );
			}
			if ( ! getSource( query ) ) {
				return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
			}
			return window.location.assign(
				siteMigrationUrl( STEPS.SITE_MIGRATION_IDENTIFY.slug, { from } )
			);
		};

		return {
			submit,
			goBack:
				isCheckoutFirstRun &&
				( currentStep === STEPS.UNIFIED_PLANS.slug || currentStep === STEPS.CONFIDENCE_STEP.slug )
					? goBack
					: undefined,
		};
	},
};

export default staticSiteImportPreview;
