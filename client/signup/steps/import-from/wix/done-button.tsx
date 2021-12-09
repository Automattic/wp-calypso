import { NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import React from 'react';
import { ImportJob } from '../types';

interface Props {
	job: ImportJob;
	siteId: number;
	siteSlug: string;
	resetImport: ( siteId: number, importerId: string ) => void;
}
const DoneButton: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { job, siteId, siteSlug, resetImport } = props;

	function onButtonClick() {
		redirectToSiteView();
		resetImport( siteId, job.importerId );
	}

	function redirectToSiteView() {
		const destination = '/view/' + ( siteSlug || '' );
		page( destination );
	}

	return <NextButton onClick={ onButtonClick }>{ __( 'View site' ) }</NextButton>;
};

export default DoneButton;
