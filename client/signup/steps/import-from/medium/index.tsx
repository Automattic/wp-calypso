import { Hooray, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import ImporterMedium from 'calypso/my-sites/importer/importer-medium';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import DoneButton from '../components/done-button';
import { Importer, ImportJob, ImportJobParams } from '../types';
import './style.scss';
import { getImporterTypeForEngine } from '../util';

interface Props {
	job?: ImportJob;
	run: boolean;
	siteId: number;
	siteSlug: string;
	fromSite: string;
	importSite?: ( params: ImportJobParams ) => void;
	startImport?: ( siteId: number, type: string ) => void;
	resetImport?: ( siteId: number, importerId: string ) => void;
}
export const MediumImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'medium';
	const { __ } = useI18n();
	const { job, run, siteId, siteSlug, fromSite } = props;
	// const importerConfig = getImporterByKey( 'importer-type-medium', { siteTitle: 'Medium' } );

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

	function checkIsSuccess() {
		return job && job.importerState === appStates.IMPORT_SUCCESS;
	}

	function afterStartImport() {
		return;
	}

	return (
		<>
			<div className={ classnames( `importer-${ importer }`, 'import-layout__center' ) }>
				{ ( () => {
					if ( checkIsSuccess() ) {
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
					 * Upload section
					 */
					return (
						<ImporterMedium
							site={ props }
							engine={ importer }
							fromSite={ fromSite }
							afterStartImport={ afterStartImport }
						/>
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
