/* eslint-disable wpcalypso/jsx-classname-namespace */
import config from '@automattic/calypso-config';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import NotAuthorized from 'calypso/blocks/importer/components/not-authorized';
import NotFound from 'calypso/blocks/importer/components/not-found';
import { getImporterTypeForEngine } from 'calypso/blocks/importer/util';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySites from 'calypso/components/data/query-sites';
import Loading from 'calypso/components/loading';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSaveHostingFlowPathStep } from 'calypso/landing/stepper/hooks/use-save-hosting-flow-path-step';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { logToLogstash } from 'calypso/lib/logstash';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	fetchImporterState,
	resetImport,
	resetImportReceived,
} from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated as isImporterStatusHydratedSelector,
} from 'calypso/state/imports/selectors';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { requestSites } from 'calypso/state/sites/actions';
import { isRequestingSite, hasAllSitesList } from 'calypso/state/sites/selectors';
import { StepProps } from '../../types';
import { useAtomicTransferQueryParamUpdate } from './hooks/use-atomic-transfer-query-param-update';
import { useInitialQueryRun } from './hooks/use-initial-query-run';
import { useStepNavigator } from './hooks/use-step-navigator';
import type { ImporterCompType } from './types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { Importer, ImportJob } from 'calypso/blocks/importer/types';

type StepContainerProps = React.ComponentProps< typeof StepContainer >;

interface Props {
	importer: Importer;
	customizedActionButtons?: StepContainerProps[ 'customizedActionButtons' ];
}

export function withImporterWrapper( Importer: ImporterCompType ) {
	const ImporterWrapper = (
		props: Props &
			StepProps< {
				submits:
					| {
							type: 'redirect';
							url: string;
					  }
					| {
							action: 'verify-email';
					  };
			} >
	) => {
		const { __ } = useI18n();
		const dispatch = useDispatch();
		const { importer, customizedActionButtons, navigation, flow } = props;
		const currentSearchParams = useQuery();
		/**
	 	↓ Fields
		 */
		const currentUser = useSelector( getCurrentUser );
		const { site, siteId, siteSlug } = useSiteData();
		const runImportInitially = useInitialQueryRun( siteId );
		const canImport = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );
		const siteImports = useSelector( ( state ) => getImporterStatusForSiteId( state, siteId ) );
		const isImporterStatusHydrated = useSelector( isImporterStatusHydratedSelector );
		const isMigrateFromWp = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
			[]
		);
		const fromSite = currentSearchParams.get( 'from' ) || '';
		const fromSiteData = useSelector( getUrlData );
		const stepNavigator = useStepNavigator( flow, navigation, siteId, siteSlug, fromSite );
		const currentPath = window.location.pathname + window.location.search;
		const hasAllSitesFetched = useSelector( hasAllSitesList );

		const isRequestingCurrentSite = useSelector( ( state ) =>
			siteId ? isRequestingSite( state, siteId ) : false
		);

		const isLoading = useMemo( () => {
			return ! isImporterStatusHydrated || ! hasAllSitesFetched || isRequestingCurrentSite;
		}, [ isImporterStatusHydrated, hasAllSitesFetched, isRequestingCurrentSite ] );

		useSaveHostingFlowPathStep( flow, currentPath );

		/**
	 	↓ Effects
		 */
		useEffect( () => {
			dispatch( requestSites() );
		}, [ dispatch ] );

		useAtomicTransferQueryParamUpdate( siteId );
		useEffect( fetchImporters, [ siteId ] );
		useEffect( checkFromSiteData, [ fromSiteData?.url ] );
		useEffect( () => onComponentUnmount, [] );

		useEffect( () => {
			if ( ! isLoading && ! site ) {
				logToLogstash( {
					feature: 'calypso_client',
					tags: [ 'importer', importer, 'error' ],
					error: 'Importer missing site info',
					message: 'Importer missing site',
					site_id: siteId,
					site_slug: siteSlug,
					properties: {
						env_id: config( 'env_id' ),
					},
				} );
			}
		}, [ importer, isLoading, site, siteId, siteSlug ] );

		/**
	 	↓ Methods
		 */
		function onGoBack() {
			resetImportJob( getImportJob( importer ) );
			navigation.goBack?.();
		}

		function onComponentUnmount() {
			dispatch( resetImportReceived() );
		}

		function fetchImporters() {
			siteId && dispatch( fetchImporterState( siteId ) );
		}

		function getImportJob( importer: Importer ): ImportJob | undefined {
			return siteImports.find( ( x ) => x.type === getImporterTypeForEngine( importer ) );
		}

		function resetImportJob( job: ImportJob | undefined ): void {
			if ( ! job ) {
				return;
			}

			switch ( job.importerState ) {
				case appStates.IMPORTING:
				case appStates.MAP_AUTHORS:
				case appStates.READY_FOR_UPLOAD:
				case appStates.UPLOAD_PROCESSING:
				case appStates.UPLOAD_SUCCESS:
				case appStates.UPLOADING:
				case appStates.UPLOAD_FAILURE:
					dispatch( resetImport( siteId, job.importerId ) );
					break;
			}
		}

		function hasPermission(): boolean {
			if ( site?.site_owner === currentUser?.ID ) {
				return true;
			}
			return canImport;
		}

		function checkFromSiteData(): void {
			if ( ! fromSite ) {
				return;
			}

			if ( fromSite !== fromSiteData?.url ) {
				dispatch( analyzeUrl( fromSite ) );
			}
		}

		/**
	 	↓ Renders
		 */

		if ( ! importer ) {
			stepNavigator.goToImportCapturePage?.();
			return null;
		}

		const renderStepContent = () => {
			if ( isLoading ) {
				return (
					<div className="import-layout__center">
						<Loading />
					</div>
				);
			}

			if ( ! site ) {
				return <NotFound />;
			}

			if ( ! hasPermission() ) {
				return (
					<NotAuthorized
						onStartBuilding={ stepNavigator?.goToIntentPage }
						onBackToStart={ stepNavigator?.goToImportCapturePage }
					/>
				);
			}

			return (
				<Importer
					job={ getImportJob( importer ) }
					run={ runImportInitially }
					siteId={ siteId }
					site={ site }
					siteSlug={ siteSlug }
					fromSite={ fromSite }
					urlData={ fromSiteData ?? undefined }
					stepNavigator={ stepNavigator }
					showConfirmDialog={ ! isMigrateFromWp }
				/>
			);
		};

		const importJob = getImportJob( importer );
		return (
			<>
				<QuerySites siteId={ siteId } />
				<DocumentHead title={ __( 'Import your site content' ) } />
				<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />

				<StepContainer
					className={ clsx(
						'import__onboarding-page',
						'importer-wrapper',
						'import__onboarding-page--redesign',
						{
							[ `importer-wrapper__${ importer }` ]: !! importer,
						}
					) }
					stepName="importer-step"
					customizedActionButtons={ customizedActionButtons }
					hideSkip={ importJob?.importerState !== appStates.IMPORT_SUCCESS }
					skipLabelText={ __( 'Skip to dashboard' ) }
					onSkip={ () => {
						recordTracksEvent( 'calypso_site_importer_skip_to_dashboard', {
							from: 'success-step',
						} );
						stepNavigator?.goToDashboardPage?.();
					} }
					hideBack={ importJob?.importerState === appStates.IMPORT_SUCCESS }
					hideFormattedHeader
					goBack={ onGoBack }
					isWideLayout
					stepContent={ renderStepContent() }
					recordTracksEvent={ recordTracksEvent }
				/>
			</>
		);
	};

	return ImporterWrapper;
}
