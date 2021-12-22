import { Hooray, Progress, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { translate, TranslateOptions, TranslateOptionsText } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { ProgressBar } from 'calypso/devdocs/design/playground-scope';
import importerConfig from 'calypso/lib/importer/importer-config';
import { calculateProgress } from 'calypso/my-sites/importer/importing-pane';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import DoneButton from '../components/done-button';
import ImporterDrag, { Site } from '../components/importer-drag';
import { Importer, ImportJob, ImportJobParams } from '../types';
import { getImporterTypeForEngine } from '../util';
import './style.scss';

interface Props {
	job?: ImportJob;
	run: boolean;
	siteId: number;
	site: Site;
	siteSlug: string;
	fromSite: string;
	importSite: ( params: ImportJobParams ) => void;
	startImport: ( siteId: number, type: string ) => void;
	resetImport: ( siteId: number, importerId: string ) => void;
}
export const MediumImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'medium';
	const { __ } = useI18n();
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
			'A %(importerName)s export file is a ZIP file containing several HTML files with your stories.',
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
							<Hooray>
								<Title>{ __( 'Hooray!' ) }</Title>
								<SubTitle>
									{ __( 'Congratulations. Your content was successfully imported.' ) }
								</SubTitle>
								<DoneButton
									siteId={ siteId }
									siteSlug={ siteSlug }
									job={ job as ImportJob }
									resetImport={ resetImport }
								/>
							</Hooray>
						);
					} else if ( checkProgress() ) {
						/**
						 * Progress screen
						 */
						const progress = calculateProgress( job?.progress );
						return (
							<Progress>
								<Title>{ __( 'Importing' ) }...</Title>
								<ProgressBar
									color={ 'black' }
									compact={ true }
									value={ Number.isNaN( progress ) ? 0 : progress }
								/>
								<SubTitle>
									{ __( "This may take a few minutes. We'll notify you by email when it's done." ) }
								</SubTitle>
							</Progress>
						);
					}

					/**
					 * Upload section
					 */
					return (
						<ImporterDrag site={ site } importerData={ importerData } importerStatus={ job } />
					);
				} )() }
			</div>
		</>
	);
};

export default connect( null, {
	importSite,
	startImport,
	resetImport,
} )( MediumImporter );
