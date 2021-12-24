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
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSite, getSiteId } from 'calypso/state/sites/selectors';
import { Site } from './components/importer-drag';
import NotAuthorized from './components/not-authorized';
import NotFound from './components/not-found';
import MediumImporter from './medium';
import './style.scss';
import { Importer, ImportJob, QueryObject } from './types';
import { getImporterTypeForEngine } from './util';
import WixImporter from './wix';
import WordpressImporter from './wordpress';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	path: string;
	stepName: string;
	stepSectionName: string;
	queryObject: QueryObject;
	siteId: number;
	site: Site;
	siteSlug: string;
	fromSite: string;
	canImport: boolean;
	isImporterStatusHydrated: boolean;
	siteImports: ImportJob[];
	fetchImporterState: ( siteId: number ) => void;
}
const ImportOnboardingFrom: React.FunctionComponent< Props > = ( props ) => {
	const {
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
									engine === 'medium' &&
									isEnabled( 'gutenboarding/import-from-medium' )
								) {
									/**
									 * Medium importer
									 */
									return (
										<MediumImporter
											job={ getImportJob( engine ) }
											run={ runImportInitially }
											siteId={ siteId }
											site={ site }
											siteSlug={ siteSlug }
											fromSite={ fromSite }
										/>
									);
								} else if ( engine === 'wix' && isEnabled( 'gutenboarding/import-from-wix' ) ) {
									/**
									 * Wix importer
									 */
									return (
										<WixImporter
											job={ getImportJob( engine ) }
											run={ runImportInitially }
											siteId={ siteId }
											siteSlug={ siteSlug }
											fromSite={ fromSite }
										/>
									);
								} else if (
									engine === 'wordpress' &&
									isEnabled( 'gutenboarding/import-from-wordpress' )
								) {
									/**
									 * WordPress importer
									 */
									return <WordpressImporter job={ getImportJob( engine ) } />;
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
			siteId,
			site: getSite( state, siteId ) as Site,
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
