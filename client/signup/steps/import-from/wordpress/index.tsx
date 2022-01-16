import page from 'page';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/route';
import { convertToFriendlyWebsiteName } from 'calypso/signup/steps/import/util';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { ImportJob } from '../types';
import { ContentChooser } from './content-chooser';
import MigrationScreen from './import-everything/migration-screen';
import { MigrationStep } from './types';

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
	const [ step, setStep ] = useState< MigrationStep >();
	const { fromSite, siteSlug } = props;
	const siteItem = useSelector( ( state ) => getSiteBySlug( state, siteSlug ) );
	const fromSiteItem = useSelector( ( state ) =>
		getSiteBySlug( state, convertToFriendlyWebsiteName( fromSite ) )
	);
	const fromSiteAnalyzedData = useSelector( getUrlData );

	/**
	 ↓ Effects
	 */
	useEffect( checkStepQueryParam );
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
		const currentPath = window.location.pathname + window.location.search;
		const queryParams = { step: MigrationStep.CONFIRM };

		page( addQueryArgs( queryParams, currentPath ) );
	}

	function switchToContentUploadScreen() {
		// switchToContentUploadScreen
	}

	function checkStepQueryParam() {
		const urlSearchParams = new URLSearchParams( window.location.search );
		const stepParam = urlSearchParams.get( 'step' );
		const steps: string[] = Object.values( MigrationStep );

		if ( stepParam && steps.indexOf( stepParam ) >= 0 ) {
			setStep( stepParam as MigrationStep );
		} else {
			setStep( MigrationStep.MIGRATE_OR_IMPORT );
		}
	}

	/**
	 ↓ HTML
	 */
	return (
		<>
			{ MigrationStep.MIGRATE_OR_IMPORT === step && (
				<ContentChooser
					onJetpackSelection={ installJetpack }
					onContentOnlySelection={ switchToContentUploadScreen }
					onContentEverythingSelection={ switchToMigrationScreen }
					{ ...props }
				/>
			) }

			{ MigrationStep.CONFIRM === step && (
				<MigrationScreen
					sourceSiteId={ fromSiteItem?.ID as number }
					url={ fromSite }
					step={ step }
					targetSite={ siteItem }
					targetSiteId={ siteItem?.ID as number }
					targetSiteSlug={ siteSlug }
					fromSiteAnalyzedData={ fromSiteAnalyzedData }
				/>
			) }
		</>
	);
};

export default WordpressImporter;
