import { DeploymentStatusValue } from 'calypso/my-sites/github-deployments/deployments/deployment-status';
import { DeploymentRun } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';

export function getDeploymentDetails( deployment?: DeploymentRun ) {
	let message = '';
	let sha = '';
	let shaShort = '';
	let duration = '';
	let status: DeploymentStatusValue | undefined;
	if ( deployment ) {
		sha = deployment.metadata.commit_sha;
		shaShort = sha.substring( sha.length - 7 );
		duration = deployment.completed_on
			? formatDuration(
					Date.parse( deployment.completed_on ) - Date.parse( deployment.created_on )
			  )
			: '';
		message = 'Commit message';
		status = deployment.status as DeploymentStatusValue;
	}

	return { message, sha, shaShort, status, duration };
}
