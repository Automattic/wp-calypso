import { useSelect, useDispatch } from '@wordpress/data';
import React, { useEffect } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSite, isJetpackSite, hasAllSitesList } from 'calypso/state/sites/selectors';
import { Importer, ImportJob, StepNavigator } from '../types';
import ImportContentOnly from './import-content-only';
import { storeMigrateSource, retrieveMigrateSource } from './utils';
import type { OnboardSelect } from '@automattic/data-stores';

interface Props {
	job?: ImportJob;
	siteId: number;
	siteSlug: string;
	stepNavigator?: StepNavigator;
}

export const WordpressImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'wordpress';

	const { job, siteSlug, siteId, stepNavigator } = props;

	const siteItem = useSelector( ( state ) => getSite( state, siteId ) );
	const isSiteAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isSiteJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const hasAllSitesFetched = useSelector( hasAllSitesList );
	const fromSiteAnalyzedData = useSelector( getUrlData );
	const { setIsMigrateFromWp } = useDispatch( ONBOARD_STORE );
	const isMigrateFromWp = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
		[]
	);

	/**
	 ↓ Effects
	 */
	useEffect( checkImporterAvailability, [ siteId ] );
	useEffect( checkIfImportInitFromMigratePlugin, [] );

	// /**
	//  ↓ Methods
	//  */
	function checkIfImportInitFromMigratePlugin() {
		if ( isMigrateFromWp ) {
			storeMigrateSource();
		}
		if ( 'true' === retrieveMigrateSource() ) {
			setIsMigrateFromWp( true );
		}
	}

	function checkImporterAvailability() {
		isNotAtomicJetpack() && redirectToWpAdminImportPage();
	}

	function isNotAtomicJetpack() {
		return ! isSiteAtomic && isSiteJetpack;
	}

	function redirectToWpAdminImportPage() {
		stepNavigator?.goToWpAdminImportPage?.();
	}

	/**
	 ↓ HTML
	 */
	return (
		<>
			{ ( () => {
				if ( isNotAtomicJetpack() || ! hasAllSitesFetched ) {
					return (
						<div className="import-layout__center">
							<LoadingEllipsis />;
						</div>
					);
				}

				return (
					<ImportContentOnly
						job={ job }
						importer={ importer }
						siteItem={ siteItem }
						siteSlug={ siteSlug }
						siteAnalyzedData={ fromSiteAnalyzedData }
						stepNavigator={ stepNavigator }
					/>
				);
				// Why IIFE?
			} )() }
		</>
	);
};

export default WordpressImporter;
