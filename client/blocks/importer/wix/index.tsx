import { recordTracksEvent } from '@automattic/calypso-analytics';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import { getError } from 'calypso/state/imports/site-importer/selectors';
import CompleteScreen from '../components/complete-screen';
import ErrorMessage from '../components/error-message';
import GettingStartedVideo from '../components/getting-started-video';
import ProgressScreen from '../components/progress-screen';
import { Importer, ImportError, ImportJob, ImportJobParams, StepNavigator } from '../types';
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
	stepNavigator?: StepNavigator;
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
		stepNavigator,
	} = props;

	/**
	 ↓ Effects
	 */
	useEffect( handleRunFlagChange, [ run ] );
	useEffect( handleJobStateTransition, [ job ] );

	/**
	 ↓ Methods
	 */
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
		if ( ! run ) {
			return;
		}

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

	function onTryAgainClick() {
		job?.importerId && resetImport( siteId, job.importerId );
		stepNavigator?.goToImportCapturePage?.();
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

	function onSiteViewClick() {
		recordTracksEvent( 'calypso_site_importer_pick_a_design' );
		stepNavigator?.navigate?.( 'design-setup' );
	}

	return (
		<>
			<div className={ clsx( `importer-${ importer }` ) }>
				{ ( () => {
					if ( checkIsFailed() ) {
						return <ErrorMessage onPrimaryBtnClick={ onTryAgainClick } />;
					} else if ( checkProgress() ) {
						return <ProgressScreen job={ job } />;
					} else if ( checkIsSuccess() ) {
						return (
							<CompleteScreen
								siteId={ siteId }
								siteSlug={ siteSlug }
								job={ job as ImportJob }
								resetImport={ resetImport }
								onSiteViewClick={ onSiteViewClick }
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
