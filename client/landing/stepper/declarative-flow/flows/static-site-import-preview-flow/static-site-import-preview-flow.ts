import {
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PERSONAL_MONTHLY,
} from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import {
	SITE_MIGRATION_FLOW,
	STATIC_SITE_IMPORT_FLOW,
	STATIC_SITE_IMPORT_PREVIEW_FLOW,
} from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	getFullImporterUrl,
	isPlatformImportable,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { loadExperimentAssignment, useExperiment } from 'calypso/lib/explat';
import { addQueryArgs, addSchemeIfMissing } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { withLocale } from '../../helpers/with-locale';
import { siteSetupImportListPath } from '../site-migration-flow/paths';
import { canUseStaticSiteImport, isCheckoutExitPreview } from '../static-site-import-flow/helpers';
import type { OnboardActions } from '@automattic/data-stores';
import type { StaticSiteImportReadingSubmits } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/static-site-import-reading';
import type {
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

import './style.scss';

const PERSONAL_PLAN_SLUGS = [
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
];

const PREVIEW_FIRST_STEPS = [
	STEPS.SITE_MIGRATION_IDENTIFY,
	STEPS.STATIC_SITE_IMPORT_READING,
	STEPS.STATIC_SITE_IMPORT_PROGRESS,
	STEPS.ERROR,
];

/** A source as the reading step names it, so the same site typed two ways still matches. */
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
 * Checkout sends the customer back with the site it made, or with `checkoutExit` when they left it.
 * Only the checkout-first variation goes there, and signing up at checkout can change the
 * assignment, so the URL decides the variation from then on.
 */
const isBackFromCheckout = ( query: URLSearchParams ) =>
	Boolean( query.get( 'siteId' ) ) || isCheckoutExitPreview( query );

const isCheckoutFirst = ( variationName: string | null | undefined, query: URLSearchParams ) =>
	variationName === CHECKOUT_FIRST_VARIATION || isBackFromCheckout( query );

function useIsCheckoutFirst() {
	const [ , assignment ] = useExperiment( CHECKOUT_FIRST_EXPERIMENT );
	return isCheckoutFirst( assignment?.variationName, useQuery() );
}

/**
 * The checkout-first variation is `static-site-import` up to checkout: the source and plan are
 * chosen before signing up, and the move starts once checkout has made the site.
 */
function initializeCheckoutFirst( query: URLSearchParams ) {
	const { pathname, search } = window.location;
	// The move starts only after checkout, so reading without having been there goes to plans.
	if (
		pathname.includes( `/${ STEPS.STATIC_SITE_IMPORT_READING.slug }` ) &&
		! isBackFromCheckout( query )
	) {
		window.location.replace(
			pathname.replace( STEPS.STATIC_SITE_IMPORT_READING.slug, STEPS.UNIFIED_PLANS.slug ) + search
		);
		return false as const;
	}

	const afterCheckout = [
		...stepsWithRequiredLogin( [ STEPS.STATIC_SITE_IMPORT_READING ] ),
		STEPS.ERROR,
	];
	// A source on the URL skips identification.
	if ( getSource( query ) ) {
		return [ STEPS.UNIFIED_PLANS, ...afterCheckout ];
	}
	return [ STEPS.SITE_MIGRATION_IDENTIFY, STEPS.UNIFIED_PLANS, ...afterCheckout ];
}

async function initialize() {
	const query = new URLSearchParams( window.location.search );
	const assignment = await loadExperimentAssignment( CHECKOUT_FIRST_EXPERIMENT );
	if ( isCheckoutFirst( assignment.variationName, query ) ) {
		return initializeCheckoutFirst( query );
	}

	// A source on the URL skips identification.
	if ( getSource( query ) ) {
		return stepsWithRequiredLogin( [
			STEPS.STATIC_SITE_IMPORT_READING,
			STEPS.STATIC_SITE_IMPORT_PROGRESS,
			STEPS.ERROR,
		] );
	}
	return stepsWithRequiredLogin( PREVIEW_FIRST_STEPS );
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
		const started = get( STEPS.STATIC_SITE_IMPORT_READING.slug );
		return {
			// The checkout-first variation offers the plans `static-site-import` does for a new site.
			[ STEPS.UNIFIED_PLANS.slug ]: {
				isInSignup: true,
				intent: 'plans-default-wpcom',
				hideFreePlan: true,
				hideEnterprisePlan: true,
				highlightLabelOverrides: Object.fromEntries(
					PERSONAL_PLAN_SLUGS.map( ( planSlug ) => [ planSlug, __( 'Recommended' ) ] )
				),
			},
			[ STEPS.STATIC_SITE_IMPORT_READING.slug ]: {
				// After checkout, the step reads from the URL whether it imports into the site
				// checkout made or onto a preview, as in `static-site-import`.
				buildPreview: ! isCheckoutFirstRun,
				sourceUrl: from || undefined,
				// Going back to this step picks up the move it started, rather than copying the site again.
				startedImport:
					! isCheckoutFirstRun &&
					started?.action === 'continue' &&
					started.previewSiteId &&
					normalizeSource( started.sourceUrl ) === normalizeSource( from )
						? started
						: undefined,
			},
			[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ]: {
				// Site creation returns the ID as a string, and the move looks up the preview by a numeric ID.
				siteId:
					started?.action === 'continue' && started.previewSiteId
						? Number( started.previewSiteId )
						: undefined,
				importSessionId: started?.action === 'continue' ? started.importSessionId : undefined,
				from,
				platform,
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

	useStepNavigation(
		currentStep,
		navigate: NavigateV2< [ ...typeof PREVIEW_FIRST_STEPS, typeof STEPS.UNIFIED_PLANS ] >
	) {
		const locale = useFlowLocale();
		const { get, set } = useFlowState< typeof initialize >();
		const { from, platform } = useSource();
		const isCheckoutFirstRun = useIsCheckoutFirst();
		const query = useQuery();
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		// Only checkout names a site, the one it made for the move.
		const siteData = useSiteData();
		const hasSite = Boolean( query.get( 'siteId' ) && siteData.siteId && siteData.siteSlug );
		const siteId = hasSite ? siteData.siteId : 0;
		const siteSlug = hasSite ? siteData.siteSlug : '';

		const exitFlow = ( to: string ) =>
			window.location.replace( addQueryArgs( { ref: STATIC_SITE_IMPORT_PREVIEW_FLOW }, to ) );

		const siteMigrationUrl = ( slug: string, args: Record< string, string | undefined > ) =>
			addQueryArgs( args, withLocale( `/setup/${ SITE_MIGRATION_FLOW }/${ slug }`, locale ) );

		const goToPreviewOverview = () => {
			const started = get( STEPS.STATIC_SITE_IMPORT_READING.slug );
			if ( started?.action !== 'continue' || ! started.previewSiteSlug ) {
				return navigate( STEPS.ERROR.slug );
			}
			return exitFlow(
				addQueryArgs(
					{ importSessionId: started.importSessionId, from, platform },
					dashboardLink( `/sites/${ started.previewSiteSlug }` )
				)
			);
		};

		const goToWordPressMigration = ( source: string, host?: string, isWpcom?: boolean ) =>
			exitFlow(
				siteMigrationUrl( STEPS.SITE_MIGRATION_CHECK.slug, {
					from: source,
					platform: 'wordpress',
					host: host || undefined,
					isWpcom: isWpcom ? 'true' : undefined,
					siteId: hasSite ? String( siteId ) : undefined,
					siteSlug: hasSite ? siteSlug : undefined,
				} )
			);

		const readingUrl = ( args: Record< string, string > ) =>
			addQueryArgs(
				{ from, platform, ...args },
				withLocale(
					`/setup/${ STATIC_SITE_IMPORT_PREVIEW_FLOW }/${ STEPS.STATIC_SITE_IMPORT_READING.slug }`,
					locale
				)
			);

		/** The reading step after checkout, as `static-site-import` handles it for a new destination. */
		const submitReadingAfterCheckout = ( result: StaticSiteImportReadingSubmits ) => {
			const importListPath = siteSetupImportListPath( {
				siteId,
				siteSlug,
				from,
				origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				backToFlow: `/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
			} );
			switch ( result.action ) {
				case 'migrate':
					return goToWordPressMigration( from );
				// Without a preview, leaving checkout goes back to plans.
				case 'preview_failed':
					return navigate( STEPS.UNIFIED_PLANS.slug );
				case 'choose_importer':
					return exitFlow( importListPath );
				case 'unavailable':
					if ( ! hasSite ) {
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}
					if ( isPlatformImportable( platform ) && from ) {
						return exitFlow( getFullImporterUrl( platform, siteSlug, from ) );
					}
					return exitFlow( importListPath );
			}
			// A preview is built to take the import when the customer left checkout.
			const overviewSlug = result.previewSiteSlug || siteSlug;
			if ( ! overviewSlug ) {
				return navigate( STEPS.ERROR.slug );
			}
			return exitFlow(
				addQueryArgs(
					{ importSessionId: result.importSessionId, from, platform },
					dashboardLink( `/sites/${ overviewSlug }` )
				)
			);
		};

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
							isCheckoutFirstRun ? STEPS.UNIFIED_PLANS.slug : STEPS.STATIC_SITE_IMPORT_READING.slug
						);
					}

					// Parked, unhealthy and unrecognized sources take the regular migration paths.
					return exitFlow(
						siteMigrationUrl( STEPS.SITE_MIGRATION_IDENTIFY.slug, { from: source || undefined } )
					);
				}

				case STEPS.UNIFIED_PLANS.slug: {
					const planCartItem = providedDependencies?.cartItems?.[ 0 ];
					if ( ! planCartItem?.product_slug ) {
						return navigate( STEPS.ERROR.slug, { errorReason: 'no_plan_selected' } );
					}
					setPlanCartItem( planCartItem );
					return goToUnifiedCheckout( {
						flowName: STATIC_SITE_IMPORT_PREVIEW_FLOW,
						plan: planCartItem.product_slug,
						userIsLoggedIn,
						// The pending page resolves the literal placeholder from the purchase receipt.
						destination: `${ readingUrl( { newSite: '1' } ) }&siteId=:siteId`,
						// Leaving checkout builds a preview of the import instead of returning to plans.
						cancelDestination: readingUrl( { checkoutExit: '1' } ),
						siteIntent: Onboard.SiteIntent.SiteMigration,
					} );
				}

				case STEPS.STATIC_SITE_IMPORT_READING.slug: {
					if ( isCheckoutFirstRun ) {
						return submitReadingAfterCheckout( providedDependencies );
					}
					switch ( providedDependencies.action ) {
						case 'migrate':
							return goToWordPressMigration( from );
						// A preview has no destination to confirm, so its reading step never offers importers.
						case 'choose_importer':
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
					}

					if ( ! providedDependencies.previewSiteSlug ) {
						return navigate( STEPS.ERROR.slug );
					}
					set( STEPS.STATIC_SITE_IMPORT_READING.slug, providedDependencies );
					if ( ! providedDependencies.previewSiteId ) {
						return goToPreviewOverview();
					}
					return navigate( STEPS.STATIC_SITE_IMPORT_PROGRESS.slug );
				}

				case STEPS.STATIC_SITE_IMPORT_PROGRESS.slug: {
					// The share link gets past Coming Soon, so the customer sees the site that was copied.
					if ( providedDependencies.action === 'finished' && providedDependencies.previewUrl ) {
						return window.location.replace( providedDependencies.previewUrl );
					}
					// The preview's Overview shows how a move ended, and what can be done next.
					return goToPreviewOverview();
				}
			}
		};

		// Plans go back to identifying the source, as in `static-site-import`.
		const goBack = () => {
			if ( ! getSource( query ) ) {
				return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
			}
			return window.location.assign(
				siteMigrationUrl( STEPS.SITE_MIGRATION_IDENTIFY.slug, { from } )
			);
		};

		return {
			submit,
			goBack: isCheckoutFirstRun && currentStep === STEPS.UNIFIED_PLANS.slug ? goBack : undefined,
		};
	},
};

export default staticSiteImportPreview;
