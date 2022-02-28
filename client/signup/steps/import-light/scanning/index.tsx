import { ProgressBar } from '@automattic/components';
import { Title, Progress } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const Scanning: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center import-light__scanning">
			<div className="import__header scanning__header">
				<div className="import__heading import__heading-center">
					<Title>{ __( 'Scanning your site' ) }</Title>
					<Progress>
						<ProgressBar value={ 23 } compact={ true } color={ 'black' } />
					</Progress>
				</div>
			</div>
		</div>
	);
};

export default Scanning;
