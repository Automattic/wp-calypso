import page from 'page';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { convertToFriendlyWebsiteName } from 'calypso/signup/steps/import/util';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { ImportJob } from '../types';
import ContentChooser from './content-chooser';
import { ImportEverything } from './import-everything';
import { WPImportType } from './types';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	job?: ImportJob;
	siteId: number;
	siteSlug: string;
	fromSite: string;
}

export const WordpressImporter: React.FunctionComponent< Props > = ( props ) => {
	const dispatch = useDispatch();

	/**
	 ↓ Fields
	 */
	const [ chosenType, setChosenType ] = useState< WPImportType >();
	const { fromSite, siteSlug } = props;
	const siteItem = useSelector( ( state ) => getSiteBySlug( state, siteSlug ) );
	// const fromSiteItem = useSelector( ( state ) => getSiteBySlug( state, convertToFriendlyWebsiteName( fromSite ) ) );
	const fromSiteAnalyzedData = useSelector( getUrlData );

	/**
	 ↓ Effects
	 */
	useEffect( () => {
		dispatch( analyzeUrl( fromSite ) );
	}, [ fromSiteAnalyzedData && fromSiteAnalyzedData.url ] );

	/**
	 ↓ Methods
	 */
	function installJetpack() {
		page( `https://wordpress.com/jetpack/connect/?url=${ fromSite }` );
	}

	function switchToMigrationScreen() {
		setChosenType( 'everything' );
	}

	function switchToContentUploadScreen() {
		setChosenType( 'content_only' );
	}

	function runImportMigrationProcess() {
		// console.log( 'runImportMigrationProcess', fromSiteItem?.ID, siteItem?.ID );
	}

	/**
	 ↓ HTML
	 */
	return (
		<>
			{ chosenType === undefined && (
				<ContentChooser
					onJetpackSelection={ installJetpack }
					onContentOnlySelection={ switchToContentUploadScreen }
					onContentEverythingSelection={ switchToMigrationScreen }
					{ ...props }
				/>
			) }
			{ chosenType === 'everything' && (
				<ImportEverything
					fromSite={ fromSite }
					fromSiteAnalyzedData={ fromSiteAnalyzedData }
					siteItem={ siteItem }
					siteSlug={ siteSlug }
					startImport={ runImportMigrationProcess }
				/>
			) }
			{ chosenType === 'content_only' && <div>Import Content only</div> }
		</>
	);
};

export default WordpressImporter;
