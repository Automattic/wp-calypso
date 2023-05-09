import type { Component } from 'react';

export interface ServerCredentialsFormProps {
	allowCancel?: any;
	allowDelete?: any;
	onCancel?: any;
	onComplete?: any;
	labels?: any;
	showAdvancedSettings?: any;
	toggleAdvancedSettings?: any;
	// The following are props for withServerCredentialsForm
	role: string;
	siteId?: number | null;
	siteUrl?: string;
	requirePath?: boolean;
	formIsSubmitting?: boolean;
	formSubmissionStatus?: string;
}

declare class ServerCredentialsForm extends Component< ServerCredentialsFormProps, any > {}

export default ServerCredentialsForm;
