import type {
	BuildReportFormData,
	BuildReportState,
	UseDuplicateReportFormDataHandlers,
} from '../../../types';

export interface StepProps {
	formData: BuildReportFormData;
	state: BuildReportState;
	handlers: UseDuplicateReportFormDataHandlers;
}
