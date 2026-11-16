/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { DeploymentStyleContext } from '../context';
import { WorkflowValidationWizard } from '../workflow-validation-wizard';
import type { WorkflowsValidation } from '../use-check-workflow-query';

const getWizard = ( workflowCheckResult?: WorkflowsValidation ) => (
	<Provider store={ configureStore()( {} ) }>
		<DeploymentStyleContext.Provider
			value={ {
				workflowCheckResult,
				isCheckingWorkflow: false,
				onWorkflowVerify: jest.fn(),
			} }
		>
			<WorkflowValidationWizard
				repository={ { owner: 'example', name: 'repository' } }
				branchName="trunk"
				workflow={ { file_name: 'deploy.yml', workflow_path: '.github/workflows/deploy.yml' } }
				validYamlFile="name: Deploy"
			/>
		</DeploymentStyleContext.Provider>
	</Provider>
);

describe( 'WorkflowValidationWizard', () => {
	test( 'does not show a result before checking the workflow', () => {
		render( getWizard() );

		expect( screen.queryByText( /is good to go!/ ) ).toBeNull();
		expect( screen.queryByText( /Please edit/ ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Verify workflow' } ) ).toBeEnabled();
	} );

	test( 'shows a success message for a valid workflow', () => {
		render( getWizard( { conclusion: 'success', checked_items: [] } ) );

		expect( screen.getByText( /is good to go!/ ) ).toBeVisible();
		expect( screen.queryByText( /Please edit/ ) ).toBeNull();
		expect( screen.getByRole( 'link', { name: /deploy.yml/ } ) ).toHaveAttribute(
			'href',
			'https://github.com/example/repository/blob/trunk/.github/workflows/deploy.yml'
		);
	} );

	test( 'asks the user to fix an invalid workflow', () => {
		render( getWizard( { conclusion: 'error', checked_items: [] } ) );

		expect( screen.getByText( /Please edit/ ) ).toBeVisible();
		expect( screen.queryByText( /is good to go!/ ) ).toBeNull();
	} );

	test( 'updates the message when a corrected workflow passes validation', () => {
		const { rerender } = render( getWizard( { conclusion: 'error', checked_items: [] } ) );

		rerender( getWizard( { conclusion: 'success', checked_items: [] } ) );

		expect( screen.getByText( /is good to go!/ ) ).toBeVisible();
		expect( screen.queryByText( /Please edit/ ) ).toBeNull();
	} );
} );
