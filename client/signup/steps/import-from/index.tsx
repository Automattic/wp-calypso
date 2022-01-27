import { isEnabled } from '@automattic/calypso-config';
import classnames from 'classnames';
import page from 'page';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { fetchImporterState, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated,
} from 'calypso/state/imports/selectors';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSite, getSiteId } from 'calypso/state/sites/selectors';
import { UrlData } from '../import/types';
import BloggerImporter from './blogger';
import NotAuthorized from './components/not-authorized';
import NotFound from './components/not-found';
import MediumImporter from './medium';
import SquarespaceImporter from './squarespace';
import './style.scss';
import { Importer, ImportJob, QueryObject } from './types';
import { getImporterTypeForEngine } from './util';
import WixImporter from './wix';
import WordpressImporter from './wordpress';
import type { SitesItem } from 'calypso/state/selectors/get-sites-items';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	urlData: UrlData;
	path: string;
	stepName: string;
	stepSectionName: string;
	queryObject: QueryObject;
	siteId: number;
	site: SitesItem;
	siteSlug: string;
	fromSite: string;
	canImport: boolean;
	isImporterStatusHydrated: boolean;
	siteImports: ImportJob[];
	fetchImporterState: ( siteId: number ) => void;
}
const ImportOnboardingFrom: React.FunctionComponent< Props > = ( props ) => {
	const {
		urlData,
		stepName,
		stepSectionName,
		siteId,
		site,
		canImport,
		siteSlug,
		siteImports,
		isImporterStatusHydrated,
		fromSite,
		path,
	} = props;

	/**
	 ↓ Fields
	 */
	const engine: Importer = stepSectionName.toLowerCase() as Importer;
	const [ runImportInitially, setRunImportInitially ] = useState( false );
	const getImportJob = ( engine: Importer ): ImportJob | undefined => {
		return siteImports.find( ( x ) => x.type === getImporterTypeForEngine( engine ) );
	};

	const dispatch = useDispatch();

	/**
	 ↓ Effects
	 */
	useEffect( fetchImporters, [ siteId ] );
	useEffect( checkInitialRunState, [ siteId ] );

	/**
	 ↓ Methods
	 */
	function fetchImporters() {
		siteId && props.fetchImporterState( siteId );
	}

	function isLoading() {
		return ! isImporterStatusHydrated;
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
								if ( ! siteSlug ) {
									/**
									 * Not found
									 */
									return <NotFound />;
								} else if ( isLoading() ) {
									/**
									 * Loading screen
									 */
									return <LoadingEllipsis />;
								} else if ( ! hasPermission() ) {
									/**
									 * Permission screen
									 */
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

export default connect(
	( state ) => {
		const searchParams = new URLSearchParams( window.location.search );

		const siteSlug = decodeURIComponentIfValid( searchParams.get( 'to' ) );
		const fromSite = decodeURIComponentIfValid( searchParams.get( 'from' ) );
		const siteId = getSiteId( state, siteSlug ) as number;

		return {
			urlData: getUrlData( state ),
			siteId,
			site: getSite( state, siteId ) as SitesItem,
			siteSlug,
			fromSite,
			siteImports: getImporterStatusForSiteId( state, siteId ),
			isImporterStatusHydrated: isImporterStatusHydrated( state ),
			canImport: canCurrentUser( state, siteId, 'manage_options' ),
		};
	},
	{
		fetchImporterState,
		resetImport,
	}
)( ImportOnboardingFrom );
