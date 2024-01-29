import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSelect, useDispatch } from '@wordpress/data';
import React, { useEffect, useState } from 'react';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { addQueryArgs } from 'calypso/lib/route';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	getSiteBySlug,
	getSite,
	isJetpackSite,
	hasAllSitesList,
} from 'calypso/state/sites/selectors';
import { Importer, ImportJob, StepNavigator } from '../types';
import { ContentChooser } from './content-chooser';
import ImportContentOnly from './import-content-only';
import ImportEverything from './import-everything';
import { WPImportOption } from './types';
import { storeMigrateSource, retrieveMigrateSource } from './utils';
import type { OnboardSelect } from '@automattic/data-stores';

interface Props {
	job?: ImportJob;
	run?: boolean;
	siteId: number;
	siteSlug: string;
	fromSite: string;
	showConfirmDialog?: boolean;
	stepNavigator?: StepNavigator;
}

export const WordpressImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'wordpress';

	/**
	 ↓ Fields
	 */
	const queryParams = useQuery();
	const [ option, setOption ] = useState< WPImportOption | undefined >(
		getValidOptionParam( queryParams.get( 'option' ) )
	);
	const {
		job,
		run: initImportRun,
		fromSite,
		siteSlug,
		siteId,
		stepNavigator,
		showConfirmDialog,
	} = props;
	const siteItem = useSelector( ( state ) => getSite( state, siteId ) );
	const fromSiteSlug = fromSite ? convertToFriendlyWebsiteName( fromSite ) : '';
	// Check domain without the www first, and with www as a backup
	const fromSiteItem = useSelector(
		( state ) =>
			getSiteBySlug( state, fromSiteSlug ) || getSiteBySlug( state, `www.${ fromSiteSlug }` )
	);
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
	useEffect( checkOptionQueryParam, [ queryParams.get( 'option' ) ] );
	useEffect( checkImporterAvailability, [ siteId ] );
	useEffect( checkIfImportInitFromMigratePlugin, [] );

	/**
	 ↓ Methods
	 */
	function installJetpack() {
		recordTracksEvent( 'calypso_site_importer_install_jetpack' );
		const source = 'import';
		window.open( `/jetpack/connect/?url=${ fromSite }&source=${ source }`, '_blank' );
	}

	function switchToMigrationScreen() {
		recordTracksEvent( 'calypso_site_importer_start_everything_import' );
		updateCurrentPageQueryParam( { option: WPImportOption.EVERYTHING } );
	}

	function switchToContentUploadScreen() {
		isSiteAtomic
			? redirectToWpAdminWordPressImporter()
			: updateCurrentPageQueryParam( { option: WPImportOption.CONTENT_ONLY } );
	}

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

	function checkOptionQueryParam() {
		const optionParam = queryParams.get( 'option' );
		setOption( getValidOptionParam( optionParam ) );
	}

	function getValidOptionParam( param: string | null ) {
		const options: string[] = Object.values( WPImportOption );

		if ( param && options.indexOf( param ) >= 0 ) {
			return param as WPImportOption;
		}

		return undefined;
	}

	function updateCurrentPageQueryParam( params: {
		option: WPImportOption;
		[ key: string ]: string;
	} ) {
		const currentPath = window.location.pathname + window.location.search;

		stepNavigator?.navigate?.( addQueryArgs( params, currentPath ) );
	}

	function redirectToWpAdminImportPage() {
		stepNavigator?.goToWpAdminImportPage?.();
	}

	function redirectToWpAdminWordPressImporter() {
		stepNavigator?.goToWpAdminWordPressPluginPage?.();
	}

	/**
	 ↓ HTML
	 */
	return (
		<>
			{ ( () => {
				if (
					isNotAtomicJetpack() ||
					! hasAllSitesFetched ||
					( WPImportOption.EVERYTHING === option && ! siteItem )
				) {
					return (
						<div className="import-layout__center">
							<LoadingEllipsis />;
						</div>
					);
				} else if ( undefined === option && fromSite ) {
					return (
						<ContentChooser
							onJetpackSelection={ installJetpack }
							onContentOnlySelection={ switchToContentUploadScreen }
							onContentEverythingSelection={ switchToMigrationScreen }
							{ ...props }
						/>
					);
				} else if ( WPImportOption.EVERYTHING === option ) {
					return (
						<ImportEverything
							url={ fromSite }
							sourceSiteId={ fromSiteItem?.ID as number }
							sourceUrlAnalyzedData={ fromSiteAnalyzedData }
							targetSite={ siteItem ?? undefined }
							targetSiteId={ siteId }
							targetSiteSlug={ siteSlug }
							stepNavigator={ stepNavigator }
							isMigrateFromWp={ isMigrateFromWp }
							showConfirmDialog={ showConfirmDialog }
							onContentOnlySelection={ switchToContentUploadScreen }
							initImportRun={ initImportRun }
						/>
					);
				} else if ( WPImportOption.CONTENT_ONLY === option ) {
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
				}
			} )() }
		</>
	);
};

export default WordpressImporter;
