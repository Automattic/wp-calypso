import { ProgressBar } from '@automattic/components';
import { Title, SubTitle, Progress } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const Scanning: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center import-light__scanning">
			<div className="import__heading-center">
				<Progress>
					<Title>{ __( 'Scanning your site' ) }</Title>
					<ProgressBar value={ 23 } compact={ true } />
					<SubTitle>example.com</SubTitle>
				</Progress>
			</div>
		</div>
	);
};

export default Scanning;
