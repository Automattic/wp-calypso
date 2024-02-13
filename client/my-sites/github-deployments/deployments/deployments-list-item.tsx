import { CodeDeploymentData } from 'calypso/my-sites/github-deployments/use-code-deployments-query';

interface GitHubRepositoryListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: GitHubRepositoryListItemProps ) => {
	return (
		<tr>
			<td>
				<div className="github-deployments-repository-list__account">
					{ deployment.repository_name }
				</div>
			</td>
			<td>
				<span>Last commit</span>
			</td>
			<td>
				<span>Status</span>
			</td>
			<td>
				<span>{ new Date( deployment.updated_on ).toLocaleDateString() }</span>
			</td>
			<td>
				<span>Duration</span>
			</td>
			<td>
				<span>...</span>
			</td>
		</tr>
	);
};
