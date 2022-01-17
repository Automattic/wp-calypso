import classnames from 'classnames';
import { translate, TranslateOptions, TranslateOptionsText } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import importerConfig from 'calypso/lib/importer/importer-config';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import CompleteScreen from '../components/complete-screen';
import GettingStartedVideo from '../components/getting-started-video';
import ImporterDrag from '../components/importer-drag';
import ProgressScreen from '../components/progress-screen';
import { Importer, ImporterBaseProps, ImportJob, ImportJobParams } from '../types';
import { getImporterTypeForEngine } from '../util';

export const MediumImporter: React.FunctionComponent< ImporterBaseProps > = ( props ) => {
	const importer: Importer = 'medium';
	const { job, siteId, site, siteSlug, fromSite, importSite, startImport, resetImport } = props;
	const importerData = importerConfig().medium;

	populateMessages();

	/**
	 * Effects
	 */
	useEffect( runImport, [ job ] );

	/**
	 ↓ Methods
	 */
	function runImport() {
		// if ( ! run ) return;

		// If there is no existing import job, start a new
		if ( job === undefined ) {
			startImport( siteId, getImporterTypeForEngine( importer ) );
		} else if ( job.importerState === appStates.READY_FOR_UPLOAD ) {
			importSite( prepareImportParams() );
		}
	}

	function prepareImportParams(): ImportJobParams {
		const targetSiteUrl = fromSite.startsWith( 'http' ) ? fromSite : 'https://' + fromSite;

		return {
			engine: importer,
			importerStatus: job as ImportJob,
			params: { engine: importer },
			site: { ID: siteId },
			targetSiteUrl,
			supportedContent: [],
			unsupportedContent: [],
		};
	}

	function checkProgress() {
		return job?.importerState === appStates.IMPORTING;
	}

	function checkIsSuccess() {
		return job?.importerState === appStates.IMPORT_SUCCESS;
	}

	function showVideoComponent() {
		return checkProgress() || checkIsSuccess();
	}

	// Change the default messages
	function populateMessages() {
		const options: TranslateOptions = {
			args: {
				importerName: 'Medium',
			},
			components: {
				supportLink: (
					<InlineSupportLink supportContext="importers-medium" showIcon={ false }>
						{ translate( 'Need help exporting your content?' ) }
					</InlineSupportLink>
				),
			},
		};

		importerData.title = translate( 'Import content from %(importerName)s', {
			...options,
			textOnly: true,
		} as TranslateOptionsText ) as string;

		importerData.description = translate(
			'Import your posts, tags, images, and videos from your %(importerName)s export file',
			options
		);

		importerData.uploadDescription = translate(
			'A %(importerName)s export file is a ZIP file containing several HTML files with your stories. ' +
				'{{supportLink/}}',
			options
		);
	}

	return (
		<>
			<div className={ classnames( `importer-${ importer }`, 'import-layout__center' ) }>
				{ ( () => {
					if ( ! job ) {
						return;
					} else if ( checkIsSuccess() ) {
						/**
						 * Complete screen
						 */
						return (
							<CompleteScreen
								siteId={ siteId }
								siteSlug={ siteSlug }
								job={ job as ImportJob }
								resetImport={ resetImport }
							/>
						);
					} else if ( checkProgress() ) {
						/**
						 * Progress screen
						 */
						return <ProgressScreen job={ job } />;
					}

					/**
					 * Upload section
					 */
					return (
						<ImporterDrag site={ site } importerData={ importerData } importerStatus={ job } />
					);
				} )() }

				{ showVideoComponent() && <GettingStartedVideo /> }
			</div>
		</>
	);
};

export default connect( null, {
	importSite,
	startImport,
	resetImport,
} )( MediumImporter );
