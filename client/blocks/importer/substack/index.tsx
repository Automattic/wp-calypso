import { recordTracksEvent } from '@automattic/calypso-analytics';
import clsx from 'clsx';
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
import { Importer, ImporterBaseProps, ImportJob } from '../types';
import { getImporterTypeForEngine } from '../util';

export const SubstackImporter: React.FunctionComponent< ImporterBaseProps > = ( props ) => {
	const importer: Importer = 'substack';
	const {
		job,
		urlData,
		siteId,
		site,
		siteSlug,
		startImport,
		resetImport,
		stepNavigator,
		renderHeading,
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
	}

	function onTryAgainClick() {
		job?.importerId && resetImport( siteId, job.importerId );
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

	function onSiteViewClick() {
		recordTracksEvent( 'calypso_site_importer_pick_a_design' );
		stepNavigator?.navigate?.( 'design-setup' );
	}

	return (
		<>
			<div className={ clsx( `importer-${ importer }` ) }>
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
								onSiteViewClick={ onSiteViewClick }
							/>
						);
					} else if ( checkIsFailed() ) {
						return <ErrorMessage onPrimaryBtnClick={ onTryAgainClick } />;
					} else if ( checkProgress() ) {
						return <ProgressScreen job={ job } showHeading={ renderHeading } />;
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
							renderHeading={ renderHeading }
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
} )( SubstackImporter );
