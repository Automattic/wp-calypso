import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { CodeDeploymentData } from './use-code-deployments-query';

type WorkflowRunStatus = 'in_progress' | 'eligible' | 'error';

interface WithWorkflowRunStatus {
	workflow_run_status?: WorkflowRunStatus;
}

interface DeploymentStarterMessageProps {
	deployment: CodeDeploymentData & WithWorkflowRunStatus;
}

export const DeploymentStarterMessage = ( { deployment }: DeploymentStarterMessageProps ) => {
	const { __ } = useI18n();

	const getManualDeploymentMessage = () => {
		if ( ! deployment.workflow_path ) {
			return __( 'Trigger a deployment from the ellipsis menu whenever you are ready.' );
		}

		const workflowName = deployment.workflow_path.replace( '.github/workflows/', '' );
		const workflowUrl = addQueryArgs(
			`https://github.com/${ deployment.repository_name }/actions/workflows/${ workflowName }`,
			{
				query: `branch=${ deployment.branch_name }`,
			}
		);

		const workflowLink = <a href={ workflowUrl } target="_blank" rel="noopener noreferrer" />;

		if ( ! deployment.workflow_run_status ) {
			return createInterpolateElement(
				sprintf(
					// Translators: %(workflowName)s is the workflow file name from GitHub.
					__(
						'Trigger a workflow run for ‘<workflowLink>%(workflowName)s</workflowLink>’. After it succeeds, you will be able to deploy the artifact to your site.'
					),
					{
						workflowName,
					}
				),
				{
					workflowLink,
				}
			);
		}

		if ( deployment.workflow_run_status === 'in_progress' ) {
			return createInterpolateElement(
				sprintf(
					// Translators: %(workflowName)s is the workflow file name from GitHub.
					__(
						'Workflow running for ‘<workflowLink>%(workflowName)s</workflowLink>’. You will be able to deploy the artifact to your site once it succeeds.'
					),
					{
						workflowName,
					}
				),
				{
					workflowLink,
				}
			);
		}

		if ( deployment.workflow_run_status === 'error' ) {
			return createInterpolateElement(
				sprintf(
					// Translators: %(workflowName)s is the workflow file name from GitHub.
					__(
						'Workflow run failed for ‘<workflowLink>%(workflowName)s</workflowLink>’. You will be able to deploy the artifact to your site once it succeeds.'
					),
					{
						workflowName,
					}
				),
				{
					workflowLink,
				}
			);
		}

		return createInterpolateElement(
			sprintf(
				// Translators: %(workflowName)s is the workflow file name from GitHub.
				__(
					'Workflow run for ‘<workflowLink>%(workflowName)s</workflowLink>’ succeeded! Trigger a deployment from the ellipsis menu whenever you are ready.'
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
		<td colSpan={ 4 }>
			<i css={ { color: 'var(--Gray-Gray-40, #50575E)' } }>
				{ deployment.is_automated
					? // Translators: %(branch)s is the branch name of the repository, %(repo)s is the repository name
					  sprintf( __( 'Push something to the ‘%(branch)s’ branch of ‘%(repo)s’.' ), {
							branch: deployment.branch_name,
							repo: deployment.repository_name,
					  } )
					: getManualDeploymentMessage() }
			</i>
		</td>
	);
};
