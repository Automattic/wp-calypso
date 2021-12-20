import { Hooray, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import DoneButton from '../components/done-button';
import { Importer, ImportJob, ImportJobParams } from '../types';

import './style.scss';

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
	const { job, siteId, siteSlug } = props;

	function checkIsSuccess() {
		return true;
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
