/* eslint-disable wpcalypso/jsx-classname-namespace */
import { SiteDetails } from '@automattic/data-stores/dist/types/site';
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { StepPath } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { addQueryArgs } from 'calypso/lib/route';
import NotAuthorized from 'calypso/signup/steps/import-from/components/not-authorized';
import NotFound from 'calypso/signup/steps/import-from/components/not-found';
import { useCheckoutUrl } from 'calypso/signup/steps/import-from/hooks/use-checkout-url';
import { Importer, ImportJob, StepNavigator } from 'calypso/signup/steps/import-from/types';
import { getImporterTypeForEngine } from 'calypso/signup/steps/import-from/util';
import { WPImportOption } from 'calypso/signup/steps/import-from/wordpress/types';
import { getWpOrgImporterUrl } from 'calypso/signup/steps/import/util';
import { fetchImporterState, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated as isImporterStatusHydratedSelector,
} from 'calypso/state/imports/selectors';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { StepProps } from '../../types';
import { BASE_STEPPER_ROUTE } from '../import/config';
import { redirect, removeLeadingSlash } from '../import/util';
import { ImporterCompType } from './types';

interface Props {
	importer: Importer;
}

export function withImporterWrapper( Importer: ImporterCompType ) {
	const ImporterWrapper = ( props: Props & StepProps ) => {
		const { __ } = useI18n();
		const dispatch = useDispatch();
		const { importer, navigation } = props;
		const currentRoute = useCurrentRoute();
		const currentSearchParams = useQuery();

		/**
	 	↓ Fields
	 	*/
		const site = useSite();
		const siteSlug = useSiteSlugParam();
		const [ siteId, setSiteId ] = useState( site?.ID );
		! siteId && site?.ID && setSiteId( site?.ID );
		const [ runImportInitially, setRunImportInitially ] = useState( false );
		const canImport = useSelector( ( state ) =>
			canCurrentUser( state, site?.ID as number, 'manage_options' )
		);
		const siteImports = useSelector( ( state ) => getImporterStatusForSiteId( state, siteId ) );
		const isImporterStatusHydrated = useSelector( isImporterStatusHydratedSelector );
		const checkoutUrl = useCheckoutUrl( siteId as number, siteSlug as string );

		const fromSite = currentSearchParams.get( 'from' ) as string;
		const fromSiteData = useSelector( getUrlData );
		const stepNavigator: StepNavigator = {
			goToIntentPage,
			goToImportCapturePage,
			goToSiteViewPage,
			goToCheckoutPage,
			goToWpAdminImportPage,
			goToWpAdminWordPressPluginPage,
			navigate: ( path ) => navigator( path ),
		};

		/**
	 	↓ Effects
	 	*/
		useEffect( fetchImporters, [ siteId ] );
		useEffect( checkInitialRunState, [ siteId ] );
		useEffect( checkSiteSlugUpdate, [ site?.URL ] );
		useEffect( checkFromSiteData, [ fromSiteData?.url ] );
		if ( ! importer ) {
			goToImportCapturePage();
			return null;
		}

		/**
	 	↓ Methods
	 	*/
		function goToIntentPage() {
			navigation.goToStep?.( 'intent' );
		}

		function goToImportCapturePage() {
			navigation.goToStep?.( 'import' );
		}

		function goToSiteViewPage() {
			redirect( `/view/${ siteSlug || '' }` );
		}

		function goToCheckoutPage() {
			navigation.submit?.( { url: getCheckoutUrl() } );
		}

		function goToWpAdminImportPage() {
			redirect( `/import/${ siteSlug }` );
		}

		function goToWpAdminWordPressPluginPage() {
			redirect( getWpOrgImporterUrl( siteSlug as string, 'wordpress' ) );
		}

		function getWordpressImportEverythingUrl(): string {
			const queryParams = {
				from: fromSite,
				to: siteSlug,
				option: WPImportOption.EVERYTHING,
				run: true,
			};

			return addQueryArgs( queryParams, `/${ BASE_STEPPER_ROUTE }/importerWordpress` );
		}

		function getCheckoutUrl() {
			const path = checkoutUrl;
			const queryParams = { redirect_to: getWordpressImportEverythingUrl() };

			return addQueryArgs( queryParams, path );
		}

		function onGoBack() {
			resetImportJob( getImportJob( importer as Importer ) );
			navigation.goBack();
		}

		function fetchImporters() {
			siteId && dispatch( fetchImporterState( siteId ) );
		}

		function navigator( path: string ) {
			const stepPath = removeLeadingSlash( path.replace( BASE_STEPPER_ROUTE, '' ) );
			navigation.goToStep?.( stepPath as StepPath );
		}

		function getImportJob( importer: Importer ): ImportJob | undefined {
			return siteImports.find( ( x ) => x.type === getImporterTypeForEngine( importer ) );
		}

		function resetImportJob( job: ImportJob | undefined ): void {
			if ( ! job ) return;

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
			if ( fromSite !== fromSiteData?.url ) {
				dispatch( analyzeUrl( fromSite ) );
			}
		}

		function checkInitialRunState() {
			// run query param indicates that the import process can be run immediately,
			// but before proceeding, remove it from the URL path
			// because of the browser's back or refresh edge cases
			if ( currentSearchParams.get( 'run' ) === 'true' ) {
				setRunImportInitially( true );
				currentSearchParams.delete( 'run' );

				navigation.goToStep?.( `${ currentRoute }?${ currentSearchParams.toString() }` );
			}
		}

		function checkSiteSlugUpdate() {
			// update site slug when destination site is in transition from simple to atomic
		}

		/**
	 	↓ Renders
	 	*/
		function renderStepContent() {
			if ( isLoading() ) {
				return <LoadingEllipsis />;
			} else if ( ! siteSlug ) {
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
					siteId={ siteId as number }
					site={ site as SiteDetails }
					siteSlug={ siteSlug as string }
					fromSite={ fromSite }
					urlData={ fromSiteData }
					stepNavigator={ stepNavigator }
				/>
			);
		}

		return (
			<>
				<DocumentHead title={ __( 'Import your site content' ) } />

				<StepContainer
					className={ classnames(
						'import__onboarding-page',
						'import-layout__center',
						'importer-wrapper',
						{ [ `importer-wrapper__${ importer }` ]: !! importer }
					) }
					stepName={ 'importer-step' }
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
