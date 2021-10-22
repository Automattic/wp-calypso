import React from 'react';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyStep, ReadyNotStep, ReadyNoUrlStep } from './ready';
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

export default function ImportOnboarding( props: Props ): React.ReactNode {
	return (
		<div className="import__onboarding-page">
			{ props.stepName === 'capture' && <CaptureStep goToStep={ props.goToStep } /> }
			{ props.stepName === 'scanning' && <ScanningStep goToStep={ props.goToStep } /> }
			{ props.stepName === 'list' && <ListStep /> }

			{ props.stepName === 'ready' && ! props.stepSectionName && (
				<ReadyNoUrlStep platform={ MOCK_DATA.platform } />
			) }
			{ props.stepName === 'ready' && props.stepSectionName === 'not' && <ReadyNotStep /> }
			{ props.stepName === 'ready' && props.stepSectionName === 'preview' && (
				<ReadyStep website={ MOCK_DATA.website } platform={ MOCK_DATA.platform } />
			) }
		</div>
	);
}
