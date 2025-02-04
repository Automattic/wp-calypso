import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { CodeDeploymentData } from './use-code-deployments-query';

interface DeploymentStarterMessageProps {
	deployment: CodeDeploymentData;
}

export const DeploymentStarterMessage = ( { deployment }: DeploymentStarterMessageProps ) => {
	const { __ } = useI18n();

	const getManualDeploymentMessage = () => {
		if ( ! deployment.workflow_path ) {
			return __( 'Trigger a deployment from the menu.' );
		}

		const workflowName = deployment.workflow_path.replace( '.github/workflows/', '' );
		const workflowUrl = addQueryArgs(
			`https://github.com/${ deployment.repository_name }/actions/workflows/${ workflowName }`,
			{
				query: `branch=${ deployment.branch_name }`,
			}
		);

		const workflowLink = <a href={ workflowUrl } target="_blank" rel="noopener noreferrer" />;

		return createInterpolateElement(
			sprintf(
				// Translators: %(workflowName)s is the workflow file name from GitHub.
				__(
					'Make sure there is a successful run for ‘<workflowLink>%(workflowName)s</workflowLink>’, then trigger a deployment from the ellipsis menu.'
				),
				{
					workflowName,
				}
			),
			{
				workflowLink,
			}
		);
	};

	return (
		<td colSpan={ 4 } className="deployment-message">
			<i css={ { color: 'var(--Gray-Gray-40, #50575E)' } }>
				{ deployment.is_automated
					? sprintf(
							// Translators: %(branch)s is the branch name of the repository, %(repo)s is the repository name
							__(
								'Push something to the ‘%(branch)s’ branch of ‘%(repo)s’ or trigger a deployment from the menu.'
							),
							{
								branch: deployment.branch_name,
								repo: deployment.repository_name,
							}
					  )
					: getManualDeploymentMessage() }
			</i>
		</td>
	);
};
