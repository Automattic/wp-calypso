import { ProgressBar } from '@automattic/components';
import { Progress, Title, SubTitle, Hooray } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { calculateProgress } from 'calypso/my-sites/importer/importing-pane';
import { startImport, resetImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import { Importer, ImportJob } from '../types';
import { getImporterTypeForEngine } from '../util';
import DoneButton from './done-button';

import './style.scss';

interface Props {
	job?: ImportJob;
	run: boolean;
	siteId: number;
	siteSlug: string;
	fromSite: string;
	importSite: ( params: { [ key: string ]: any } ) => void;
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
	useEffect( runImport, [ job ] );

	/**
	 ↓ Methods
	 */
	function runImport() {
		if ( ! run ) return;

		// If there is no existing import job, start a new
		if ( job === undefined ) {
			startImport( siteId, getImporterTypeForEngine( importer ) );
		} else if ( job.importerState === appStates.READY_FOR_UPLOAD ) {
			importSite( prepareImportParams() );
		}
	}

	function prepareImportParams() {
		const targetSiteUrl = fromSite.startsWith( 'http' ) ? fromSite : 'https://' + fromSite;

		return {
			engine: importer,
			importerStatus: job,
			params: { engine: importer },
			site: { ID: siteId },
			targetSiteUrl,
			supportedContent: [],
			unsupportedContent: [],
		};
	}

	function checkLoading() {
		return (
			job?.importerState === appStates.READY_FOR_UPLOAD ||
			job?.importerState === appStates.UPLOAD_SUCCESS
		);
	}

	function checkProgress() {
		return job && job.importerState === appStates.IMPORTING;
	}

	function checkIsSuccess() {
		return job && job.importerState === appStates.IMPORT_SUCCESS;
	}

	return (
		<>
			<div className={ classnames( `importer-${ importer }`, 'import-layout__center' ) }>
				{ ( () => {
					if ( checkLoading() ) {
						/**
						 * Loading screen
						 */
						return <LoadingEllipsis />;
					} else if ( checkProgress() ) {
						/**
						 * Progress screen
						 */
						return (
							<Progress>
								<Title>{ __( 'Importing' ) }...</Title>
								<ProgressBar
									color={ 'black' }
									compact={ true }
									value={ calculateProgress( job?.progress ) }
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
				} )() }
			</div>
		</>
	);
};

export default connect( null, {
	importSite,
	startImport,
	resetImport,
} )( WixImporter );
