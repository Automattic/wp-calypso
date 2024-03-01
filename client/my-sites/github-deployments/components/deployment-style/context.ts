import { createContext, useContext } from 'react';
import { WorkflowsValidation } from './use-check-workflow-query';

export type DeploymentStyleContextProps = {
	isCheckingWorkflow: boolean;
	onWorkflowVerify(): void;
	workflowCheckResult?: WorkflowsValidation;
};

export const DeploymentStyleContext = createContext< DeploymentStyleContextProps >( {
	isCheckingWorkflow: false,
	onWorkflowVerify() {},
	workflowCheckResult: undefined,
} );

export const useDeploymentStyleContext = () => {
	return useContext( DeploymentStyleContext );
};
