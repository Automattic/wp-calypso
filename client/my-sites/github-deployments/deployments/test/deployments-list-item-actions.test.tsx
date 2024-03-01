/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { createDeployment, createDeploymentRun } from '../../test-utils';
import { DeploymentsListItemActions } from '../deployments-list-item-actions';

const siteSlug = 'mysite.wpcomstaging.com';

describe( 'DeploymentsListItemActions', () => {
	test( 'does not let the user see logs if there are no runs', () => {
		const onManualDeployment = jest.fn();

		const { getByText, getByLabelText } = render(
			<DeploymentsListItemActions
				siteSlug={ siteSlug }
				deployment={ createDeployment() }
				onManualDeployment={ onManualDeployment }
				onDisconnectRepository={ jest.fn() }
			/>
		);

		fireEvent.click( getByLabelText( 'Deployment actions' ) );

		const triggerManualDeployButton = getByText( 'See deployment runs' );

		expect( triggerManualDeployButton ).toBeInTheDocument();
		expect( triggerManualDeployButton.parentElement ).toBeDisabled();
	} );

	test( 'lets the user see logs if there is at least one run', () => {
		const onManualDeployment = jest.fn();

		const { getByText, getByLabelText } = render(
			<DeploymentsListItemActions
				siteSlug={ siteSlug }
				deployment={ createDeployment( {
					current_deployment_run: createDeploymentRun(),
				} ) }
				onManualDeployment={ onManualDeployment }
				onDisconnectRepository={ jest.fn() }
			/>
		);

		fireEvent.click( getByLabelText( 'Deployment actions' ) );

		const triggerManualDeployButton = getByText( 'See deployment runs' );

		expect( triggerManualDeployButton ).toBeInTheDocument();
		expect( triggerManualDeployButton.parentElement ).not.toBeDisabled();
	} );
} );
