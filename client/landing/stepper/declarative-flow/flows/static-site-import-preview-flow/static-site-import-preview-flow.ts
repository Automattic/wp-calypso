import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import {
	SITE_MIGRATION_FLOW,
	STATIC_SITE_IMPORT_FLOW,
	STATIC_SITE_IMPORT_PREVIEW_FLOW,
} from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { addQueryArgs, addSchemeIfMissing } from 'calypso/lib/url';
import { withLocale } from '../../helpers/with-locale';
import { canUseStaticSiteImport } from '../static-site-import-flow/helpers';
import type {
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const ALL_STEPS = [
	STEPS.SITE_MIGRATION_IDENTIFY,
	STEPS.STATIC_SITE_IMPORT_READING,
	STEPS.STATIC_SITE_IMPORT_PROGRESS,
	STEPS.STATIC_SITE_IMPORT_READY,
	STEPS.ERROR,
];

/** A source as the reading step names it, so the same site typed two ways still matches. */
const normalizeSource = ( source = '' ) =>
	source.trim() ? addSchemeIfMissing( source.trim(), 'https' ).replace( /\/+$/, '' ) : '';

/**
 * The preview a finished move was copied onto. The flow state can be dropped on the way, e.g. by a
 * visit to checkout, so the ready step's URL names the preview too.
 */
function getPreview(
	started: { action: string; previewSiteId?: number; previewSiteSlug?: string } | undefined,
	query: URLSearchParams
) {
	const fromState = started?.action === 'continue' ? started : undefined;
	return {
		siteId: fromState?.previewSiteId || Number( query.get( 'previewSiteId' ) ) || undefined,
		siteSlug: fromState?.previewSiteSlug || query.get( 'previewSiteSlug' ) || undefined,
	};
}

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

function initialize() {
	// A source on the URL skips identification.
	if ( getSource( new URLSearchParams( window.location.search ) ) ) {
		return stepsWithRequiredLogin( [
			STEPS.STATIC_SITE_IMPORT_READING,
			STEPS.STATIC_SITE_IMPORT_PROGRESS,
			STEPS.STATIC_SITE_IMPORT_READY,
			STEPS.ERROR,
		] );
	}
	return stepsWithRequiredLogin( ALL_STEPS );
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
		const query = useQuery();
		const started = get( STEPS.STATIC_SITE_IMPORT_READING.slug );
		return {
			[ STEPS.STATIC_SITE_IMPORT_READING.slug ]: {
				buildPreview: true,
				sourceUrl: from || undefined,
				// Going back to this step picks up the move it started, rather than copying the site again.
				startedImport:
					started?.action === 'continue' &&
					started.previewSiteId &&
					normalizeSource( started.sourceUrl ) === normalizeSource( from )
						? started
						: undefined,
			},
			[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ]: {
				siteId: started?.action === 'continue' ? started.previewSiteId : undefined,
				importSessionId: started?.action === 'continue' ? started.importSessionId : undefined,
				from,
				platform,
			},
			[ STEPS.STATIC_SITE_IMPORT_READY.slug ]: {
				...getPreview( started, query ),
				from,
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

	useStepNavigation( _currentStep, navigate: NavigateV2< typeof ALL_STEPS > ) {
		const locale = useFlowLocale();
		const { get, set } = useFlowState< typeof initialize >();
		const { from, platform } = useSource();

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
				} )
			);

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
						return navigate( STEPS.STATIC_SITE_IMPORT_READING.slug );
					}

					// Parked, unhealthy and unrecognized sources take the regular migration paths.
					return exitFlow(
						siteMigrationUrl( STEPS.SITE_MIGRATION_IDENTIFY.slug, { from: source || undefined } )
					);
				}

				case STEPS.STATIC_SITE_IMPORT_READING.slug: {
					switch ( providedDependencies.action ) {
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
					if ( providedDependencies.action === 'finished' ) {
						const { siteId, siteSlug } = getPreview(
							get( STEPS.STATIC_SITE_IMPORT_READING.slug ),
							new URLSearchParams()
						);
						const query = new URLSearchParams( window.location.search );
						if ( siteId && siteSlug ) {
							query.set( 'previewSiteId', String( siteId ) );
							query.set( 'previewSiteSlug', siteSlug );
						}
						return navigate(
							`${ STEPS.STATIC_SITE_IMPORT_READY.slug }?${ query.toString() }` as typeof _currentStep
						);
					}
					// The preview's Overview shows how a move ended, and what can be done next.
					return goToPreviewOverview();
				}

				case STEPS.STATIC_SITE_IMPORT_READY.slug: {
					const { siteSlug: previewSiteSlug } = getPreview(
						get( STEPS.STATIC_SITE_IMPORT_READING.slug ),
						new URLSearchParams( window.location.search )
					);
					if ( ! previewSiteSlug ) {
						return navigate( STEPS.ERROR.slug );
					}
					// Paying, leaving or paying later all come back to the preview's Overview.
					const overview = dashboardLink( `/sites/${ previewSiteSlug }` );
					return goToCheckout( {
						flowName: STATIC_SITE_IMPORT_PREVIEW_FLOW,
						stepName: STEPS.STATIC_SITE_IMPORT_READY.slug,
						siteSlug: previewSiteSlug,
						plan: PLAN_PERSONAL,
						destination: overview,
						cancelDestination: overview,
						extraQueryParams: { checkoutBackUrl: overview, pay_later: '1' },
					} );
				}
			}
		};

		return { submit };
	},
};

export default staticSiteImportPreview;
