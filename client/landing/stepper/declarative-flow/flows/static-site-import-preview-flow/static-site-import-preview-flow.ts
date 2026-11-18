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
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { addQueryArgs } from 'calypso/lib/url';
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
	STEPS.ERROR,
];

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
		const started = get( STEPS.STATIC_SITE_IMPORT_READING.slug );
		return {
			[ STEPS.STATIC_SITE_IMPORT_READING.slug ]: {
				buildPreview: true,
				sourceUrl: from || undefined,
			},
			[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ]: {
				siteId: started?.action === 'continue' ? started.previewSiteId : undefined,
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
					// A finished preview opens at its share link, which gets past Coming Soon.
					if ( providedDependencies.action === 'finished' && providedDependencies.previewUrl ) {
						return window.location.replace( providedDependencies.previewUrl );
					}
					// The preview's Overview shows how a move ended, and what can be done next.
					return goToPreviewOverview();
				}
			}
		};

		return { submit };
	},
};

export default staticSiteImportPreview;
