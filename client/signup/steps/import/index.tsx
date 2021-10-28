import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { isAnalyzing } from '../../../state/imports/url-analyzer/selectors';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyPreviewStep, ReadyNotStep, ReadyStep } from './ready';
import { GoToStep } from './types';
import './style.scss';

interface Props {
	goToStep: GoToStep;
	stepName: string;
	stepSectionName: string;
	isAnalyzing: boolean;
}

const MOCK_DATA = {
	website: 'https://openweb.com',
	platform: 'Wix',
};

const ImportOnboarding: React.FunctionComponent< Props > = ( {
	goToStep,
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
			hideFormattedHeader={ true }
			stepContent={
				<div className="import__onboarding-page">
					{ stepName === 'capture' && <CaptureStep goToStep={ goToStep } /> }
					{ stepName === 'list' && <ListStep /> }

					{ stepName === 'ready' && ! stepSectionName && (
						<ReadyStep platform={ MOCK_DATA.platform } />
					) }
					{ stepName === 'ready' && stepSectionName === 'not' && <ReadyNotStep /> }
					{ stepName === 'ready' && stepSectionName === 'preview' && <ReadyPreviewStep /> }
				</div>
			}
		/>
	);
};

export default connect(
	( state ) => ( {
		isAnalyzing: isAnalyzing( state ),
	} ),
	{}
)( ImportOnboarding );
