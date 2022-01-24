import classnames from 'classnames';
import { translate, TranslateOptions, TranslateOptionsText } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import importerConfig from 'calypso/lib/importer/importer-config';
import { Importer, ImportJob, ImportJobParams } from 'calypso/signup/steps/import-from/types';
import { getImporterTypeForEngine } from 'calypso/signup/steps/import-from/util';
import { UrlData } from 'calypso/signup/steps/import/types';
import { startImport, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import { SitesItem } from 'calypso/state/selectors/get-sites-items';
import CompleteScreen from '../../components/complete-screen';
import GettingStartedVideo from '../../components/getting-started-video';
import ImporterDrag, { Site } from '../../components/importer-drag';
import ProgressScreen from '../../components/progress-screen';

import './style.scss';

interface Props {
	job?: ImportJob;
	importer: Importer;
	siteItem: SitesItem | null;
	siteSlug: string;
	siteAnalyzedData: UrlData;
	fromSite: string;
}

const ImportContentOnly: React.FunctionComponent< Props > = ( props ) => {
	const dispatch = useDispatch();

	/**
	 ↓ Fields
	 */
	const { job, importer, siteItem, siteSlug, siteAnalyzedData, fromSite } = props;

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
		const targetSiteUrl = fromSite.startsWith( 'http' ) ? fromSite : 'https://' + fromSite;

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

		importerData.title = translate( 'Import content from <strong>%(importerName)s</strong>', {
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
					site={ siteItem as Site }
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
