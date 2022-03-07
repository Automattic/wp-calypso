import { ProgressBar } from '@automattic/components';
import { Title, Progress } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	progress: number;
}

const Scanning: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { progress } = props;

	return (
		<div className="import-layout__center import-light__scanning">
			<div className="import__heading-center">
				<Title>{ __( 'Scanning your site' ) }</Title>
				<Progress>
					<ProgressBar value={ progress } compact={ true } color={ 'black' } />
				</Progress>
			</div>
		</div>
	);
};

export default Scanning;
