import React from 'react';
import CaptureStep from './capture';
import ListStep from './list';
import ScanningStep from './scanning';
import './style.scss';

interface Props {
	stepName: string;
	goToStep: ( name: string ) => void;
}

export default function ImportOnboarding( props: Props ): React.ReactNode {
	return (
		<div className="import__onboarding-page">
			{ props.stepName === 'capture' && <CaptureStep goToStep={ props.goToStep } /> }
			{ props.stepName === 'scanning' && <ScanningStep goToStep={ props.goToStep } /> }
			{ props.stepName === 'list' && <ListStep /> }
		</div>
	);
}
