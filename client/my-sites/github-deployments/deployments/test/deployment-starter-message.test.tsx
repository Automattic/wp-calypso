/**
 * @jest-environment jsdom
 */
import { render as testRenderer } from '@testing-library/react';
import { ReactNode } from 'react';
import { DeploymentStarterMessage } from '../deployment-starter-message';
import { CodeDeploymentData } from '../use-code-deployments-query';

const createDeployment = ( args?: Partial< CodeDeploymentData > ): CodeDeploymentData => ( {
	id: 1,
	blog_id: 1,
	branch_name: 'trunk',
	created_by: {
		id: 1,
		name: 'Luis Felipe Zaguini',
	},
	created_by_user_id: 1,
	created_on: new Date().toString(),
	external_repository_id: 1,
	installation_id: 1,
	is_automated: true,
	repository_name: 'repository',
	target_dir: '/',
	updated_on: new Date().toString(),
	...args,
} );

const render = ( element: ReactNode ) => {
	const tr = document.createElement( 'tr' );

	return testRenderer( element, { container: document.body.appendChild( tr ) } );
};

describe( 'DeploymentStarterMessage', () => {
	test( 'instructs the user to push something on automated deployments', () => {
		const { getByText } = render(
			<DeploymentStarterMessage
				deployment={ createDeployment( {
					repository_name: 'repository',
					branch_name: 'trunk',
					is_automated: true,
				} ) }
			/>
		);

		expect(
			getByText( 'Push something to the ‘trunk’ branch of ‘repository’.' )
		).toBeInTheDocument();
	} );

	test( 'instructs the user to push something on manual deployments on push', () => {
		const { getByText } = render(
			<DeploymentStarterMessage
				deployment={ createDeployment( {
					is_automated: false,
				} ) }
			/>
		);

		expect(
			getByText( 'Trigger a deployment from the ellipsis menu whenever you are ready.' )
		).toBeInTheDocument();
	} );

	describe( 'manual deployments on workflow run completion', () => {
		const workflow_path = '.github/workflows/workflow.yml';

		test( 'instructs the user to start a workflow run', () => {
			const { getByText } = render(
				<DeploymentStarterMessage
					deployment={ createDeployment( {
						is_automated: false,
						workflow_path,
					} ) }
				/>
			);

			const element = getByText( 'Trigger a workflow run', { exact: false } );

			expect( element ).toHaveTextContent(
				'Trigger a workflow run for ‘workflow.yml’. After it succeeds, you will be able to deploy the artifact to your site.'
			);
		} );

		test( 'tells the user to wait until the workflow run succeeds', () => {
			const { getByText } = render(
				<DeploymentStarterMessage
					deployment={ createDeployment( {
						is_automated: false,
						workflow_path,
						workflow_run_status: 'in_progress',
					} ) }
				/>
			);

			const element = getByText( 'Workflow running for', { exact: false } );

			expect( element ).toHaveTextContent(
				'Workflow running for ‘workflow.yml’. You will be able to deploy the artifact to your site once it succeeds.'
			);
		} );

		test( 'tells the user to that the workflow run failed and therefore they cannot manually deploy', () => {
			const { getByText } = render(
				<DeploymentStarterMessage
					deployment={ createDeployment( {
						is_automated: false,
						workflow_path,
						workflow_run_status: 'error',
					} ) }
				/>
			);

			const element = getByText( 'Workflow run failed for', { exact: false } );

			expect( element ).toHaveTextContent(
				'Workflow run failed for ‘workflow.yml’. You will be able to deploy the artifact to your site once it succeeds.'
			);
		} );

		test( 'instructs the user to start a manual deployment after the workflow run succeeded', () => {
			const { getByText } = render(
				<DeploymentStarterMessage
					deployment={ createDeployment( {
						is_automated: false,
						workflow_path,
						workflow_run_status: 'eligible',
					} ) }
				/>
			);

			const element = getByText( 'Workflow run for', { exact: false } );

			expect( element ).toHaveTextContent(
				'Workflow run for ‘workflow.yml’ succeeded! Trigger a deployment from the ellipsis menu whenever you are ready.'
			);
		} );
	} );
} );
