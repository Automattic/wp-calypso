import classnames from 'classnames';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import CompleteScreen from '../components/complete-screen';
import ErrorMessage from '../components/error-message';
import GettingStartedVideo from '../components/getting-started-video';
import ImporterDrag from '../components/importer-drag';
import { getImportDragConfig } from '../components/importer-drag/config';
import ProgressScreen from '../components/progress-screen';
import { Importer, ImporterBaseProps, ImportJob, ImportJobParams } from '../types';
import { getImporterTypeForEngine } from '../util';

export const BloggerImporter: React.FunctionComponent< ImporterBaseProps > = ( props ) => {
	const importer: Importer = 'blogger';
	const {
		job,
		urlData,
		siteId,
		site,
		siteSlug,
		fromSite,
		importSite,
		startImport,
		resetImport,
		stepNavigator,
	} = props;

	/**
	 * Effects
	 */
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

	function checkIsFailed() {
		return job?.importerState === appStates.IMPORT_FAILURE;
	}

	function showVideoComponent() {
		return checkProgress() || checkIsSuccess();
	}

	return (
		<>
			<div className={ classnames( `importer-${ importer }`, 'import-layout__center' ) }>
				{ ( () => {
					if ( ! job ) {
						return;
					} else if ( checkIsSuccess() ) {
						return (
							<CompleteScreen
								siteId={ siteId }
								siteSlug={ siteSlug }
								job={ job as ImportJob }
								resetImport={ resetImport }
								onSiteViewClick={ stepNavigator?.goToSiteViewPage }
							/>
						);
					} else if ( checkIsFailed() ) {
						return (
							<ErrorMessage
								onStartBuilding={ stepNavigator?.goToIntentPage }
								onBackToStart={ stepNavigator?.goToImportCapturePage }
							/>
						);
					} else if ( checkProgress() ) {
						return <ProgressScreen job={ job } />;
					}

					/**
					 * Upload section
					 */
					return (
						<ImporterDrag
							urlData={ urlData }
							site={ site }
							importerData={ getImportDragConfig( importer, stepNavigator?.supportLinkModal ) }
							importerStatus={ job }
						/>
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
} )( BloggerImporter );
