import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyPreviewStep, ReadyNotStep, ReadyStep } from './ready';
import ScanningStep from './scanning';
import { GoToStep } from './types';
import './style.scss';

interface Props {
	goToStep: GoToStep;
	stepName: string;
	stepSectionName: string;
}

const MOCK_DATA = {
	website: 'https://openweb.com',
	platform: 'Wix',
};

const shouldHideBackBtn = ( stepName: string ): boolean => {
	const STEPS_WITHOUT_BACK = [ 'scanning' ];

	return STEPS_WITHOUT_BACK.includes( stepName );
};

const shouldHideNextBtn = ( stepName: string ): boolean => {
	const STEPS_WITH_NEXT = [ 'capture' ];

	return ! STEPS_WITH_NEXT.includes( stepName );
};

export default function ImportOnboarding( props: Props ): React.ReactNode {
	const { __ } = useI18n();

	return (
		<StepWrapper
			flowName={ 'importer' }
			hideSkip={ true }
			hideBack={ shouldHideBackBtn( props.stepName ) }
			hideNext={ shouldHideNextBtn( props.stepName ) }
			nextLabelText={ __( "I don't have a site address" ) }
			allowBackFirstStep={ true }
			hideFormattedHeader={ true }
			stepContent={
				<div className="import__onboarding-page">
					{ props.stepName === 'capture' && <CaptureStep goToStep={ props.goToStep } /> }
					{ props.stepName === 'scanning' && <ScanningStep goToStep={ props.goToStep } /> }
					{ props.stepName === 'list' && <ListStep /> }

					{ props.stepName === 'ready' && ! props.stepSectionName && (
						<ReadyStep platform={ MOCK_DATA.platform } />
					) }
					{ props.stepName === 'ready' && props.stepSectionName === 'not' && <ReadyNotStep /> }
					{ props.stepName === 'ready' && props.stepSectionName === 'preview' && (
						<ReadyPreviewStep website={ MOCK_DATA.website } platform={ MOCK_DATA.platform } />
					) }
				</div>
			}
			{ ...props }
		/>
	);
}
