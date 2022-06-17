import { ProgressBar } from '@automattic/components';
import { Title, SubTitle, Progress } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	website: string;
}
const Scanning: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { website } = props;

	return (
		<div className="import-layout__center import-light__scanning">
			<div className="import__heading-center">
				<Progress>
					<Title>{ __( 'Scanning your site' ) }</Title>
					<ProgressBar value={ 23 } compact={ true } />
					<SubTitle>{ website }</SubTitle>
				</Progress>
			</div>
		</div>
	);
};

export default Scanning;
