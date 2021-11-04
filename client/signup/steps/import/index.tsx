import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { isAnalyzing } from '../../../state/imports/url-analyzer/selectors';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyPreviewStep, ReadyNotStep, ReadyStep } from './ready';
import { GoToNextStep, GoToStep } from './types';
import './style.scss';

type Props = ConnectedProps< typeof connector > & {
	goToStep: GoToStep;
	goToNextStep: GoToNextStep;
	stepName: string;
	stepSectionName: string;
	queryObject: {
		siteSlug?: string;
	};
};

const MOCK_DATA = {
	website: 'https://openweb.com',
	platform: 'wix',
};

const ImportOnboarding: React.FunctionComponent< Props > = ( {
	goToStep,
	goToNextStep,
	stepName,
	stepSectionName,
	isAnalyzing,
} ) => {
	const { __ } = useI18n();

	const shouldHideBackBtn = ( stepName: string ): boolean => {
		const STEPS_WITHOUT_BACK = [ 'scanning' ];
		return STEPS_WITHOUT_BACK.includes( stepName ) || isAnalyzing;
	};

	const shouldHideNextBtn = ( stepName: string ): boolean => {
		const STEPS_WITH_NEXT = [ 'capture' ];
		return ! STEPS_WITH_NEXT.includes( stepName ) || isAnalyzing;
	};

	return (
		<StepWrapper
			flowName={ 'importer' }
			hideSkip={ true }
			hideBack={ shouldHideBackBtn( stepName ) }
			hideNext={ shouldHideNextBtn( stepName ) }
			nextLabelText={ __( "I don't have a site address" ) }
			allowBackFirstStep={ true }
			backUrl={ stepName === 'capture' ? getStepUrl( 'setup-site', 'intent' ) : undefined }
			goToNextStep={ goToNextStep }
			hideFormattedHeader={ true }
			stepName={ stepName }
			stepContent={
				<div className="import__onboarding-page">
					{ stepName === 'capture' && <CaptureStep goToStep={ goToStep } /> }
					{ stepName === 'list' && <ListStep goToStep={ goToStep } /> }

					{ stepName === 'ready' && ! stepSectionName && (
						<ReadyStep platform={ MOCK_DATA.platform } />
					) }
					{ stepName === 'ready' && stepSectionName === 'not' && (
						<ReadyNotStep goToStep={ goToStep } />
					) }
					{ stepName === 'ready' && stepSectionName === 'preview' && <ReadyPreviewStep /> }
				</div>
			}
		/>
	);
};

const connector = connect(
	( state ) => ( {
		isAnalyzing: isAnalyzing( state ),
	} ),
	{}
);

export default connector( ImportOnboarding );
