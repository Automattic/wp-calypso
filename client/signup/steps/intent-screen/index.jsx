import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import Intents from './intents';

const IntentScreen = ( props ) => {
	const { __ } = useI18n();
	const headerText = __( 'Where will you start?' );
	const subHeaderText = __( 'You can change your mind at any time.' );

	return (
		<StepWrapper
			fallbackHeaderText={ headerText }
			headerText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
			subHeaderText={ subHeaderText }
			stepContent={ <Intents siteSlug={ props.signupDependencies.siteSlug } /> }
			align={ 'center' }
			hideSkip
			{ ...props }
		/>
	);
};

export default IntentScreen;
