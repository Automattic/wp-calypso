import { isEnabled } from '@automattic/calypso-config';
import classnames from 'classnames';
import page from 'page';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { fetchImporterState, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated as isImporterStatusHydratedSelector,
} from 'calypso/state/imports/selectors';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSite, getSiteId } from 'calypso/state/sites/selectors';
import BloggerImporter from './blogger';
import NotAuthorized from './components/not-authorized';
import NotFound from './components/not-found';
import MediumImporter from './medium';
import SquarespaceImporter from './squarespace';
import { Importer, ImportJob } from './types';
import { getImporterTypeForEngine } from './util';
import WixImporter from './wix';
import WordpressImporter from './wordpress';
import type { SitesItem } from 'calypso/state/selectors/get-sites-items';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	path: string;
	stepName: string;
	stepSectionName: string;
}
const ImportOnboardingFrom: React.FunctionComponent< Props > = ( props ) => {
	const IMPORT_ROUTE = '/start/from/importing';
	const dispatch = useDispatch();

	/**
	 ↓ Fields
	 */
	const { path, stepName, stepSectionName } = props;
	const engine: Importer = stepSectionName.toLowerCase() as Importer;
	const [ runImportInitially, setRunImportInitially ] = useState( false );
	const urlData = useSelector( getUrlData );
	const searchParams = useSelector( getCurrentQueryArguments );
	let siteSlug = searchParams?.to as string;
	const [ siteId ] = useState( useSelector( ( state ) => getSiteId( state, siteSlug ) as number ) );
	const site = useSelector( ( state ) => getSite( state, siteId ) as SitesItem );
	const siteImports = useSelector( ( state ) => getImporterStatusForSiteId( state, siteId ) );
	const canImport = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );
	const fromSite = searchParams?.from as string;
	const fromSiteData = useSelector( getUrlData );
	const isImporterStatusHydrated = useSelector( isImporterStatusHydratedSelector );
	const getImportJob = ( engine: Importer ): ImportJob | undefined => {
		return siteImports.find( ( x ) => x.type === getImporterTypeForEngine( engine ) );
	};

	/**
	 ↓ Effects
	 */
	useEffect( fetchImporters, [ siteId ] );
	useEffect( checkInitialRunState, [ siteId ] );
	useEffect( () => {
		fromSiteData?.url && dispatch( analyzeUrl( fromSite as string ) );
	}, [ fromSiteData?.url ] );

	/**
	 ↓ Methods
	 */
	function fetchImporters() {
		siteId && dispatch( fetchImporterState( siteId ) );
	}

	function isLoading() {
		return ! isImporterStatusHydrated || ! page.current.startsWith( IMPORT_ROUTE );
	}

	function hasPermission(): boolean {
		return canImport;
	}

	function checkInitialRunState() {
		const searchParams = new URLSearchParams( window.location.search );

		// run query param indicates that the import process can be run immediately,
		// but before proceeding, remove it from the URL path
		// because of the browser's back edge case
		if ( searchParams.get( 'run' ) === 'true' ) {
			setRunImportInitially( true );
			page.replace( path.replace( '&run=true', '' ).replace( 'run=true', '' ) );
		}
	}

	function shouldHideBackBtn() {
		return false;
	}

	function getBackUrl() {
		if ( stepName === 'importing' ) {
			return getStepUrl( 'importer', 'capture', '', '', { siteSlug } );
		}
	}

	function goToPreviousStep() {
		const job = getImportJob( engine );

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
				return dispatch( resetImport( siteId, job.importerId ) );
		}
	}

	/**
	 ↓ HTML Renders
	 */
	function renderBloggerImporter() {
		return (
			<BloggerImporter
				job={ getImportJob( engine ) }
				run={ runImportInitially }
				siteId={ siteId }
				site={ site }
				siteSlug={ siteSlug }
				fromSite={ fromSite }
				urlData={ urlData }
			/>
		);
	}

	function renderMediumImporter() {
		return (
			<MediumImporter
				job={ getImportJob( engine ) }
				run={ runImportInitially }
				siteId={ siteId }
				site={ site }
				siteSlug={ siteSlug }
				fromSite={ fromSite }
				urlData={ urlData }
			/>
		);
	}

	function renderSquarespaceImporter() {
		return (
			<SquarespaceImporter
				job={ getImportJob( engine ) }
				run={ runImportInitially }
				siteId={ siteId }
				site={ site }
				siteSlug={ siteSlug }
				fromSite={ fromSite }
				urlData={ urlData }
			/>
		);
	}

	function renderWixImporter() {
		return (
			<WixImporter
				job={ getImportJob( engine ) }
				run={ runImportInitially }
				siteId={ siteId }
				siteSlug={ siteSlug }
				fromSite={ fromSite }
			/>
		);
	}

	function renderWordpressImporter() {
		return (
			<WordpressImporter
				job={ getImportJob( engine ) }
				siteId={ siteId }
				siteSlug={ siteSlug }
				fromSite={ fromSite }
			/>
		);
	}

	return (
		<>
			<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />

			<StepWrapper
				flowName={ 'importer' }
				stepName={ stepName }
				hideSkip={ true }
				hideBack={ shouldHideBackBtn() }
				backUrl={ getBackUrl() }
				goToPreviousStep={ goToPreviousStep }
				hideNext={ true }
				hideFormattedHeader={ true }
				stepContent={
					<div
						className={ classnames( 'import__onboarding-page import-layout__center', {
							[ `importer-wrapper__${ engine }` ]: !! engine,
						} ) }
					>
						<div className="import-layout__center">
							{ ( () => {
								if ( isLoading() ) {
									return <LoadingEllipsis />;
								} else if ( ! siteSlug ) {
									return <NotFound />;
								} else if ( ! hasPermission() ) {
									return <NotAuthorized siteSlug={ siteSlug } />;
								} else if (
									engine === 'blogger' &&
									isEnabled( 'onboarding/import-from-blogger' )
								) {
									return renderBloggerImporter();
								} else if ( engine === 'medium' && isEnabled( 'onboarding/import-from-medium' ) ) {
									return renderMediumImporter();
								} else if (
									engine === 'squarespace' &&
									isEnabled( 'onboarding/import-from-squarespace' )
								) {
									return renderSquarespaceImporter();
								} else if ( engine === 'wix' && isEnabled( 'onboarding/import-from-wix' ) ) {
									return renderWixImporter();
								} else if (
									engine === 'wordpress' &&
									isEnabled( 'onboarding/import-from-wordpress' )
								) {
									return renderWordpressImporter();
								}
							} )() }
						</div>
					</div>
				}
			/>
		</>
	);
};

export default ImportOnboardingFrom;
