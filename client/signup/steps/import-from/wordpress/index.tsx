import page from 'page';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { ImportJob } from '../types';
import ContentChooser, { WPImportType } from './content-chooser';
import { ImportEverything } from './import-everything';

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
	const urlData = useSelector( getUrlData );
	const { fromSite, siteSlug } = props;
	const [ chosenType, setChosenType ] = useState< WPImportType >();

	/**
	 ↓ Effects
	 */
	useEffect( () => {
		dispatch( analyzeUrl( fromSite ) );
	}, [ urlData && urlData.url ] );

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
		// console.log( 'runImportMigrationProcess' );
	}

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
					fromSiteData={ urlData }
					siteSlug={ siteSlug }
					startImport={ runImportMigrationProcess }
				/>
			) }
			{ chosenType === 'content_only' && <div>Import Content only</div> }
		</>
	);
};

export default WordpressImporter;
