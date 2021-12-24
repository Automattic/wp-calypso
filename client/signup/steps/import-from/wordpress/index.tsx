import page from 'page';
import React from 'react';
import { ImportJob } from '../types';
import ContentChooser from './content-chooser';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	job?: ImportJob;
	siteId: number;
	siteSlug: string;
	fromSite: string;
}

export const WordpressImporter: React.FunctionComponent< Props > = ( props ) => {
	const { fromSite } = props;

	/**
	 ↓ Methods
	 */

	function installJetpack() {
		page( `https://wordpress.com/jetpack/connect/?url=${ fromSite }` );
	}

	function runMigrationProcess() {
		// run migration process
	}

	function runContentUploadProcess() {
		// run content upload process
	}

	return (
		<ContentChooser
			onJetpackSelection={ installJetpack }
			onContentOnlySelection={ runContentUploadProcess }
			onContentEverythingSelection={ runMigrationProcess }
			{ ...props }
		/>
	);
};

export default WordpressImporter;
