import { isEnabled } from '@automattic/calypso-config';
import classnames from 'classnames';
import page from 'page';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import StepWrapper from 'calypso/signup/step-wrapper';
import { fetchImporterState } from 'calypso/state/imports/actions';
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
		stepSectionName,
		siteId,
		site,
		canImport,
		siteSlug,
		siteImports,
		isImporterStatusHydrated,
		fromSite,
	} = props;

	/**
	 ↓ Fields
	 */
	const engine: Importer = stepSectionName.toLowerCase() as Importer;
	const [ runImportInitially, setRunImportInitially ] = useState( false );
	const getImportJob = ( engine: Importer ): ImportJob | undefined => {
		return siteImports.find( ( x ) => x.type === getImporterTypeForEngine( engine ) );
	};

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
			page.replace( props.path.replace( '&run=true', '' ).replace( 'run=true', '' ) );
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
				flowName={ 'import-from' }
				hideSkip={ true }
				hideBack={ true }
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
									isEnabled( 'gutenboarding/import-from-blogger' )
								) {
									return renderBloggerImporter();
								} else if (
									engine === 'medium' &&
									isEnabled( 'gutenboarding/import-from-medium' )
								) {
									return renderMediumImporter();
								} else if (
									engine === 'squarespace' &&
									isEnabled( 'gutenboarding/import-from-squarespace' )
								) {
									return renderSquarespaceImporter();
								} else if ( engine === 'wix' && isEnabled( 'gutenboarding/import-from-wix' ) ) {
									return renderWixImporter();
								} else if (
									engine === 'wordpress' &&
									isEnabled( 'gutenboarding/import-from-wordpress' )
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
	}
)( ImportOnboardingFrom );
