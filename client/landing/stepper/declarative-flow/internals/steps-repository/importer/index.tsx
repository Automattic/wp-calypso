/* eslint-disable wpcalypso/jsx-classname-namespace */
import { isEnabled } from '@automattic/calypso-config';
import { SiteDetails } from '@automattic/data-stores/dist/types/site';
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import BloggerImporter from 'calypso/signup/steps/import-from/blogger';
import NotAuthorized from 'calypso/signup/steps/import-from/components/not-authorized';
import NotFound from 'calypso/signup/steps/import-from/components/not-found';
import { Importer, ImportJob } from 'calypso/signup/steps/import-from/types';
import { getImporterTypeForEngine } from 'calypso/signup/steps/import-from/util';
import WordpressImporter from 'calypso/signup/steps/import-from/wordpress';
import { fetchImporterState, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated as isImporterStatusHydratedSelector,
} from 'calypso/state/imports/selectors';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import type { Step } from '../../types';
import './style.scss';

const ImporterStep: Step = function ImportStep( props ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const { navigation } = props;
	const currentRoute = useCurrentRoute();
	const currentSearchParams = useQuery();
	const importerSlug = currentRoute.split( '/' )[ 1 ];
	const importer = importerSlug && ( importerSlug.toLowerCase() as Importer );

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

	const fromSite = currentSearchParams.get( 'from' ) as string;
	const fromSiteData = useSelector( getUrlData );

	/**
	 ↓ Effects
	 */
	useEffect( fetchImporters, [ siteId ] );
	useEffect( checkInitialRunState, [ siteId ] );
	useEffect( checkSiteSlugUpdate, [ site?.URL ] );
	useEffect( checkFromSiteData, [ fromSiteData?.url ] );
	if ( ! importer ) {
		goToHomeStep();
		return null;
	}

	/**
	 ↓ Methods
	 */
	function goToHomeStep() {
		navigation.goToStep?.( 'import' );
	}

	function onGoBack() {
		resetImportJob( getImportJob( importer as Importer ) );
		navigation.goBack();
	}

	function fetchImporters() {
		siteId && dispatch( fetchImporterState( siteId ) );
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
	function renderBloggerImporter() {
		return (
			<BloggerImporter
				job={ getImportJob( importer as Importer ) }
				run={ runImportInitially }
				siteId={ siteId as number }
				site={ site as SiteDetails }
				siteSlug={ siteSlug as string }
				fromSite={ fromSite }
				urlData={ fromSiteData }
			/>
		);
	}

	function renderWordpressImporter() {
		return (
			<WordpressImporter
				job={ getImportJob( importer as Importer ) }
				siteId={ siteId as number }
				siteSlug={ siteSlug as string }
				fromSite={ fromSite }
			/>
		);
	}

	function renderStepContent() {
		return (
			<div
				className={ classnames( 'import__onboarding-page import-layout__center importer-wrapper', {
					[ `importer-wrapper__${ importer }` ]: !! importer,
				} ) }
			>
				{ ( () => {
					if ( isLoading() ) {
						return <LoadingEllipsis />;
					} else if ( ! siteSlug ) {
						return <NotFound />;
					} else if ( ! hasPermission() ) {
						return <NotAuthorized siteSlug={ siteSlug } />;
					} else if ( importer === 'blogger' && isEnabled( 'onboarding/import-from-blogger' ) ) {
						return renderBloggerImporter();
					} else if (
						importer === 'wordpress' &&
						isEnabled( 'onboarding/import-from-wordpress' )
					) {
						return renderWordpressImporter();
					}
				} )() }
			</div>
		);
	}

	return (
		<>
			<DocumentHead title={ __( 'Import your site content' ) } />

			<StepContainer
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

export default ImporterStep;
