import { ProgressBar } from '@automattic/components';
import { Progress, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { useCallback } from 'react';
import useProgressValue from './use-progress-value';
import type { ImportJob } from '../../types';

interface Props {
	job?: ImportJob;
}
const ProgressScreen: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { job } = props;
	const { customData } = job || {};
	const progressValue = useProgressValue( job?.progress );

	const getPlaygroundImportTitle = useCallback( () => {
		switch ( customData?.current_step ) {
			case 'unpack_file':
			case 'preprocess':
			case 'process_files':
				return __( 'Moving your files' );

			case 'recreate_database':
			case 'postprocess_database':
			case 'verify_site_integrity':
			case 'clean_up':
				return __( 'Migrating your data' );

			case 'download_archive':
				return __( 'Backing up your data' );

			case 'convert_to_atomic':
			default:
				return __( 'Preparing your site for import' );
		}
	}, [ customData?.current_step ] );

	const title =
		job?.importerFileType !== 'playground' ? __( 'Importing' ) : getPlaygroundImportTitle();

	return (
		<Progress>
			<Title>{ title }...</Title>
			<ProgressBar compact={ true } value={ progressValue } />
			<SubTitle>
				{ __( 'Feel free to close this window. We’ll email you when your new site is ready.' ) }
			</SubTitle>
		</Progress>
	);
};

export default ProgressScreen;
