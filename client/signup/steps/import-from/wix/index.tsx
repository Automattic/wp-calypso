import { ProgressBar } from '@automattic/components';
import { Progress, Title, SubTitle, Hooray } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import page from 'page';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { calculateProgress } from 'calypso/my-sites/importer/importing-pane';
import { getStepUrl } from 'calypso/signup/utils';
import { startImport, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import DoneButton from '../components/done-button';
import GettingStartedVideo from '../components/getting-started-video';
import { Importer, ImportJob, ImportJobParams } from '../types';
import { getImporterTypeForEngine } from '../util';

import './style.scss';

interface Props {
	job?: ImportJob;
	run: boolean;
	siteId: number;
	siteSlug: string;
	fromSite: string;
	importSite: ( params: ImportJobParams ) => void;
	startImport: ( siteId: number, type: string ) => void;
	resetImport: ( siteId: number, importerId: string ) => void;
}
export const WixImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'wix';
	const { __ } = useI18n();
	const { job, run, siteId, siteSlug, fromSite, importSite, startImport, resetImport } = props;

	/**
	 ↓ Effects
	 */
	useEffect( handleImporterReadiness, [] );
	useEffect( handleRunFlagChange, [ run ] );
	useEffect( handleJobStateTransition, [ job ] );

	/**
	 ↓ Methods
	 */
	function handleImporterReadiness() {
		if ( ! checkIsImporterReady() ) {
			redirectToImportCapturePage();
		}
	}

	function handleJobStateTransition() {
		// If there is no existing import job, create a new job
		if ( job === undefined ) {
			startImport( siteId, getImporterTypeForEngine( importer ) );
		}
		// If the job is in a ready state, start the import process
		else if ( job.importerState === appStates.READY_FOR_UPLOAD ) {
			importSite( prepareImportParams() );
		}
	}

	function handleRunFlagChange() {
		if ( ! run ) return;

		switch ( job?.importerState ) {
			case appStates.IMPORT_SUCCESS:
			case appStates.EXPIRED:
				// the run flag means to start a new job,
				// but previously reset existing finished jobs
				return resetImport( siteId, job?.importerId );
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

	function redirectToImportCapturePage() {
		page( getStepUrl( 'importer', 'capture', '', '', { siteSlug } ) );
	}

	function checkIsImporterReady() {
		return job || run;
	}

	function checkProgress() {
		return (
			job?.importerState === appStates.IMPORTING ||
			job?.importerState === appStates.READY_FOR_UPLOAD ||
			job?.importerState === appStates.UPLOAD_SUCCESS
		);
	}

	function checkIsSuccess() {
		return job && job.importerState === appStates.IMPORT_SUCCESS;
	}

	function showVideoComponent() {
		return checkProgress() || checkIsSuccess();
	}

	return (
		<>
			<div className={ classnames( `importer-${ importer }`, 'import-layout__center' ) }>
				{ ( () => {
					if ( checkProgress() ) {
						/**
						 * Progress screen
						 */
						const progress = job?.progress ? calculateProgress( job?.progress ) : 0;
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
					}

					/**
					 * Loading screen
					 */
					return <LoadingEllipsis />;
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
} )( WixImporter );
