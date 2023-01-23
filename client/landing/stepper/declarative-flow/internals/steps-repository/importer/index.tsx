/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NotAuthorized from 'calypso/blocks/importer/components/not-authorized';
import NotFound from 'calypso/blocks/importer/components/not-found';
import { Importer, ImportJob } from 'calypso/blocks/importer/types';
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
import { fetchImporterState, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated as isImporterStatusHydratedSelector,
} from 'calypso/state/imports/selectors';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSite } from 'calypso/state/sites/selectors';
import { StepProps } from '../../types';
import { useAtomicTransferQueryParamUpdate } from './hooks/use-atomic-transfer-query-param-update';
import { useInitialQueryRun } from './hooks/use-initial-query-run';
import { useStepNavigator } from './hooks/use-step-navigator';
import type { ImporterCompType } from './types';

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
		const site = useSite();
		const siteSlug = useSiteSlugParam();
		const [ siteId, setSiteId ] = useState( site?.ID );
		! siteId && site?.ID && setSiteId( site?.ID );
		const runImportInitially = useInitialQueryRun( siteId );
		const canImport = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );
		const siteItem = useSelector( ( state ) => getSite( state, siteId ) );
		const siteImports = useSelector( ( state ) => getImporterStatusForSiteId( state, siteId ) );
		const isImporterStatusHydrated = useSelector( isImporterStatusHydratedSelector );
		const isMigrateFromWp = useSelect( ( select ) => select( ONBOARD_STORE ).getIsMigrateFromWp() );

		const fromSite = currentSearchParams.get( 'from' ) || '';
		const fromSiteData = useSelector( getUrlData );
		const stepNavigator = useStepNavigator( flow, navigation, siteId, siteSlug, fromSite );

		/**
	 	↓ Effects
		 */
		useAtomicTransferQueryParamUpdate( siteId );
		useEffect( fetchImporters, [ siteId ] );
		useEffect( checkFromSiteData, [ fromSiteData?.url ] );
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
			return canImport;
		}

		function isLoading(): boolean {
			return ! isImporterStatusHydrated;
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
		function renderStepContent() {
			if ( isLoading() ) {
				return <LoadingEllipsis />;
			} else if ( ! siteSlug || ! siteItem || ! siteId ) {
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
					site={ siteItem }
					siteSlug={ siteSlug }
					fromSite={ fromSite }
					urlData={ fromSiteData }
					stepNavigator={ stepNavigator }
					showConfirmDialog={ ! isMigrateFromWp }
				/>
			);
		}

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
						{ [ `importer-wrapper__${ importer }` ]: !! importer }
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
