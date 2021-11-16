import { ProgressBar } from '@automattic/components';
import { Progress, Title, SubTitle } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';

const WixImporter: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className={ classnames( 'import-layout__center' ) }>
			<Progress>
				<Title>{ __( 'Importing' ) }...</Title>
				<ProgressBar color={ 'black' } compact={ true } value={ 33 } />
				<SubTitle>
					{ __( "This may take a few minutes. We'll notify you by email when it's done." ) }
				</SubTitle>
			</Progress>
		</div>
	);
};

export default WixImporter;
