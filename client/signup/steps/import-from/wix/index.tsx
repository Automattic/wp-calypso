import classnames from 'classnames';
import page from 'page';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { getStepUrl } from 'calypso/signup/utils';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import { getError } from 'calypso/state/imports/site-importer/selectors';
import CompleteScreen from '../components/complete-screen';
import ErrorMessage from '../components/error-message';
import GettingStartedVideo from '../components/getting-started-video';
import ProgressScreen from '../components/progress-screen';
import { Importer, ImportError, ImportJob, ImportJobParams } from '../types';
import { getImporterTypeForEngine } from '../util';

interface Props {
	job?: ImportJob;
	error?: ImportError;
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
	const {
		job,
		error,
		run,
		siteId,
		siteSlug,
		fromSite,
		importSite,
		startImport,
		resetImport,
	} = props;

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

	function checkIsFailed() {
		return (
			( job && job.importerState === appStates.IMPORT_FAILURE ) ||
			( error?.error && error?.errorType === 'importError' )
		);
	}

	function showVideoComponent() {
		return checkProgress() || checkIsSuccess();
	}

	return (
		<>
			<div className={ classnames( `importer-${ importer }`, 'import-layout__center' ) }>
				{ ( () => {
					if ( checkIsFailed() ) {
						return <ErrorMessage siteSlug={ siteSlug } />;
					} else if ( checkProgress() ) {
						return <ProgressScreen job={ job } />;
					} else if ( checkIsSuccess() ) {
						return (
							<CompleteScreen
								siteId={ siteId }
								siteSlug={ siteSlug }
								job={ job as ImportJob }
								resetImport={ resetImport }
							/>
						);
					}

					return <LoadingEllipsis />;
				} )() }

				{ showVideoComponent() && <GettingStartedVideo /> }
			</div>
		</>
	);
};

export default connect(
	( state ) => ( {
		error: getError( state ),
	} ),
	{
		importSite,
		startImport,
		resetImport,
	}
)( WixImporter );
