import { ProgressBar } from '@automattic/components';
import { Progress, Title, SubTitle, Hooray, NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';

import './style.scss';

interface Props {
	queryObject: {
		temp: string;
	};
}
const WixImporter: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { queryObject } = props;

	return (
		<div className={ classnames( 'import-layout__center' ) }>
			{ queryObject.temp === 'progress' && (
				<Progress>
					<Title>{ __( 'Importing' ) }...</Title>
					<ProgressBar color={ 'black' } compact={ true } value={ 33 } />
					<SubTitle>
						{ __( "This may take a few minutes. We'll notify you by email when it's done." ) }
					</SubTitle>
				</Progress>
			) }

			{ queryObject.temp === 'hooray' && (
				<Hooray>
					<Title>Hooray!</Title>
					<SubTitle>Congratulations. Your content was successfully imported.</SubTitle>
					<NextButton>View site</NextButton>
				</Hooray>
			) }
		</div>
	);
};

export default WixImporter;
