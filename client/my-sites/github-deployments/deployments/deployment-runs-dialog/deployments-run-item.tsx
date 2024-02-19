import { useLocale } from '@automattic/i18n-utils';
import { DeploymentCommitDetails } from 'calypso/my-sites/github-deployments/deployments/deployment-commit-details';
import { DeploymentDuration } from 'calypso/my-sites/github-deployments/deployments/deployment-duration';
import {
	DeploymentStatus,
	DeploymentStatusValue,
} from 'calypso/my-sites/github-deployments/deployments/deployment-status';
import { formatDate } from 'calypso/my-sites/github-deployments/utils/dates';
import { CodeDeploymentData, DeploymentRun } from '../use-code-deployments-query';

interface DeploymentsListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsRunItem = ( { deployment }: DeploymentsListItemProps ) => {
	const locale = useLocale();
	const run = ( deployment.current_deployed_run ||
		deployment.current_deployment_run ) as DeploymentRun;

	return (
		<tr>
			<td>
				<DeploymentStatus status={ run.status as DeploymentStatusValue } />
			</td>

			<td>
				<DeploymentCommitDetails run={ run } deployment={ deployment } />
			</td>
			<td>
				<span>{ formatDate( locale, new Date( deployment.updated_on ) ) }</span>
			</td>
			<td>
				<DeploymentDuration run={ run } />
			</td>
		</tr>
	);
};
