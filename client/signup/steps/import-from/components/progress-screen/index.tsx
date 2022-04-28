import { Progress, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
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
				{ createInterpolateElement(
					__(
						"This may take long depending on your content.<br />No need to wait, we'll notify you by email when it's done."
					),
					{ br: createElement( 'br' ) }
				) }
			</SubTitle>
		</Progress>
	);
};

export default ProgressScreen;
