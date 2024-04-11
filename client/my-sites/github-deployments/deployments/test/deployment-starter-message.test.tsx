/**
 * @jest-environment jsdom
 */
import { render as testRenderer } from '@testing-library/react';
import { ReactNode } from 'react';
import { createDeployment } from '../../test-utils';
import { DeploymentStarterMessage } from '../deployment-starter-message';

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
			getByText(
				'Push something to the ‘trunk’ branch of ‘repository’ or trigger a deployment from the menu.'
			)
		).toBeInTheDocument();
	} );

	test( 'instructs the user to create a manual deployment for simple connections', () => {
		const { getByText } = render(
			<DeploymentStarterMessage
				deployment={ createDeployment( {
					is_automated: false,
				} ) }
			/>
		);

		expect( getByText( 'Trigger a deployment from the menu.' ) ).toBeInTheDocument();
	} );

	test( 'instructs the user to create a manual deployment for advanced connections', () => {
		const workflow_path = '.github/workflows/workflow.yml';

		const { getByText } = render(
			<DeploymentStarterMessage
				deployment={ createDeployment( {
					is_automated: false,
					workflow_path,
				} ) }
			/>
		);

		const element = getByText( 'Make sure there is a successful run', { exact: false } );

		expect( element ).toHaveTextContent(
			'Make sure there is a successful run for ‘workflow.yml’, then trigger a deployment from the ellipsis menu.'
		);
	} );
} );
