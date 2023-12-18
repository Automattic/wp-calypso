import { Progress, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { useCallback } from 'react';
import { ProgressBar } from 'calypso/devdocs/design/playground-scope';
import { calculateProgress } from 'calypso/my-sites/importer/importing-pane';
import type { ImportJob } from '../../types';

interface Props {
	job?: ImportJob;
}
const ProgressScreen: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { job } = props;
	const { customData } = job || {};

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

			case 'convert_to_atomic':
			case 'download_archive':
			default:
				return __( 'Backing up your data' );
		}
	}, [ customData?.current_step ] );

	const title =
		job?.importerFileType !== 'playground' ? __( 'Importing' ) : getPlaygroundImportTitle();
	const progress = job ? calculateProgress( job.progress ) : NaN;

	return (
		<Progress>
			<Title>{ title }...</Title>
			<ProgressBar compact={ true } value={ Number.isNaN( progress ) ? 0 : progress } />
			<SubTitle>
				{ __( 'Feel free to close this window. We’ll email you when your new site is ready.' ) }
			</SubTitle>
		</Progress>
	);
};

export default ProgressScreen;
