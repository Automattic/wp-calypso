import Step1Details from './steps/step-1-details';
import Step2Content from './steps/step-2-content';
import Step3Send from './steps/step-3-send';
import type {
	BuildReportFormData,
	BuildReportState,
	UseDuplicateReportFormDataHandlers,
} from '../../types';

interface BuildReportContentProps {
	currentStep: number;
	formData: BuildReportFormData;
	state: BuildReportState;
	handlers: UseDuplicateReportFormDataHandlers;
}

export default function BuildReportContent( { currentStep, ...props }: BuildReportContentProps ) {
	switch ( currentStep ) {
		case 1:
			return <Step1Details { ...props } />;
		case 2:
			return <Step2Content { ...props } />;
		case 3:
			return <Step3Send { ...props } />;
		default:
			return null;
	}
}
