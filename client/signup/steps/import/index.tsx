import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyPreviewStep, ReadyNotStep, ReadyStep } from './ready';
import { GoToStep } from './types';
import './style.scss';

interface Props {
	goToStep: GoToStep;
	stepName: string;
	stepSectionName: string;
	queryObject: {
		siteSlug?: string;
	};
}

const MOCK_DATA = {
	website: 'https://openweb.com',
	platform: 'Wix',
};

const shouldHideBackBtn = ( stepName: string, isScanning = false ): boolean => {
	const STEPS_WITHOUT_BACK = [ 'scanning' ];

	return STEPS_WITHOUT_BACK.includes( stepName ) || isScanning;
};

const shouldHideNextBtn = ( stepName: string, isScanning = false ): boolean => {
	const STEPS_WITH_NEXT = [ 'capture' ];

	return ! STEPS_WITH_NEXT.includes( stepName ) || isScanning;
};

export default function ImportOnboarding( props: Props ): React.ReactNode {
	const { __ } = useI18n();
	const [ isScanning, setIsScanning ] = React.useState( false );

	return (
		<StepWrapper
			flowName={ 'importer' }
			hideSkip={ true }
			hideBack={ shouldHideBackBtn( props.stepName, isScanning ) }
			hideNext={ shouldHideNextBtn( props.stepName, isScanning ) }
			nextLabelText={ __( "I don't have a site address" ) }
			allowBackFirstStep={ true }
			backUrl={ props.stepName === 'capture' ? getStepUrl( 'setup-site', 'intent' ) : undefined }
			hideFormattedHeader={ true }
			stepContent={
				<div className="import__onboarding-page">
					{ props.stepName === 'capture' && (
						<CaptureStep
							goToStep={ props.goToStep }
							isScanning={ isScanning }
							setIsScanning={ setIsScanning }
						/>
					) }
					{ props.stepName === 'list' && <ListStep goToStep={ props.goToStep } /> }

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
