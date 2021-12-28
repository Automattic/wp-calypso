import page from 'page';
import React, { useState } from 'react';
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
	/**
	 ↓ Fields
	 */
	const { fromSite, siteSlug } = props;
	const [ chosenType, setChosenType ] = useState< WPImportType >();

	/**
	 ↓ Methods
	 */
	function installJetpack() {
		page( `https://wordpress.com/jetpack/connect/?url=${ fromSite }` );
	}

	function runMigrationProcess() {
		setChosenType( 'everything' );
	}

	function runContentUploadProcess() {
		setChosenType( 'content_only' );
	}

	return (
		<>
			{ chosenType === undefined && (
				<ContentChooser
					onJetpackSelection={ installJetpack }
					onContentOnlySelection={ runContentUploadProcess }
					onContentEverythingSelection={ runMigrationProcess }
					{ ...props }
				/>
			) }
			{ chosenType === 'everything' && (
				<ImportEverything fromSite={ fromSite } siteSlug={ siteSlug } />
			) }
			{ chosenType === 'content_only' && <div>Import Content only</div> }
		</>
	);
};

export default WordpressImporter;
