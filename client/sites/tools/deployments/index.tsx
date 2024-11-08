import { GitHubDeploymentCreation } from './deployment-creation';
import { GitHubDeploymentManagement } from './deployment-management';
import { DeploymentRunsLogs as GitHubDeploymentRunLogs } from './deployment-run-logs';
import { GitHubDeployments } from './deployments';

import './style.scss';

export function Deployments() {
	return <GitHubDeployments />;
}

export function DeploymentCreation() {
	return <GitHubDeploymentCreation />;
}

export function DeploymentManagement( { codeDeploymentId }: { codeDeploymentId: number } ) {
	return <GitHubDeploymentManagement codeDeploymentId={ codeDeploymentId } />;
}

export function DeploymentRunLogs( { codeDeploymentId }: { codeDeploymentId: number } ) {
	return <GitHubDeploymentRunLogs codeDeploymentId={ codeDeploymentId } />;
}
