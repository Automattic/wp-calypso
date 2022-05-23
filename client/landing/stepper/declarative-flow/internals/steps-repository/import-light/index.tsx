/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import Capture from 'calypso/blocks/import-light/capture';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const ImportLight: Step = function ImportStep( props ) {
	const { __ } = useI18n();
	const { navigation } = props;

	function renderStepContent() {
		return <Capture />;
	}

	return (
		<StepContainer
			stepName={ 'import-step' }
			className={ 'import__onboarding-page' }
			hideSkip={ false }
			hideFormattedHeader={ true }
			goBack={ navigation.goBack }
			goNext={ navigation.goNext }
			skipLabelText={ __( 'Skip this step' ) }
			isFullLayout={ true }
			stepContent={ renderStepContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImportLight;
