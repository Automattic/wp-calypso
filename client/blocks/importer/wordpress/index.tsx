import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSelect, useDispatch } from '@wordpress/data';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { addQueryArgs } from 'calypso/lib/route';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteBySlug, getSite, isJetpackSite } from 'calypso/state/sites/selectors';
import { Importer, ImportJob, StepNavigator } from '../types';
import { ContentChooser } from './content-chooser';
import ImportContentOnly from './import-content-only';
import ImportEverything from './import-everything';
import { WPImportOption } from './types';
import { storeMigrateSource, retrieveMigrateSource } from './utils';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	job?: ImportJob;
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
	const [ option, setOption ] = useState< WPImportOption >();
	const { job, fromSite, siteSlug, siteId, stepNavigator, showConfirmDialog } = props;
	const siteItem = useSelector( ( state ) => getSite( state, siteId ) );
	const fromSiteItem = useSelector( ( state ) =>
		getSiteBySlug( state, fromSite ? convertToFriendlyWebsiteName( fromSite ) : '' )
	);
	const isSiteAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isSiteJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const fromSiteAnalyzedData = useSelector( getUrlData );
	const { setIsMigrateFromWp } = useDispatch( ONBOARD_STORE );
	const isMigrateFromWp = useSelect( ( select ) => select( ONBOARD_STORE ).getIsMigrateFromWp() );

	/**
	 ↓ Effects
	 */
	useEffect( checkOptionQueryParam );
	useEffect( checkImporterAvailability, [ siteId ] );
	useEffect( () => {
		if ( isMigrateFromWp ) {
			storeMigrateSource();
		}
		if ( 'true' === retrieveMigrateSource() ) {
			setIsMigrateFromWp( true );
		}
	}, [] );

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

	function checkImporterAvailability() {
		isNotAtomicJetpack() && redirectToWpAdminImportPage();
	}

	function isNotAtomicJetpack() {
		return ! isSiteAtomic && isSiteJetpack;
	}

	function checkOptionQueryParam() {
		const urlSearchParams = new URLSearchParams( window.location.search );
		const optionParam = urlSearchParams.get( 'option' );
		const options: string[] = Object.values( WPImportOption );

		if ( optionParam && options.indexOf( optionParam ) >= 0 ) {
			setOption( optionParam as WPImportOption );
		} else {
			setOption( undefined );
		}
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
				if ( isNotAtomicJetpack() ) {
					return <LoadingEllipsis />;
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
