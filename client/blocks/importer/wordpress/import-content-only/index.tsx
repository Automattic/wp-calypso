import classnames from 'classnames';
import { translate, TranslateOptions, TranslateOptionsText } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UrlData } from 'calypso/blocks/import/types';
import InlineSupportLink from 'calypso/components/inline-support-link';
import importerConfig from 'calypso/lib/importer/importer-config';
import {
	Importer,
	ImportJob,
	ImportJobParams,
	StepNavigator,
} from 'calypso/blocks/importer/types';
import { getImporterTypeForEngine } from 'calypso/blocks/importer/util';
import { startImport, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import CompleteScreen from '../../components/complete-screen';
import ErrorMessage from '../../components/error-message';
import GettingStartedVideo from '../../components/getting-started-video';
import ImporterDrag from '../../components/importer-drag';
import ProgressScreen from '../../components/progress-screen';
import type { SitesItem } from 'calypso/state/selectors/get-sites-items';

import './style.scss';

interface Props {
	job?: ImportJob;
	importer: Importer;
	siteItem: SitesItem | null;
	siteSlug: string;
	siteAnalyzedData: UrlData;
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

	function getImportDragConfig() {
		const importerData = importerConfig().wordpress;

		const options: TranslateOptions = {
			args: {
				importerName: 'WordPress',
			},
			components: {
				supportLink: (
					<InlineSupportLink supportContext="importers-wordpress" showIcon={ false }>
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
			'Import posts, pages, and media from your %(importerName)s export file.',
			options
		);

		return importerData;
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

	/**
	 ↓ HTML Renders
	 */
	function renderHooray() {
		return (
			<CompleteScreen
				siteId={ siteItem?.ID as number }
				siteSlug={ siteSlug }
				job={ job as ImportJob }
				resetImport={ () => {
					dispatch( resetImport( siteItem?.ID, job?.importerId ) );
				} }
				onSiteViewClick={ stepNavigator?.goToSiteViewPage }
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
					site={ siteItem as SitesItem }
					urlData={ siteAnalyzedData }
					importerData={ getImportDragConfig() }
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
			{ showVideoComponent() && <GettingStartedVideo /> }
		</>
	);
};

export default ImportContentOnly;
