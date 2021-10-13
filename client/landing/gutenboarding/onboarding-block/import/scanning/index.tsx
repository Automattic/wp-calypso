import { Title, SubTitle } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import Spinner from './spinner';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const ScanningStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center">
			<div className="import__header scanning__header">
				<div className="import__heading import__heading-center">
					<Title>{ __( 'Scanning your site' ) }</Title>
					<SubTitle>{ __( "We'll be done in no time." ) }</SubTitle>
				</div>
			</div>

			<div className={ 'scanning__content' }>
				<Spinner />
			</div>
		</div>
	);
};

export default ScanningStep;
