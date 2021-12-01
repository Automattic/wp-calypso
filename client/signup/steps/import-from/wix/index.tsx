import { ProgressBar } from '@automattic/components';
import { Progress, Title, SubTitle, Hooray, NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { calculateProgress } from 'calypso/my-sites/importer/importing-pane';
import { appStates } from 'calypso/state/imports/constants';
import { Importer, QueryObject, ImportJob } from '../types';

import './style.scss';

interface Props {
	queryObject: QueryObject;
	siteId?: number | null;
	fetchImporterState?: ( siteId: number ) => void;
	job?: ImportJob;
}
const WixImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'wix';
	const { __ } = useI18n();
	const { job } = props;

	/**
	 * Methods
	 */
	function checkProgress() {
		return job && job.importerState === appStates.IMPORTING;
	}

	function checkIsSuccess() {
		return job && job.importerState === appStates.IMPORT_SUCCESS;
	}

	return (
		<>
			<div className={ classnames( `importer-${ importer }` ) }>
				{ ( () => {
					/**
					 * Progress screen
					 */
					if ( checkProgress() ) {
						return (
							<Progress>
								<Title>{ __( 'Importing' ) }...</Title>
								<ProgressBar
									color={ 'black' }
									compact={ true }
									value={ calculateProgress( job && job.progress ) }
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
								<NextButton>{ __( 'View site' ) }</NextButton>
							</Hooray>
						);
					}
				} )() }
			</div>
		</>
	);
};

export default WixImporter;
