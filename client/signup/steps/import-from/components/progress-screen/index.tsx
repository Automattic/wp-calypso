import { Progress, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { ProgressBar } from 'calypso/devdocs/design/playground-scope';
import { calculateProgress } from 'calypso/my-sites/importer/importing-pane';
import { ImportJob } from '../../types';

interface Props {
	job?: ImportJob;
}
const ProgressScreen: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { job } = props;

	const progress = job ? calculateProgress( job.progress ) : NaN;
	return (
		<Progress>
			<Title>{ __( 'Importing' ) }...</Title>
			<ProgressBar
				color={ 'black' }
				compact={ true }
				value={ Number.isNaN( progress ) ? 0 : progress }
			/>
			<SubTitle>
				{ __( "This may take a few minutes. We'll notify you by email when it's done." ) }
			</SubTitle>
		</Progress>
	);
};

export default ProgressScreen;
