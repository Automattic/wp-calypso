import { isEnabled } from '@automattic/calypso-config';
import classnames from 'classnames';
import React, { useEffect } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import { Importer, ImportJob, ImportJobParams, StepNavigator } from 'calypso/blocks/importer/types';
import { getImporterTypeForEngine } from 'calypso/blocks/importer/util';
import { useDispatch } from 'calypso/state';
import { startImport, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import CompleteScreen from '../../components/complete-screen';
import ErrorMessage from '../../components/error-message';
import ImporterDrag from '../../components/importer-drag';
import { getImportDragConfig } from '../../components/importer-drag/config';
import ProgressScreen from '../../components/progress-screen';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	job?: ImportJob;
	importer: Importer;
	siteItem: SiteDetails | null | undefined;
	siteSlug: string;
	siteAnalyzedData: UrlData | null;
	stepNavigator?: StepNavigator;
}

const ImportContentOnly: React.FunctionComponent< Props > = ( props ) => {
	const dispatch = useDispatch();

	/**
	 ↓ Fields
	 */
	const { job, importer, siteItem, siteSlug, siteAnalyzedData, stepNavigator } = props;

	/**
	 ↓ Effects
	 */
	useEffect( handleJobStateTransition, [ job ] );

	/**
	 ↓ Methods
	 */
	function handleJobStateTransition() {
		// If there is no existing import job, create a new job
		if ( job === undefined ) {
			dispatch( startImport( siteItem?.ID, getImporterTypeForEngine( importer ) ) );
		}
		// If the job is in a ready state, start the import process
		else if ( job.importerState === appStates.READY_FOR_UPLOAD ) {
			dispatch( importSite( prepareImportParams() ) );
		}
	}

	function prepareImportParams(): ImportJobParams {
		const targetSiteUrl = siteSlug.startsWith( 'http' ) ? siteSlug : 'https://' + siteSlug;

		return {
			engine: importer,
			importerStatus: job as ImportJob,
			params: { engine: importer },
			site: { ID: siteItem?.ID as number },
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

	/**
	 ↓ HTML Renders
	 */
	function renderHooray() {
		function onSiteViewClick() {
			if ( isEnabled( 'onboarding/import-redirect-to-themes' ) ) {
				stepNavigator?.navigate?.( 'designSetup' );
			} else {
				stepNavigator?.goToSiteViewPage?.();
			}
		}
		return (
			<CompleteScreen
				siteId={ siteItem?.ID as number }
				siteSlug={ siteSlug }
				job={ job as ImportJob }
				resetImport={ () => {
					dispatch( resetImport( siteItem?.ID, job?.importerId ) );
				} }
				onSiteViewClick={ onSiteViewClick }
			/>
		);
	}

	function renderProgress() {
		return <ProgressScreen job={ job } />;
	}

	function renderImportDrag() {
		return (
			job && (
				<ImporterDrag
					site={ siteItem }
					urlData={ siteAnalyzedData }
					importerData={ getImportDragConfig( importer, stepNavigator?.supportLinkModal ) }
					importerStatus={ job }
				/>
			)
		);
	}

	return (
		<>
			<div className={ classnames( 'import__import-content-only' ) }>
				{ ( () => {
					if ( checkIsSuccess() ) {
						return renderHooray();
					} else if ( checkIsFailed() ) {
						return (
							<ErrorMessage
								onStartBuilding={ stepNavigator?.goToIntentPage }
								onBackToStart={ stepNavigator?.goToImportCapturePage }
							/>
						);
					} else if ( checkProgress() ) {
						return renderProgress();
					}
					return renderImportDrag();
				} )() }
			</div>
		</>
	);
};

export default ImportContentOnly;
