import { Title, SubTitle } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import type * as React from 'react';
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
					<LoadingEllipsis />
				</div>
			</div>
		</div>
	);
};

export default ScanningStep;
