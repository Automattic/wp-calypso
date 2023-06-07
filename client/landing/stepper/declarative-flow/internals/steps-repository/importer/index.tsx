/* eslint-disable wpcalypso/jsx-classname-namespace */
import { isEnabled } from '@automattic/calypso-config';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import NotAuthorized from 'calypso/blocks/importer/components/not-authorized';
import NotFound from 'calypso/blocks/importer/components/not-found';
import { getImporterTypeForEngine } from 'calypso/blocks/importer/util';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySites from 'calypso/components/data/query-sites';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
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
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import { StepProps } from '../../types';
import { useAtomicTransferQueryParamUpdate } from './hooks/use-atomic-transfer-query-param-update';
import { useInitialQueryRun } from './hooks/use-initial-query-run';
import { useStepNavigator } from './hooks/use-step-navigator';
import type { ImporterCompType } from './types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { Importer, ImportJob } from 'calypso/blocks/importer/types';

interface Props {
	importer: Importer;
}

export function withImporterWrapper( Importer: ImporterCompType ) {
	const ImporterWrapper = ( props: Props & StepProps ) => {
		const { __ } = useI18n();
		const dispatch = useDispatch();
		const { importer, navigation, flow } = props;
		const currentSearchParams = useQuery();
		/**
	 	↓ Fields
		 */
		const currentUser = useSelector( getCurrentUser );
		const site = useSite();
		const siteSlug = useSiteSlugParam();
		const [ siteId, setSiteId ] = useState( site?.ID );
		const runImportInitially = useInitialQueryRun( siteId );
		const canImport = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );
		const siteImports = useSelector( ( state ) => getImporterStatusForSiteId( state, siteId ) );
		const hasAllSitesFetched = useSelector( ( state ) => hasAllSitesList( state ) );
		const isImporterStatusHydrated = useSelector( isImporterStatusHydratedSelector );
		const isMigrateFromWp = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
			[]
		);
		const fromSite = currentSearchParams.get( 'from' ) || '';
		const fromSiteData = useSelector( getUrlData );
		const stepNavigator = useStepNavigator( flow, navigation, siteId, siteSlug, fromSite );

		/**
	 	↓ Effects
		 */
		useEffect( () => {
			! siteId && site?.ID && setSiteId( site.ID );
		}, [ siteId, site ] );
		useAtomicTransferQueryParamUpdate( siteId );
		useEffect( fetchImporters, [ siteId ] );
		useEffect( checkFromSiteData, [ fromSiteData?.url ] );
		useEffect( () => onComponentUnmount, [] );

		if ( ! importer ) {
			stepNavigator.goToImportCapturePage?.();
			return null;
		}

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

		function isLoading(): boolean {
			return ! isImporterStatusHydrated || ! hasAllSitesFetched;
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
		const renderStepContent = () => {
			if ( isLoading() ) {
				return <LoadingEllipsis />;
			} else if ( ! siteSlug || ! site || ! siteId ) {
				return <NotFound />;
			} else if ( ! hasPermission() ) {
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

		return (
			<>
				<QuerySites siteId={ siteId } />
				<DocumentHead title={ __( 'Import your site content' ) } />
				<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />

				<StepContainer
					className={ classnames(
						'import__onboarding-page',
						'import-layout__center',
						'importer-wrapper',
						{
							[ `importer-wrapper__${ importer }` ]: !! importer,
							'import__onboarding-page--redesign': isEnabled( 'onboarding/import-redesign' ),
						}
					) }
					stepName="importer-step"
					hideSkip={ true }
					hideFormattedHeader={ true }
					goBack={ onGoBack }
					isWideLayout={ true }
					stepContent={ renderStepContent() }
					recordTracksEvent={ recordTracksEvent }
				/>
			</>
		);
	};

	return ImporterWrapper;
}
