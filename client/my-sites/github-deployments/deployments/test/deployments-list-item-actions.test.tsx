/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { DeploymentsListItemActions } from '../deployments-list-item-actions';
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

const siteSlug = 'mysite.wpcomstaging.com';

describe( 'DeploymentsListItemActions', () => {
	test( 'lets the user trigger a manual deployment on simple connections', () => {
		const onManualDeployment = jest.fn();

		const { getByText, getByLabelText } = render(
			<DeploymentsListItemActions
				siteSlug={ siteSlug }
				deployment={ createDeployment( {
					workflow_path: undefined,
				} ) }
				onManualDeployment={ onManualDeployment }
				onDisconnectRepository={ jest.fn() }
			/>
		);

		fireEvent.click( getByLabelText( 'Deployment actions' ) );

		const triggerManualDeployButton = getByText( 'Trigger manual deployment' );

		expect( triggerManualDeployButton ).toBeInTheDocument();

		fireEvent.click( triggerManualDeployButton );
		expect( onManualDeployment ).toHaveBeenCalled();
	} );

	test( 'does not the user trigger a manual deployment on ineligible advanced connections', () => {
		const onManualDeployment = jest.fn();

		const { getByText, getByLabelText } = render(
			<DeploymentsListItemActions
				siteSlug={ siteSlug }
				deployment={ createDeployment( {
					workflow_path: '.github/workflows/workflow.yml',
				} ) }
				onManualDeployment={ onManualDeployment }
				onDisconnectRepository={ jest.fn() }
			/>
		);

		fireEvent.click( getByLabelText( 'Deployment actions' ) );

		const triggerManualDeployButton = getByText( 'Trigger manual deployment' );

		expect( triggerManualDeployButton ).toBeInTheDocument();

		fireEvent.click( triggerManualDeployButton );
		expect( onManualDeployment ).not.toHaveBeenCalled();
	} );

	test( 'lets the user trigger a manual deployment on eligible advanced connections', () => {
		const onManualDeployment = jest.fn();

		const { getByText, getByLabelText } = render(
			<DeploymentsListItemActions
				siteSlug={ siteSlug }
				deployment={ createDeployment( {
					workflow_path: '.github/workflows/workflow.yml',
					workflow_run_status: 'eligible',
				} ) }
				onManualDeployment={ onManualDeployment }
				onDisconnectRepository={ jest.fn() }
			/>
		);

		fireEvent.click( getByLabelText( 'Deployment actions' ) );

		const triggerManualDeployButton = getByText( 'Trigger manual deployment' );

		expect( triggerManualDeployButton ).toBeInTheDocument();

		fireEvent.click( triggerManualDeployButton );
		expect( onManualDeployment ).toHaveBeenCalled();
	} );
} );
