import page from 'page';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/route';
import { convertToFriendlyWebsiteName } from 'calypso/signup/steps/import/util';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { SitesItem } from 'calypso/state/selectors/get-sites-items';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteBySlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { Importer, ImportJob } from '../types';
import { ContentChooser } from './content-chooser';
import ImportContentOnly from './import-content-only';
import ImportEverything from './import-everything';
import { WPImportOption } from './types';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	job?: ImportJob;
	siteId: number;
	siteSlug: string;
	fromSite: string;
}

export const WordpressImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'wordpress';

	/**
	 ↓ Fields
	 */
	const [ option, setOption ] = useState< WPImportOption >();
	const { job, fromSite, siteSlug, siteId } = props;
	const siteItem = useSelector( ( state ) => getSiteBySlug( state, siteSlug ) );
	const fromSiteItem = useSelector( ( state ) =>
		getSiteBySlug( state, convertToFriendlyWebsiteName( fromSite ) )
	);
	const isSiteAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isSiteJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const fromSiteAnalyzedData = useSelector( getUrlData );

	/**
	 ↓ Effects
	 */
	useEffect( checkOptionQueryParam );
	useEffect( checkImporterAvailability, [ siteId ] );

	/**
	 ↓ Methods
	 */
	function installJetpack() {
		page( `https://wordpress.com/jetpack/connect/?url=${ fromSite }` );
	}

	function switchToMigrationScreen() {
		updateCurrentPageQueryParam( { option: WPImportOption.EVERYTHING } );
	}

	function switchToContentUploadScreen() {
		updateCurrentPageQueryParam( { option: WPImportOption.CONTENT_ONLY } );
	}

	function checkImporterAvailability() {
		! isSiteAtomic && isSiteJetpack && redirectToWpAdminImportPage();
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

		page( addQueryArgs( params, currentPath ) );
	}

	function redirectToWpAdminImportPage() {
		return page( `/import/${ siteSlug }` );
	}

	/**
	 ↓ HTML
	 */
	return (
		<>
			{ undefined === option && (
				<ContentChooser
					onJetpackSelection={ installJetpack }
					onContentOnlySelection={ switchToContentUploadScreen }
					onContentEverythingSelection={ switchToMigrationScreen }
					{ ...props }
				/>
			) }

			{ WPImportOption.EVERYTHING === option && (
				<ImportEverything
					url={ fromSite }
					sourceSiteId={ fromSiteItem?.ID as number }
					sourceUrlAnalyzedData={ fromSiteAnalyzedData }
					targetSite={ siteItem as SitesItem }
					targetSiteId={ siteItem?.ID as number }
					targetSiteSlug={ siteSlug }
				/>
			) }

			{ WPImportOption.CONTENT_ONLY === option && (
				<ImportContentOnly
					job={ job }
					fromSite={ fromSite }
					importer={ importer }
					siteItem={ siteItem }
					siteSlug={ siteSlug }
					siteAnalyzedData={ fromSiteAnalyzedData }
				/>
			) }
		</>
	);
};

export default WordpressImporter;
