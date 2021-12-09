import { isEnabled } from '@automattic/calypso-config';
import { Title } from '@automattic/onboarding';
import page from 'page';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import StepWrapper from 'calypso/signup/step-wrapper';
import { fetchImporterState } from 'calypso/state/imports/actions';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated,
} from 'calypso/state/imports/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteId } from 'calypso/state/sites/selectors';
import { Importer, QueryObject, ImportJob } from './types';
import { getImporterTypeForEngine } from './util';
import WixImporter from './wix';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	path: string;
	stepName: string;
	stepSectionName: string;
	queryObject: QueryObject;
	siteId: number;
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
					<div className="import__onboarding-page import-layout__center">
						<div className="import-layout__center">
							{ ( () => {
								/**
								 * Loading screen
								 */
								if ( isLoading() ) {
									return <LoadingEllipsis />;
								} else if ( ! hasPermission() ) {
									/**
									 * Permission screen
									 */
									return <Title>You are not authorized to view this page</Title>;
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
